// js/trips.js

async function createTrip({ name, description, startDate, endDate, currency, createdBy, creatorName, creatorEmail }) {
  const tripRef = db.collection('trips').doc();
  const tripId = tripRef.id;
  
  const displayName = creatorName || (creatorEmail ? creatorEmail.split('@')[0] : 'Admin');
  const email = creatorEmail || '';
  
  const members = {};
  members[createdBy] = {
    name: displayName,
    email: email,
    role: 'admin',
    joinedAt: nowTimestamp()
  };

  await tripRef.set({
    name: name || 'New Trip',
    description: description || '',
    startDate: startDate || '',
    endDate: endDate || '',
    currency: currency || 'MYR',
    createdBy: createdBy,
    createdAt: nowTimestamp(),
    status: 'active',
    members: members,
    memberUids: [createdBy],
    pendingInvites: []
  });

  return tripId;
}

async function getTrip(tripId) {
  const doc = await db.collection('trips').doc(tripId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

function listenUserTrips(uid, email, callback) {
  return db.collection('trips')
    .where('memberUids', 'array-contains', uid)
    .onSnapshot(async (snapshot) => {
      const trips = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        let balance = { paid: 0, owed: 0, net: 0 };
        
        // compute user's balance
        const expensesSnap = await db.collection('trips').doc(doc.id).collection('expenses').get();
        const expenses = expensesSnap.docs.map(e => ({ id: e.id, ...e.data() }));
        if (typeof getUserBalance === 'function') {
          balance = getUserBalance(uid, expenses);
        }
        
        trips.push({ id: doc.id, ...data, balance });
      }
      callback(trips);
    });
}

async function inviteMember(tripId, rawEmail) {
  const tripRef = db.collection('trips').doc(tripId);
  const cleanEmail = (rawEmail || '').toLowerCase().trim();
  if (!cleanEmail) return { found: false };

  const usersSnap = await db.collection('users').where('email', '==', cleanEmail).get();
  
  if (!usersSnap.empty) {
    // User exists in Firestore users collection, add to trip members directly
    const userDoc = usersSnap.docs[0];
    const userData = userDoc.data();
    const uid = userDoc.id;
    
    await tripRef.update({
      [`members.${uid}`]: {
        name: userData.name || userData.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'member',
        joinedAt: nowTimestamp()
      },
      memberUids: firebase.firestore.FieldValue.arrayUnion(uid)
    });
    return { found: true };
  } else {
    // User not in Firestore users collection yet (has not logged into web app)
    await tripRef.update({
      pendingInvites: firebase.firestore.FieldValue.arrayUnion(cleanEmail)
    });
    return { found: false };
  }
}

async function removeMember(tripId, uid) {
  const tripRef = db.collection('trips').doc(tripId);
  await tripRef.update({
    [`members.${uid}`]: firebase.firestore.FieldValue.delete(),
    memberUids: firebase.firestore.FieldValue.arrayRemove(uid)
  });
}

async function deleteTrip(tripId) {
  // Delete all expenses first
  const expensesSnap = await db.collection('trips').doc(tripId).collection('expenses').get();
  const batch = db.batch();
  expensesSnap.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  // Delete trip doc
  batch.delete(db.collection('trips').doc(tripId));
  await batch.commit();
}

async function archiveTrip(tripId) {
  await db.collection('trips').doc(tripId).update({
    status: 'archived'
  });
}

async function checkPendingInvites(email, uid, name) {
  if (!email || !uid) return;
  const cleanEmail = email.toLowerCase().trim();
  const emailPrefix = cleanEmail.split('@')[0];

  try {
    const tripsSnap = await db.collection('trips').get();
    if (tripsSnap.empty) return;

    for (const doc of tripsSnap.docs) {
      const tripId = doc.id;
      const tripData = doc.data();
      const members = tripData.members || {};
      const memberUids = tripData.memberUids || [];
      const pendingInvites = (tripData.pendingInvites || []).map(e => (e || '').toLowerCase().trim());

      // If user is already a real member of this trip, skip
      if (memberUids.includes(uid)) continue;

      const inPendingInvites = pendingInvites.includes(cleanEmail);
      let placeholderId = null;

      Object.entries(members).forEach(([mId, mData]) => {
        if (!mData) return;
        // A member is ONLY a placeholder if they are NOT in memberUids array or marked as placeholder
        const isPlaceholder = mData.isPlaceholder || mId.startsWith('p_') || !memberUids.includes(mId);

        if (isPlaceholder) {
          const mEmail = (mData.email || '').toLowerCase().trim();
          const mName  = (mData.name || '').toLowerCase().trim();
          if (mEmail && mEmail === cleanEmail) {
            placeholderId = mId;
          } else if (mName && (mName === cleanEmail || mName === emailPrefix)) {
            placeholderId = mId;
          }
        }
      });

      if (placeholderId) {
        await linkPlaceholderMember(tripId, placeholderId, uid, cleanEmail, name);
        if (inPendingInvites) {
          await db.collection('trips').doc(tripId).update({
            pendingInvites: firebase.firestore.FieldValue.arrayRemove(cleanEmail)
          });
        }
      } else if (inPendingInvites) {
        await db.collection('trips').doc(tripId).update({
          [`members.${uid}`]: {
            name: name || emailPrefix,
            email: cleanEmail,
            role: 'member',
            joinedAt: nowTimestamp()
          },
          memberUids: firebase.firestore.FieldValue.arrayUnion(uid),
          pendingInvites: firebase.firestore.FieldValue.arrayRemove(cleanEmail)
        });
      }
    }
  } catch (err) {
    console.error('Error in checkPendingInvites:', err);
  }
}

async function addPlaceholderMember(tripId, name, email = '') {
  const tripRef = db.collection('trips').doc(tripId);
  const placeholderId = 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  const cleanEmail = email ? email.toLowerCase().trim() : '';

  const memberData = {
    name: name.trim(),
    email: cleanEmail,
    role: 'member',
    isPlaceholder: true,
    joinedAt: nowTimestamp()
  };

  const updateData = {
    [`members.${placeholderId}`]: memberData
  };

  if (cleanEmail) {
    updateData.pendingInvites = firebase.firestore.FieldValue.arrayUnion(cleanEmail);
  }

  await tripRef.update(updateData);
  return placeholderId;
}

async function updatePlaceholderMember(tripId, placeholderId, name, email = '') {
  const tripRef = db.collection('trips').doc(tripId);
  const cleanEmail = email ? email.toLowerCase().trim() : '';

  const updates = {
    [`members.${placeholderId}.name`]: name.trim()
  };
  if (cleanEmail !== undefined) {
    updates[`members.${placeholderId}.email`] = cleanEmail;
    // Keep pendingInvites in sync if email changed
    if (cleanEmail) {
      updates.pendingInvites = firebase.firestore.FieldValue.arrayUnion(cleanEmail);
    }
  }
  await tripRef.update(updates);
}

async function linkPlaceholderMember(tripId, placeholderId, realUid, realEmail, realName) {
  const tripRef = db.collection('trips').doc(tripId);
  const tripDoc = await tripRef.get();
  if (!tripDoc.exists) return;
  const tripData = tripDoc.data();
  const existingMember = (tripData.members && tripData.members[placeholderId]) || {};

  const name = realName || existingMember.name || 'Member';
  const email = realEmail || existingMember.email || '';

  // Batch update member map and replace placeholder in expenses
  const batch = db.batch();
  batch.update(tripRef, {
    [`members.${realUid}`]: {
      name: name,
      email: email,
      role: existingMember.role || 'member',
      joinedAt: existingMember.joinedAt || nowTimestamp()
    },
    [`members.${placeholderId}`]: firebase.firestore.FieldValue.delete(),
    memberUids: firebase.firestore.FieldValue.arrayUnion(realUid)
  });

  // Re-link expenses where paidBy or splits referenced placeholderId
  const expensesSnap = await tripRef.collection('expenses').get();
  expensesSnap.forEach(doc => {
    const expData = doc.data();
    let updated = false;
    const expUpdates = {};

    if (expData.paidBy === placeholderId) {
      expUpdates.paidBy = realUid;
      updated = true;
    }

    if (expData.splits && expData.splits[placeholderId] !== undefined) {
      const newSplits = { ...expData.splits };
      newSplits[realUid] = newSplits[placeholderId];
      delete newSplits[placeholderId];
      expUpdates.splits = newSplits;
      updated = true;
    }

    if (updated) {
      batch.update(doc.ref, expUpdates);
    }
  });

  await batch.commit();
}

async function updateTripDetails(tripId, { name, description, startDate, endDate, currency }) {
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (startDate !== undefined) updates.startDate = startDate;
  if (endDate !== undefined) updates.endDate = endDate;
  if (currency !== undefined) updates.currency = currency;
  updates.updatedAt = nowTimestamp();

  await db.collection('trips').doc(tripId).update(updates);
}

function listenTripExpenses(tripId, callback) {
  return db.collection('trips').doc(tripId).collection('expenses')
    .orderBy('date', 'desc')
    .onSnapshot(snapshot => {
      const expenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(expenses);
    });
}

async function getTripMembers(tripId) {
  const doc = await db.collection('trips').doc(tripId).get();
  if (doc.exists) {
    return doc.data().members || {};
  }
  return {};
}


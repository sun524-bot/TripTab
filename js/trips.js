// js/trips.js

function normalizeEmail(value) {
  return (value || '').toLowerCase().trim();
}

function getMatchingPlaceholderIds(members, memberUids, email) {
  const normalizedEmail = normalizeEmail(email);
  const ids = [];

  Object.entries(members || {}).forEach(([memberId, memberData]) => {
    if (!memberData) return;
    const isPlaceholder = memberData.isPlaceholder || memberId.startsWith('p_') || !memberUids.includes(memberId);
    if (!isPlaceholder) return;
    if (normalizeEmail(memberData.email) === normalizedEmail) {
      ids.push(memberId);
    }
  });

  return ids;
}

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
    .onSnapshot((snapshot) => {
      const trips = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.status === 'archived') return;
        trips.push({
          id: doc.id,
          ...data,
          status: data.status || 'active',
          balance: { paid: 0, owed: 0, net: 0 }
        });
      });

      // Synchronously render trips on dashboard immediately
      callback(trips);

      // Asynchronously load subcollection balances from cache/network without blocking UI
      snapshot.docs.forEach(async (doc) => {
        try {
          const expSnap = await db.collection('trips').doc(doc.id).collection('expenses').get({ source: 'cache' }).catch(() => {
            return db.collection('trips').doc(doc.id).collection('expenses').get();
          });
          const expenses = expSnap.docs.map(e => ({ id: e.id, ...e.data() }));
          const targetTrip = trips.find(t => t.id === doc.id);
          if (targetTrip && typeof getUserBalance === 'function') {
            targetTrip.balance = getUserBalance(uid, expenses);
            callback([...trips]);
          }
        } catch (err) {
          console.warn('[Offline Mode] Non-blocking balance update skipped:', err);
        }
      });
    }, (err) => {
      console.warn('[Offline Mode] listenUserTrips snapshot error:', err);
    });
}

async function inviteMember(tripId, rawEmail) {
  const tripRef = db.collection('trips').doc(tripId);
  const cleanEmail = normalizeEmail(rawEmail);
  if (!cleanEmail) return { found: false };

  const tripDoc = await tripRef.get();
  const tripData = tripDoc.exists ? tripDoc.data() : {};
  const members = tripData.members || {};
  const memberUids = tripData.memberUids || [];

  let usersSnap = null;
  try {
    usersSnap = await db.collection('users').where('email', '==', cleanEmail).get();
  } catch (err) {
    console.warn('[Offline Mode] Users query skipped while offline:', err);
  }

  if (usersSnap && !usersSnap.empty) {
    const userDoc = usersSnap.docs[0];
    const userData = userDoc.data();
    const uid = userDoc.id;

    const updates = {
      [`members.${uid}`]: {
        name: userData.name || userData.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'member',
        joinedAt: nowTimestamp()
      },
      memberUids: firebase.firestore.FieldValue.arrayUnion(uid),
      pendingInvites: firebase.firestore.FieldValue.arrayRemove(cleanEmail)
    };

    getMatchingPlaceholderIds(members, memberUids, cleanEmail).forEach((memberId) => {
      updates[`members.${memberId}`] = firebase.firestore.FieldValue.delete();
    });

    await tripRef.update(updates);
    return { found: true };
  }

  const existingPlaceholderId = Object.entries(members).find(([memberId, memberData]) => {
    if (!memberData) return false;
    const isPlaceholder = memberData.isPlaceholder || memberId.startsWith('p_') || !memberUids.includes(memberId);
    if (!isPlaceholder) return false;
    return normalizeEmail(memberData.email) === cleanEmail;
  })?.[0];

  if (existingPlaceholderId) {
    await tripRef.update({
      [`members.${existingPlaceholderId}.email`]: cleanEmail,
      pendingInvites: firebase.firestore.FieldValue.arrayUnion(cleanEmail)
    });
    return { found: false, existingPlaceholder: true, placeholderId: existingPlaceholderId };
  }

  await tripRef.update({
    pendingInvites: firebase.firestore.FieldValue.arrayUnion(cleanEmail)
  });
  return { found: false, existingPlaceholder: false, placeholderId: null };
}

async function removeMember(tripId, uid) {
  const tripRef = db.collection('trips').doc(tripId);
  await tripRef.update({
    [`members.${uid}`]: firebase.firestore.FieldValue.delete(),
    memberUids: firebase.firestore.FieldValue.arrayRemove(uid)
  });
}

async function deleteTrip(tripId, uid) {
  console.log('[deleteTrip] Starting. tripId:', tripId, 'uid:', uid);

  if (!tripId) throw new Error('No trip ID provided.');
  if (!uid) throw new Error('No user ID provided. Are you logged in?');

  const tripRef = db.collection('trips').doc(tripId);
  const tripDoc = await tripRef.get();
  console.log('[deleteTrip] Trip doc exists:', tripDoc.exists);

  if (!tripDoc.exists) {
    throw new Error('Trip not found');
  }

  const tripData = tripDoc.data() || {};
  console.log('[deleteTrip] createdBy:', tripData.createdBy, 'uid:', uid, 'memberRole:', tripData.members?.[uid]?.role);

  const isAdmin = tripData.createdBy === uid || tripData.members?.[uid]?.role === 'admin';
  if (!isAdmin) {
    throw new Error('You do not have permission to delete this trip.');
  }

  // Step 1: Best-effort subcollection cleanup WHILE trip still exists (rules can evaluate)
  try {
    const [expensesSnap, settlementsSnap] = await Promise.all([
      db.collection('trips').doc(tripId).collection('expenses').get(),
      db.collection('trips').doc(tripId).collection('settlements').get()
    ]);

    const docsToDelete = [
      ...expensesSnap.docs.map(d => d.ref),
      ...settlementsSnap.docs.map(d => d.ref)
    ];

    console.log('[deleteTrip] Cleaning up', docsToDelete.length, 'subcollection docs...');

    if (docsToDelete.length > 0) {
      const CHUNK_SIZE = 499;
      for (let i = 0; i < docsToDelete.length; i += CHUNK_SIZE) {
        const chunk = docsToDelete.slice(i, i + CHUNK_SIZE);
        const batch = db.batch();
        chunk.forEach(ref => batch.delete(ref));
        await batch.commit();
      }
      console.log('[deleteTrip] Subcollection cleanup complete.');
    } else {
      console.log('[deleteTrip] No subcollection docs to clean up.');
    }
  } catch (cleanupErr) {
    // Non-fatal: proceed to delete the trip document anyway
    console.warn('[deleteTrip] Subcollection cleanup failed (non-fatal):', cleanupErr);
  }

  // Step 2: Delete the trip document — removes it from dashboard & Firebase
  console.log('[deleteTrip] Deleting trip document...');
  await tripRef.delete();
  console.log('[deleteTrip] Trip document deleted successfully.');
}


async function archiveTrip(tripId) {
  await db.collection('trips').doc(tripId).update({
    status: 'archived'
  });
}

async function checkPendingInvites(email, uid, name) {
  if (!email || !uid) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  const cleanEmail = normalizeEmail(email);
  const emailPrefix = cleanEmail.split('@')[0];

  try {
    const pendingTripsSnap = await db.collection('trips')
      .where('pendingInvites', 'array-contains', cleanEmail)
      .get();

    const processedTripIds = new Set();

    for (const doc of pendingTripsSnap.docs) {
      processedTripIds.add(doc.id);
      const tripData = doc.data();
      const tripId = doc.id;
      const memberUids = tripData.memberUids || [];
      if (memberUids.includes(uid)) continue;

      const updates = {
        [`members.${uid}`]: {
          name: name || emailPrefix,
          email: cleanEmail,
          role: 'member',
          joinedAt: nowTimestamp()
        },
        memberUids: firebase.firestore.FieldValue.arrayUnion(uid),
        pendingInvites: firebase.firestore.FieldValue.arrayRemove(cleanEmail)
      };

      getMatchingPlaceholderIds(tripData.members || {}, memberUids, cleanEmail).forEach((memberId) => {
        updates[`members.${memberId}`] = firebase.firestore.FieldValue.delete();
      });

      await db.collection('trips').doc(tripId).update(updates);
    }

    const tripsSnap = await db.collection('trips').get();
    if (tripsSnap.empty) return;

    for (const doc of tripsSnap.docs) {
      if (processedTripIds.has(doc.id)) continue;

      const tripId = doc.id;
      const tripData = doc.data();
      const members = tripData.members || {};
      const memberUids = tripData.memberUids || [];

      // If user is already a real member of this trip, skip
      if (memberUids.includes(uid)) continue;

      let placeholderId = null;

      Object.entries(members).forEach(([mId, mData]) => {
        if (!mData) return;
        const isPlaceholder = mData.isPlaceholder || mId.startsWith('p_') || !memberUids.includes(mId);

        if (!isPlaceholder) return;

        const mEmail = normalizeEmail(mData.email);
        const mName  = normalizeEmail(mData.name);

        if (mEmail && mEmail === cleanEmail) {
          placeholderId = mId;
        } else if (mName) {
          const isNameExact = mName === cleanEmail || mName === emailPrefix;
          const isNameSub = (emailPrefix.length >= 3 && mName.includes(emailPrefix)) ||
                            (mName.length >= 3 && emailPrefix.includes(mName));
          if (isNameExact || isNameSub) {
            placeholderId = mId;
          }
        }
      });

      if (placeholderId) {
        await linkPlaceholderMember(tripId, placeholderId, uid, cleanEmail, name);
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
  const updates = {
    [`members.${realUid}`]: {
      name: name,
      email: email,
      role: existingMember.role || 'member',
      joinedAt: existingMember.joinedAt || nowTimestamp()
    },
    [`members.${placeholderId}`]: firebase.firestore.FieldValue.delete(),
    memberUids: firebase.firestore.FieldValue.arrayUnion(realUid),
    pendingInvites: firebase.firestore.FieldValue.arrayRemove(email)
  };

  Object.entries(tripData.members || {}).forEach(([memberId, memberData]) => {
    if (!memberData) return;
    const isPlaceholder = memberData.isPlaceholder || memberId.startsWith('p_') || !tripData.memberUids?.includes(memberId);
    if (!isPlaceholder) return;
    if (normalizeEmail(memberData.email) === normalizeEmail(email) && memberId !== placeholderId) {
      updates[`members.${memberId}`] = firebase.firestore.FieldValue.delete();
    }
  });

  batch.update(tripRef, updates);

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
    }, (err) => {
      console.warn('[Offline Mode] listenTripExpenses snapshot error:', err);
    });
}

async function getTripMembers(tripId) {
  const doc = await db.collection('trips').doc(tripId).get();
  if (doc.exists) {
    return doc.data().members || {};
  }
  return {};
}


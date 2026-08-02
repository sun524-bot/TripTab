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

async function inviteMember(tripId, email) {
  const tripRef = db.collection('trips').doc(tripId);
  const usersSnap = await db.collection('users').where('email', '==', email).get();
  
  if (!usersSnap.empty) {
    // User exists, add to trip members
    const userDoc = usersSnap.docs[0];
    const userData = userDoc.data();
    const uid = userDoc.id;
    
    await tripRef.update({
      [`members.${uid}`]: {
        name: userData.name,
        email: userData.email,
        role: 'member',
        joinedAt: nowTimestamp()
      },
      memberUids: firebase.firestore.FieldValue.arrayUnion(uid)
    });
    return { found: true };
  } else {
    // User not found, add to pending invites
    await tripRef.update({
      pendingInvites: firebase.firestore.FieldValue.arrayUnion(email)
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
  const tripsSnap = await db.collection('trips')
    .where('pendingInvites', 'array-contains', cleanEmail)
    .get();

  if (tripsSnap.empty) return;

  const batch = db.batch();
  tripsSnap.forEach(doc => {
    const tripRef = doc.ref;
    batch.update(tripRef, {
      [`members.${uid}`]: {
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'member',
        joinedAt: nowTimestamp()
      },
      memberUids: firebase.firestore.FieldValue.arrayUnion(uid),
      pendingInvites: firebase.firestore.FieldValue.arrayRemove(cleanEmail)
    });
  });
  
  await batch.commit();
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

// ================================================================
//  TripTab — Firebase Configuration
//  Project: triptab-bce3e | Region: asia-southeast1 (Singapore)
// ================================================================

const firebaseConfig = {
  apiKey: "AIzaSyCYCeeNKgZ1I5iw3ht5RWOB4ilN7aNJy1M",
  authDomain: "triptab-bce3e.firebaseapp.com",
  projectId: "triptab-bce3e",
  storageBucket: "triptab-bce3e.firebasestorage.app",
  messagingSenderId: "936109788351",
  appId: "1:936109788351:web:dcd3143563821d201c8a0a"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Expose globally
const db   = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// Convenience helper — used throughout trips.js, expenses.js, auth.js
function nowTimestamp() {
  return firebase.firestore.FieldValue.serverTimestamp();
}

// Enable offline persistence (works even without internet)
db.enablePersistence({ synchronizeTabs: true }).catch(err => {
  if (err.code === 'failed-precondition') {
    console.warn('TripTab: Multiple tabs open — falling back to single-tab persistence.');
    db.enablePersistence().catch(e => console.warn('TripTab persistence fallback error:', e));
  } else if (err.code === 'unimplemented') {
    console.warn('TripTab: Browser does not support offline mode.');
  }
});

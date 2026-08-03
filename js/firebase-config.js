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

// Enable offline persistence only in supported browser contexts.
function initFirestorePersistence() {
  const isSupportedBrowser = typeof window !== 'undefined' && typeof indexedDB !== 'undefined' && location.protocol !== 'file:';
  const isGitHubPagesHost = typeof location !== 'undefined' && /github\.io|pages\.dev/i.test(location.hostname);

  if (!isSupportedBrowser) return;
  if (isGitHubPagesHost) {
    console.warn('TripTab: Skipping Firestore persistence on GitHub Pages to avoid stale mobile cache behavior.');
    return;
  }

  db.enablePersistence({ synchronizeTabs: true }).catch(err => {
    if (err.code === 'failed-precondition') {
      console.warn('TripTab: Multiple tabs open — falling back to single-tab persistence.');
      db.enablePersistence().catch(e => console.warn('TripTab persistence fallback error:', e));
    } else if (err.code === 'unimplemented') {
      console.warn('TripTab: Browser does not support offline mode.');
    } else {
      console.warn('TripTab: Firestore persistence not enabled:', err?.message || err);
    }
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('load', initFirestorePersistence);
}

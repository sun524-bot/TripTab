// js/auth.js

function getErrorMessage(error) {
  switch (error.code) {
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return (typeof i18n !== 'undefined' && i18n.t('auth.error.invalidCreds')) || 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return (typeof i18n !== 'undefined' && i18n.t('auth.error.emailInUse')) || 'Email already in use.';
    case 'auth/weak-password':
      return (typeof i18n !== 'undefined' && i18n.t('auth.error.weakPassword')) || 'Password is too weak.';
    default:
      return error.message;
  }
}

async function registerUser(name, email, password) {
  const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
  const user = userCredential.user;
  
  await user.updateProfile({ displayName: name });
  
  await firebase.firestore().collection('users').doc(user.uid).set({
    name: name,
    email: email.toLowerCase(),
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  if (typeof checkPendingInvites === 'function') {
    try {
      await checkPendingInvites(email.toLowerCase(), user.uid, name);
    } catch (e) {
      console.warn("Error checking pending invites:", e);
    }
  }
  return user;
}

async function loginWithEmail(email, password) {
  const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
  const user = userCredential.user;
  const cleanEmail = (user.email || email).toLowerCase();
  const displayName = user.displayName || cleanEmail.split('@')[0];

  // Ensure user profile exists in Firestore (created via Firebase Console won't have one)
  const userRef = firebase.firestore().collection('users').doc(user.uid);
  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    await userRef.set({
      name: displayName,
      email: cleanEmail,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } else {
    // Keep email in sync in case it changed
    await userRef.update({ email: cleanEmail });
  }

  // Link any pending trip invites to this account
  if (typeof checkPendingInvites === 'function') {
    try {
      await checkPendingInvites(cleanEmail, user.uid, displayName);
    } catch (e) {
      console.warn('Error checking pending invites:', e);
    }
  }
  return user;
}

async function initLoginPage() {
  if (typeof requireAuth !== 'undefined') {
    // Redirect to dashboard if logged in
    requireAuth('dashboard.html', true); 
  }

  const form = qs('#login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = qs('#email').value.trim();
    const password = qs('#password').value;

    try {
      setLoading(true);
      await loginWithEmail(email, password);
      goTo('dashboard.html');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  });
}

async function initRegisterPage() {
  if (typeof requireAuth !== 'undefined') {
    requireAuth('dashboard.html', true);
  }

  const form = qs('#register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = qs('#name').value;
    const email = qs('#email').value;
    const password = qs('#password').value;

    try {
      setLoading(true);
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      await user.updateProfile({ displayName: name });
      
      await db.collection('users').doc(user.uid).set({
        name,
        email,
        createdAt: nowTimestamp()
      });

      // Check for pending trip invites by email
      if (typeof checkPendingInvites === 'function') {
        await checkPendingInvites(email, user.uid, name);
      }

      goTo('dashboard.html');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  });
}

async function initForgotPage() {
  if (typeof requireAuth !== 'undefined') {
    requireAuth('dashboard.html', true);
  }

  const form = qs('#forgot-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = qs('#email').value;

    try {
      setLoading(true);
      await auth.sendPasswordResetEmail(email);
      showToast(i18n.t('auth.resetSent') || 'Password reset email sent. Please check your inbox.', 'success');
      setTimeout(() => goTo('login.html'), 2000);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  });
}

function logout() {
  auth.signOut().then(() => {
    goTo('login.html');
  }).catch((error) => {
    showToast(getErrorMessage(error), 'error');
  });
}

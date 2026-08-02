// js/auth.js

function getErrorMessage(error) {
  switch (error.code) {
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return i18n.t('auth.error.invalidCreds') || 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return i18n.t('auth.error.emailInUse') || 'Email already in use.';
    case 'auth/weak-password':
      return i18n.t('auth.error.weakPassword') || 'Password is too weak.';
    default:
      return error.message;
  }
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
    const email = qs('#email').value;
    const password = qs('#password').value;

    try {
      setLoading(true);
      await auth.signInWithEmailAndPassword(email, password);
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

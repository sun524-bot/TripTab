// ================================================================
//  TripTab — Utilities
// ================================================================

// ----------------------------------------------------------------
//  Currency / Number Formatting
// ----------------------------------------------------------------
function formatCurrency(amount, currency = 'MYR') {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function formatAmount(amount) {
  return Number(amount).toFixed(2);
}

function parseAmount(str) {
  const n = parseFloat(str);
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ----------------------------------------------------------------
//  Date Formatting
// ----------------------------------------------------------------
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

function formatDateRange(start, end) {
  if (!start) return '';
  if (!end || start === end) return formatDate(start);
  return `${formatDateShort(start)} – ${formatDate(end)}`;
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function greetingKey() {
  const h = new Date().getHours();
  if (h < 12) return 'goodMorning';
  if (h < 18) return 'goodAfternoon';
  return 'goodEvening';
}

// ----------------------------------------------------------------
//  Avatar / Initials
// ----------------------------------------------------------------
function getInitials(name) {
  if (!name) return '?';
  return name.trim().split(' ')
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

const AVATAR_COLORS = [
  '#FF6B6B', '#FF8E8E', '#FFD93D', '#FF9F43',
  '#48DBFB', '#1DD1A1', '#A29BFE', '#FD79A8',
  '#FDCB6E', '#E17055', '#6C5CE7', '#00CEC9'
];

function avatarColor(uid) {
  if (!uid) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function createAvatarEl(name, uid, sizeClass = '') {
  const el = document.createElement('div');
  el.className = `avatar ${sizeClass}`.trim();
  el.textContent = getInitials(name);
  el.style.background = avatarColor(uid);
  el.title = name;
  return el;
}

// ----------------------------------------------------------------
//  Category helpers
// ----------------------------------------------------------------
const CATEGORIES = [
  { id: 'food',          emoji: '🍽️', labelKey: 'catFood' },
  { id: 'transport',     emoji: '🚌', labelKey: 'catTransport' },
  { id: 'accommodation', emoji: '🏨', labelKey: 'catAccommodation' },
  { id: 'activity',      emoji: '🎡', labelKey: 'catActivity' },
  { id: 'shopping',      emoji: '🛍️', labelKey: 'catShopping' },
  { id: 'other',         emoji: '💡', labelKey: 'catOther' },
];

function getCategoryEmoji(id) {
  return CATEGORIES.find(c => c.id === id)?.emoji ?? '💡';
}

function getCategoryLabel(id) {
  const cat = CATEGORIES.find(c => c.id === id);
  return cat ? i18n.t(cat.labelKey) : id;
}

// ----------------------------------------------------------------
//  Toast Notifications
// ----------------------------------------------------------------
let _toastContainer = null;

function getToastContainer() {
  if (_toastContainer) return _toastContainer;
  _toastContainer = document.createElement('div');
  _toastContainer.className = 'toast-container';
  document.body.appendChild(_toastContainer);
  return _toastContainer;
}

function showToast(message, type = 'default', duration = 3000) {
  const container = getToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all .3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ----------------------------------------------------------------
//  Modal / Confirm Dialog
// ----------------------------------------------------------------
function showConfirm({ title, message, confirmLabel, confirmClass = 'btn-danger', onConfirm }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay center';
  overlay.innerHTML = `
    <div class="modal center-modal animate-scale" style="max-width:320px">
      <div class="modal-title" style="font-size:1rem;margin-bottom:.75rem">${title}</div>
      <p style="font-size:.875rem;color:var(--text-3);margin-bottom:1.5rem">${message}</p>
      <div class="flex gap-3">
        <button class="btn btn-ghost flex-1" id="conf-cancel">${i18n.t('cancel')}</button>
        <button class="btn ${confirmClass} flex-1" id="conf-ok">${confirmLabel}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('#conf-cancel').onclick = () => overlay.remove();
  overlay.querySelector('#conf-ok').onclick = () => { overlay.remove(); onConfirm(); };
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

// ----------------------------------------------------------------
//  URL Params
// ----------------------------------------------------------------
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function goTo(page, params = {}) {
  const url = new URL(page, window.location.href);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  window.location.href = url.toString();
}

// ----------------------------------------------------------------
//  Auth guard
// ----------------------------------------------------------------
function requireAuth(callback) {
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'login.html';
    } else {
      callback(user);
    }
  });
}

function redirectIfAuth(dest = 'dashboard.html') {
  auth.onAuthStateChanged(user => {
    if (user) window.location.href = dest;
  });
}

// ----------------------------------------------------------------
//  DOM helpers
// ----------------------------------------------------------------
function qs(sel, ctx = document)   { return ctx.querySelector(sel); }
function qsa(sel, ctx = document)  { return ctx.querySelectorAll(sel); }
function show(el) { if (el) el.classList.remove('hidden'); }
function hide(el) { if (el) el.classList.add('hidden'); }
function setLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn._origText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span>`;
  } else {
    btn.disabled = false;
    if (btn._origText) btn.innerHTML = btn._origText;
  }
}

// ----------------------------------------------------------------
//  Settlement Algorithm (Debt Simplification)
// ----------------------------------------------------------------
function calculateSettlements(members, expenses) {
  const balances = {};
  Object.keys(members).forEach(uid => { balances[uid] = 0; });

  expenses.forEach(exp => {
    if (!exp.splits || exp.status === 'deleted') return;
    // Payer gets credit for full amount
    if (balances[exp.paidBy] !== undefined) {
      balances[exp.paidBy] += parseAmount(exp.amount);
    }
    // Each participant debited their share
    Object.entries(exp.splits).forEach(([uid, share]) => {
      if (balances[uid] !== undefined) {
        balances[uid] -= parseAmount(share);
      }
    });
  });

  // Round to avoid floating point noise
  Object.keys(balances).forEach(uid => {
    balances[uid] = Math.round(balances[uid] * 100) / 100;
  });

  // Separate creditors and debtors
  const creditors = [];
  const debtors   = [];
  Object.entries(balances).forEach(([uid, bal]) => {
    if (bal > 0.005)  creditors.push({ uid, amount: bal });
    else if (bal < -0.005) debtors.push({ uid, amount: -bal });
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b)   => b.amount - a.amount);

  const transactions = [];
  let ci = 0, di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const credit = creditors[ci];
    const debt   = debtors[di];
    const amount = Math.min(credit.amount, debt.amount);
    const rounded = Math.round(amount * 100) / 100;

    if (rounded > 0) {
      transactions.push({ from: debt.uid, to: credit.uid, amount: rounded });
    }

    credit.amount -= amount;
    debt.amount   -= amount;

    if (credit.amount < 0.005) ci++;
    if (debt.amount   < 0.005) di++;
  }

  return { transactions, balances };
}

// ----------------------------------------------------------------
//  PWA Service Worker Registration
// ----------------------------------------------------------------
if ('serviceWorker' in navigator) {
  const isGitHubPagesHost = typeof location !== 'undefined' && /github\.io|pages\.dev/i.test(location.hostname);
  const isFileProtocol = typeof location !== 'undefined' && location.protocol === 'file:';

  if (!isGitHubPagesHost && !isFileProtocol) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(() => {
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
          });
        })
        .catch(err => console.log('SW registration error:', err));
    });
  }
}

function tsToDate(ts) {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate();
  return new Date(ts);
}

function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      return resolve(file);
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob) return resolve(file);
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }, 'image/jpeg', quality);
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

function fileToDataUrl(file, maxWidth = 600, maxHeight = 600, quality = 0.5) {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      return resolve(null);
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function formatPhotoUrl(url) {
  if (!url) return '';
  const str = String(url).trim();
  if (str === 'null' || str === 'undefined' || str === '[object File]' || str.length < 10) {
    return '';
  }
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:') || str.startsWith('blob:')) {
    return str;
  }
  return `data:image/jpeg;base64,${str}`;
}

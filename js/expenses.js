// js/expenses.js

async function saveExpense(tripId, expenseData, expenseId = null) {
  const expensesRef = db.collection('trips').doc(tripId).collection('expenses');
  
  if (expenseId) {
    await expensesRef.doc(expenseId).update({
      ...expenseData,
      updatedAt: nowTimestamp()
    });
    return expenseId;
  } else {
    const docRef = await expensesRef.add({
      ...expenseData,
      createdAt: nowTimestamp()
    });
    return docRef.id;
  }
}

async function uploadExpensePhotos(tripId, expenseId, files) {
  if (!files || files.length === 0) return [];
  const uploads = files.map(async (file, idx) => {
    // 1. Try Firebase Storage first
    try {
      if (typeof storage !== 'undefined' && storage && storage.ref) {
        const fileToUpload = typeof compressImage === 'function' ? await compressImage(file) : file;
        const safeName = (file.name || 'receipt').replace(/[^a-zA-Z0-9._-]/g, '_');
        const storageRef = storage.ref(`trips/${tripId}/expenses/${expenseId}/${Date.now()}_${idx}_${safeName}`);
        const snapshot = await storageRef.put(fileToUpload);
        const downloadUrl = await snapshot.ref.getDownloadURL();
        if (downloadUrl) return downloadUrl;
      }
    } catch (err) {
      console.warn('Firebase Storage upload failed, using Data URL fallback:', err);
    }

    // 2. Fallback to compact Data URL if Storage fails or is unconfigured
    try {
      if (typeof fileToDataUrl === 'function') {
        const dataUrl = await fileToDataUrl(file, 800, 800, 0.6);
        if (dataUrl) return dataUrl;
      }
    } catch (fallbackErr) {
      console.error('Data URL fallback failed:', fallbackErr);
    }

    return null;
  });

  const results = await Promise.all(uploads);
  return results.filter(url => url !== null);
}

async function deleteExpense(tripId, expenseId) {
  await db.collection('trips').doc(tripId).collection('expenses').doc(expenseId).delete();
}

async function getExpense(tripId, expenseId) {
  const doc = await db.collection('trips').doc(tripId).collection('expenses').doc(expenseId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

function computeEqualSplits(amount, memberUids) {
  const count = memberUids.length;
  if (count === 0) return {};
  
  const share = Math.floor((amount / count) * 100) / 100;
  const remainder = Math.round((amount - (share * count)) * 100) / 100;
  
  const splits = {};
  memberUids.forEach((uid, index) => {
    splits[uid] = index === count - 1 ? share + remainder : share;
    splits[uid] = Math.round(splits[uid] * 100) / 100; // ensure no floating point errors
  });
  
  return splits;
}

function computeSelectiveSplits(amount, selectedUids) {
  return computeEqualSplits(amount, selectedUids);
}

function getUserBalance(uid, expenses) {
  let paid = 0;
  let owed = 0;
  
  expenses.forEach(exp => {
    if (exp.paidBy === uid) {
      paid += Number(exp.amount) || 0;
    }
    if (exp.splits && exp.splits[uid]) {
      owed += Number(exp.splits[uid]) || 0;
    }
  });
  
  return {
    paid: Math.round(paid * 100) / 100,
    owed: Math.round(owed * 100) / 100,
    net: Math.round((paid - owed) * 100) / 100
  };
}

function groupExpensesByDate(expenses) {
  const grouped = {};
  
  expenses.forEach(exp => {
    // Treat exp.date as a 'YYYY-MM-DD' string
    const dateStr = exp.date;
    
    if (!grouped[dateStr]) {
      let label = dateStr;
      if (typeof todayISO !== 'undefined') {
        const today = todayISO();
        
        // Calculate yesterday string without globals or assuming Date logic exists safely
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];
        
        if (dateStr === today) {
          label = (typeof i18n !== 'undefined') ? i18n.t('common.today') || 'Today' : 'Today';
        } else if (dateStr === yesterday) {
          label = (typeof i18n !== 'undefined') ? i18n.t('common.yesterday') || 'Yesterday' : 'Yesterday';
        } else {
          label = (typeof formatDate !== 'undefined') ? formatDate(dateStr) : dateStr;
        }
      }
      
      grouped[dateStr] = {
        date: dateStr,
        label: label,
        items: []
      };
    }
    
    grouped[dateStr].items.push(exp);
  });
  
  // Sort by date desc
  return Object.values(grouped).sort((a, b) => {
    return b.date.localeCompare(a.date);
  });
}

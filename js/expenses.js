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

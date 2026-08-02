// ================================================================
//  TripTab — i18n (Internationalisation)
//  Languages: English (en) | Chinese Simplified (zh)
// ================================================================

const TRANSLATIONS = {
  en: {
    // App
    appName: 'TripTab',
    tagline: 'Split travel expenses effortlessly',

    // Auth
    login: 'Login',
    register: 'Register',
    logout: 'Sign Out',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    displayName: 'Your Name',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    sendReset: 'Send Reset Email',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    signUp: 'Sign Up',
    signIn: 'Sign In',
    createAccount: 'Create Account',
    welcomeBack: 'Welcome back!',
    joinToday: 'Join TripTab today',

    // Navigation
    home: 'Home',
    trips: 'Trips',
    add: 'Add',
    history: 'History',
    profile: 'Profile',

    // Dashboard
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    myTrips: 'My Trips',
    activeTrips: 'active trip(s)',
    noTrips: 'No trips yet',
    noTripsHint: 'Create your first trip and start tracking shared expenses.',
    createTrip: 'Create Trip',
    newTrip: 'New Trip',
    youOwe: 'You owe',
    youAreOwed: "You're owed",
    settled: 'Settled up',
    totalSpent: 'Total Spent',

    // Trip
    tripName: 'Trip Name',
    description: 'Description (optional)',
    startDate: 'Start Date',
    endDate: 'End Date',
    currency: 'Currency',
    members: 'Members',
    expenses: 'Expenses',
    settle: 'Settle',
    tripTotal: 'Trip Total',
    yourBalance: 'Your Balance',
    addExpense: 'Add Expense',
    editTrip: 'Edit Trip',
    deleteTrip: 'Delete Trip',
    archiveTrip: 'Archive Trip',
    leaveTrip: 'Leave Trip',
    active: 'Active',
    archived: 'Archived',
    admin: 'Admin',
    member: 'Member',

    // Members
    inviteMembers: 'Invite Members',
    inviteByEmail: 'Invite by email',
    sendInvite: 'Send Invite',
    pendingInvite: 'Pending',
    removeMember: 'Remove',
    kickMember: 'Remove from trip',

    // Expense
    expenseTitle: 'Expense Title',
    amount: 'Amount',
    paidBy: 'Paid by',
    splitWith: 'Split with',
    splitType: 'Split Type',
    equalSplit: 'Equal Split',
    customSplit: 'Custom Amount',
    selectiveSplit: 'Select People',
    notes: 'Notes (optional)',
    date: 'Date',
    category: 'Category',
    saveExpense: 'Save Expense',
    editExpense: 'Edit Expense',
    deleteExpense: 'Delete Expense',
    splitEqually: 'Split equally',
    perPerson: 'per person',
    remaining: 'Remaining',

    // Categories
    catFood: 'Food',
    catTransport: 'Transport',
    catAccommodation: 'Stay',
    catActivity: 'Activity',
    catShopping: 'Shopping',
    catOther: 'Other',

    // Settlement
    settlement: 'Settlement',
    allSettled: 'All settled up! 🎉',
    allSettledHint: 'Everyone is even. No payments needed.',
    whoPayWho: 'Who pays who',
    pays: 'pays',
    markSettled: 'Mark as Settled',
    undoSettle: 'Undo',
    paymentsDone: 'All payments done',
    netBalance: 'Net Balance',
    paid: 'Paid',
    owes: 'Owes',
    exportSummary: 'Export Summary',
    printSummary: 'Print / Save PDF',

    // Profile
    editProfile: 'Edit Profile',
    saveChanges: 'Save Changes',
    appearance: 'Appearance',
    language: 'Language',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    themeToggle: 'Theme',
    langEN: 'English',
    langCN: '中文',
    account: 'Account',
    about: 'About TripTab',
    version: 'Version 1.0',

    // Actions
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    confirm: 'Confirm',
    back: 'Back',
    done: 'Done',
    close: 'Close',
    loading: 'Loading...',
    retry: 'Retry',

    // Confirmations
    confirmDelete: 'Delete this expense?',
    confirmDeleteTrip: 'Delete this trip? All expenses will be lost.',
    confirmLeave: 'Leave this trip?',
    confirmKick: 'Remove this member from the trip?',
    cannotUndo: 'This cannot be undone.',

    // Errors
    errRequired: 'This field is required.',
    errEmail: 'Enter a valid email address.',
    errPasswordLen: 'Password must be at least 6 characters.',
    errPasswordMatch: 'Passwords do not match.',
    errAmountZero: 'Amount must be greater than 0.',
    errSplitTotal: 'Split amounts must add up to the total.',
    errNetwork: 'Network error. Check your connection.',
    errUnknown: 'Something went wrong. Please try again.',
    errNoMembers: 'Add at least one member.',

    // Success
    okTripCreated: 'Trip created!',
    okExpenseSaved: 'Expense saved!',
    okExpenseDeleted: 'Expense deleted.',
    okInviteSent: 'Invite sent!',
    okSettled: 'Marked as settled.',
    okProfileSaved: 'Profile updated!',
    okResetSent: 'Reset email sent. Check your inbox.',
  },

  zh: {
    // App
    appName: 'TripTab',
    tagline: '轻松分摊旅行费用',

    // Auth
    login: '登录',
    register: '注册',
    logout: '退出登录',
    email: '电子邮箱',
    password: '密码',
    confirmPassword: '确认密码',
    displayName: '你的名字',
    forgotPassword: '忘记密码？',
    resetPassword: '重置密码',
    sendReset: '发送重置邮件',
    noAccount: '还没有账户？',
    hasAccount: '已有账户？',
    signUp: '注册',
    signIn: '登录',
    createAccount: '创建账户',
    welcomeBack: '欢迎回来！',
    joinToday: '今天加入 TripTab',

    // Navigation
    home: '主页',
    trips: '行程',
    add: '添加',
    history: '历史',
    profile: '我的',

    // Dashboard
    goodMorning: '早上好',
    goodAfternoon: '下午好',
    goodEvening: '晚上好',
    myTrips: '我的行程',
    activeTrips: '个活跃行程',
    noTrips: '还没有行程',
    noTripsHint: '创建你的第一个行程，开始追踪共同费用。',
    createTrip: '创建行程',
    newTrip: '新行程',
    youOwe: '你欠',
    youAreOwed: '别人欠你',
    settled: '已结清',
    totalSpent: '总消费',

    // Trip
    tripName: '行程名称',
    description: '描述（选填）',
    startDate: '开始日期',
    endDate: '结束日期',
    currency: '货币',
    members: '成员',
    expenses: '费用',
    settle: '结算',
    tripTotal: '行程总计',
    yourBalance: '你的余额',
    addExpense: '添加费用',
    editTrip: '编辑行程',
    deleteTrip: '删除行程',
    archiveTrip: '归档行程',
    leaveTrip: '退出行程',
    active: '进行中',
    archived: '已归档',
    admin: '管理员',
    member: '成员',

    // Members
    inviteMembers: '邀请成员',
    inviteByEmail: '通过邮箱邀请',
    sendInvite: '发送邀请',
    pendingInvite: '待加入',
    removeMember: '移除',
    kickMember: '从行程中移除',

    // Expense
    expenseTitle: '费用标题',
    amount: '金额',
    paidBy: '付款人',
    splitWith: '分摊对象',
    splitType: '分摊方式',
    equalSplit: '平均分摊',
    customSplit: '自定义金额',
    selectiveSplit: '选择成员',
    notes: '备注（选填）',
    date: '日期',
    category: '类别',
    saveExpense: '保存费用',
    editExpense: '编辑费用',
    deleteExpense: '删除费用',
    splitEqually: '平均分摊',
    perPerson: '每人',
    remaining: '剩余',

    // Categories
    catFood: '餐饮',
    catTransport: '交通',
    catAccommodation: '住宿',
    catActivity: '活动',
    catShopping: '购物',
    catOther: '其他',

    // Settlement
    settlement: '结算',
    allSettled: '全部结清！🎉',
    allSettledHint: '大家账目已平。无需付款。',
    whoPayWho: '谁付给谁',
    pays: '付给',
    markSettled: '标记已结清',
    undoSettle: '撤销',
    paymentsDone: '所有款项已完成',
    netBalance: '净余额',
    paid: '已付',
    owes: '欠款',
    exportSummary: '导出摘要',
    printSummary: '打印 / 保存 PDF',

    // Profile
    editProfile: '编辑资料',
    saveChanges: '保存更改',
    appearance: '外观',
    language: '语言',
    darkMode: '深色模式',
    lightMode: '浅色模式',
    themeToggle: '主题',
    langEN: 'English',
    langCN: '中文',
    account: '账户',
    about: '关于 TripTab',
    version: '版本 1.0',

    // Actions
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    confirm: '确认',
    back: '返回',
    done: '完成',
    close: '关闭',
    loading: '加载中...',
    retry: '重试',

    // Confirmations
    confirmDelete: '删除此费用？',
    confirmDeleteTrip: '删除此行程？所有费用记录将丢失。',
    confirmLeave: '退出此行程？',
    confirmKick: '将此成员从行程中移除？',
    cannotUndo: '此操作无法撤销。',

    // Errors
    errRequired: '此字段为必填项。',
    errEmail: '请输入有效的电子邮箱。',
    errPasswordLen: '密码至少需要6个字符。',
    errPasswordMatch: '两次密码不一致。',
    errAmountZero: '金额必须大于0。',
    errSplitTotal: '分摊金额之和必须等于总金额。',
    errNetwork: '网络错误，请检查连接。',
    errUnknown: '出错了，请重试。',
    errNoMembers: '至少需要添加一名成员。',

    // Success
    okTripCreated: '行程已创建！',
    okExpenseSaved: '费用已保存！',
    okExpenseDeleted: '费用已删除。',
    okInviteSent: '邀请已发送！',
    okSettled: '已标记为结清。',
    okProfileSaved: '资料已更新！',
    okResetSent: '重置邮件已发送，请查收邮箱。',
  }
};

// ----------------------------------------------------------------
//  i18n API
// ----------------------------------------------------------------
const i18n = {
  _lang: localStorage.getItem('triptab_lang') || 'en',

  get lang() { return this._lang; },

  set lang(val) {
    this._lang = val;
    localStorage.setItem('triptab_lang', val);
    this.applyAll();
  },

  /** Get a translation string */
  t(key) {
    return TRANSLATIONS[this._lang]?.[key]
        ?? TRANSLATIONS['en'][key]
        ?? key;
  },

  /** Apply translations to all [data-i18n] elements in DOM */
  applyAll() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = this.t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) el.placeholder = this.t(key);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) el.title = this.t(key);
    });
    // Update lang toggle button text
    document.querySelectorAll('.lang-btn-label').forEach(el => {
      el.textContent = this._lang === 'en' ? '中文' : 'EN';
    });
    // Update html lang attribute
    document.documentElement.lang = this._lang === 'zh' ? 'zh-CN' : 'en';
  },

  /** Toggle between EN and ZH */
  toggle() {
    this.lang = this._lang === 'en' ? 'zh' : 'en';
  },

  /** Init on page load */
  init() {
    this.applyAll();
  }
};

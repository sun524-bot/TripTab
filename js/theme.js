const theme = {
  _mode: localStorage.getItem('triptab_theme') || 'light',

  get mode() { return this._mode; },

  set mode(val) {
    this._mode = val;
    localStorage.setItem('triptab_theme', val);
    this._apply();
    this._updateButtons();
  },

  _apply() {
    document.documentElement.setAttribute('data-theme', this._mode);
  },

  _updateButtons() {
    document.querySelectorAll('.theme-btn, .theme-toggle-btn, #theme-toggle').forEach(btn => {
      const sunIcon  = btn.querySelector('.icon-sun');
      const moonIcon = btn.querySelector('.icon-moon');
      const label    = btn.querySelector('.theme-label');
      if (sunIcon)  sunIcon.classList.toggle('hidden',  this._mode === 'light');
      if (moonIcon) moonIcon.classList.toggle('hidden', this._mode === 'dark');
      if (label)    label.textContent = this._mode === 'dark' ? '☀️' : '🌙';

      if (!sunIcon && !moonIcon && !label) {
        btn.innerHTML = this._mode === 'dark' ? '☀️' : '🌙';
        btn.style.fontSize = '1.2rem';
        btn.style.lineHeight = '1';
      }
    });
  },

  toggle() {
    this.mode = this._mode === 'light' ? 'dark' : 'light';
  },

  init() {
    this._apply();
    this._updateButtons();
  }
};

// Apply theme immediately to avoid flash
theme._apply();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => theme.init());
} else {
  theme.init();
}

/**
 * Theme Factory
 * Comprehensive theming system for web applications
 */

class ThemeFactory {
  constructor(options = {}) {
    this.defaultTheme = options.defaultTheme || 'default';
    this.defaultMode = options.defaultMode || 'light';
    this.storageKey = options.storageKey || 'appTheme';
    this.cssVarPrefix = options.cssVarPrefix || '--theme';
    
    this.themes = this.getDefaultThemes();
    this.currentTheme = null;
    this.currentMode = null;
    
    this.onThemeChange = options.onThemeChange || (() => {});
    this.onModeChange = options.onModeChange || (() => {});
  }

  /**
   * Default theme configurations
   */
  getDefaultThemes() {
    return {
      default: {
        primary: '#667eea',
        secondary: '#764ba2',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        accent: '#764ba2',
        particle: '#667eea'
      },
      'orange-red': {
        primary: '#f97316',
        secondary: '#ef4444',
        gradient: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
        bg: 'linear-gradient(135deg, #fdba74 0%, #f97316 50%, #ef4444 100%)',
        accent: '#ef4444',
        particle: '#f97316'
      },
      'blue-gradient': {
        primary: '#3b82f6',
        secondary: '#06b6d4',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        bg: 'linear-gradient(135deg, #93c5fd 0%, #3b82f6 50%, #06b6d4 100%)',
        accent: '#06b6d4',
        particle: '#3b82f6'
      },
      'green-gradient': {
        primary: '#22c55e',
        secondary: '#10b981',
        gradient: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
        bg: 'linear-gradient(135deg, #86efac 0%, #22c55e 50%, #10b981 100%)',
        accent: '#10b981',
        particle: '#22c55e'
      },
      pink: {
        primary: '#ec4899',
        secondary: '#d946ef',
        gradient: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
        bg: 'linear-gradient(135deg, #f9a8d4 0%, #ec4899 50%, #d946ef 100%)',
        accent: '#d946ef',
        particle: '#ec4899'
      },
      'deep-blue': {
        primary: '#1e3a8a',
        secondary: '#3b82f6',
        gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        bg: 'linear-gradient(135deg, #60a5fa 0%, #1e3a8a 50%, #1e40af 100%)',
        accent: '#3b82f6',
        particle: '#1e3a8a'
      },
      'gold-orange': {
        primary: '#f59e0b',
        secondary: '#ea580c',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
        bg: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 50%, #ea580c 100%)',
        accent: '#ea580c',
        particle: '#f59e0b'
      }
    };
  }

  /**
   * Initialize the theme system
   */
  init() {
    const savedTheme = this.getSavedTheme();
    const savedMode = this.getSavedMode();
    
    this.setTheme(savedTheme || this.defaultTheme, false);
    this.setMode(savedMode || this.defaultMode, false);
    
    this.setupSystemPreferenceListener();
    
    return this;
  }

  /**
   * Set the current color theme
   */
  setTheme(themeName, save = true) {
    const theme = this.themes[themeName] || this.themes[this.defaultTheme];
    this.currentTheme = themeName;
    
    // Apply CSS variables
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`${this.cssVarPrefix}-${key}`, value);
    });
    
    // Set data attribute
    if (themeName === this.defaultTheme) {
      document.documentElement.removeAttribute('data-color-theme');
    } else {
      document.documentElement.setAttribute('data-color-theme', themeName);
    }
    
    // Save to storage
    if (save) {
      localStorage.setItem(`${this.storageKey}-color`, themeName);
    }
    
    // Trigger callback
    this.onThemeChange(themeName, theme);
    
    return this;
  }

  /**
   * Set light/dark mode
   */
  setMode(mode, save = true) {
    this.currentMode = mode;
    
    if (mode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    if (save) {
      localStorage.setItem(`${this.storageKey}-mode`, mode);
    }
    
    this.onModeChange(mode);
    
    return this;
  }

  /**
   * Toggle between light and dark mode
   */
  toggleMode() {
    const newMode = this.currentMode === 'light' ? 'dark' : 'light';
    this.setMode(newMode);
    return newMode;
  }

  /**
   * Get saved theme from storage
   */
  getSavedTheme() {
    return localStorage.getItem(`${this.storageKey}-color`);
  }

  /**
   * Get saved mode from storage
   */
  getSavedMode() {
    return localStorage.getItem(`${this.storageKey}-mode`);
  }

  /**
   * Listen for system color preference changes
   */
  setupSystemPreferenceListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem(`${this.storageKey}-mode`)) {
        this.setMode(e.matches ? 'dark' : 'light', false);
      }
    });
  }

  /**
   * Get all available themes
   */
  getThemes() {
    return Object.keys(this.themes);
  }

  /**
   * Get current theme info
   */
  getCurrentTheme() {
    return {
      color: this.currentTheme,
      mode: this.currentMode,
      themeData: this.themes[this.currentTheme]
    };
  }

  /**
   * Add custom theme
   */
  addTheme(name, config) {
    this.themes[name] = config;
    return this;
  }

  /**
   * Remove a theme
   */
  removeTheme(name) {
    if (name !== this.defaultTheme) {
      delete this.themes[name];
    }
    return this;
  }

  /**
   * Generate CSS for themes
   */
  generateCSS() {
    const rootVars = [];
    const themeAttrs = [];
    
    // Generate :root variables
    Object.entries(this.themes.default).forEach(([key, value]) => {
      rootVars.push(`  --${this.cssVarPrefix}-${key}: ${value};`);
    });
    
    // Generate data-theme attributes
    Object.entries(this.themes).forEach(([name, config]) => {
      if (name !== 'default') {
        const attrs = [];
        Object.entries(config).forEach(([key, value]) => {
          attrs.push(`  --${this.cssVarPrefix}-${key}: ${value};`);
        });
        themeAttrs.push(`[data-color-theme="${name}"] {\n${attrs.join('\n')}\n}`);
      }
    });
    
    return `:root {
${rootVars.join('\n')}
}

${themeAttrs.join('\n\n')}`;
  }
}

// Export for use
window.ThemeFactory = ThemeFactory;

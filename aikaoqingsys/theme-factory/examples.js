/**
 * Theme Factory - Usage Examples
 * 
 * Basic usage:
 */

 // 1. Initialize with default settings
 const themeManager = new ThemeFactory({
   defaultTheme: 'default',
   defaultMode: 'light',
   storageKey: 'myAppTheme',
   onThemeChange: (name, config) => {
     console.log('Theme changed to:', name);
   },
   onModeChange: (mode) => {
     console.log('Mode changed to:', mode);
   }
 }).init();

 // 2. Switch color themes
 themeManager.setTheme('orange-red');
 themeManager.setTheme('blue-gradient');
 themeManager.setTheme('green-gradient');

 // 3. Toggle dark/light mode
 themeManager.toggleMode();
 themeManager.setMode('dark');
 themeManager.setMode('light');

 // 4. Get current theme
 const current = themeManager.getCurrentTheme();
 console.log(current.color, current.mode);

 // 5. Add custom theme
 themeManager.addTheme('custom', {
   primary: '#6366f1',
   secondary: '#8b5cf6',
   gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
   bg: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 50%, #8b5cf6 100%)',
   accent: '#8b5cf6',
   particle: '#6366f1'
 });

 // 6. Get available themes
 const themes = themeManager.getThemes();
 console.log('Available themes:', themes);

 // 7. Generate CSS for server-side rendering
 const css = themeManager.generateCSS();
 console.log(css);

 /**
  * HTML Integration:
  * 
  * <button onclick="themeManager.setTheme('orange-red')">Orange Theme</button>
  * <button onclick="themeManager.toggleMode()">Toggle Dark Mode</button>
  * 
  * CSS Usage:
  * 
  * .button {
  *   background: var(--theme-gradient);
  *   color: white;
  * }
  * 
  * .card {
  *   background: var(--glass-bg);
  *   border: 1px solid var(--glass-border);
  * }
  */

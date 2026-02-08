# Theme Factory Skill

A comprehensive theming system for web applications with support for:
- 🎨 Multiple color themes
- 🌙 Light/Dark mode
- ✨ Smooth transitions
- 💾 Persistent preferences
- 📱 Responsive design

## Quick Start

### 1. Add to your HTML

```html
<link rel="stylesheet" href="theme-factory.css">
<script src="theme-factory.js"></script>
```

### 2. Initialize in your JavaScript

```javascript
const theme = new ThemeFactory().init();
```

### 3. Use in your HTML

```html
<!-- Switch color themes -->
<button onclick="setColorTheme('orange-red')">Orange Theme</button>
<button onclick="setColorTheme('blue-gradient')">Blue Theme</button>

<!-- Toggle dark mode -->
<button onclick="toggleTheme()">Toggle Dark Mode</button>
```

## Available Themes

| Theme | Primary | Secondary |
|-------|---------|-----------|
| default | #667eea | #764ba2 |
| orange-red | #f97316 | #ef4444 |
| blue-gradient | #3b82f6 | #06b6d4 |
| green-gradient | #22c55e | #10b981 |
| pink | #ec4899 | #d946ef |
| deep-blue | #1e3a8a | #3b82f6 |
| gold-orange | #f59e0b | #ea580c |

## CSS Variables

Use these variables in your CSS:

```css
.element {
  /* Theme colors */
  background: var(--theme-gradient);
  color: var(--theme-primary);
  
  /* Background colors */
  background-color: var(--bg-primary);
  
  /* Text colors */
  color: var(--text-primary);
  
  /* Glass effect */
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
}
```

## API Reference

### ThemeFactory Options

```javascript
new ThemeFactory({
  defaultTheme: 'default',    // Default color theme
  defaultMode: 'light',        // Default mode (light/dark)
  storageKey: 'appTheme',      // localStorage key prefix
  onThemeChange: (name) => {}, // Callback when theme changes
  onModeChange: (mode) => {}   // Callback when mode changes
});
```

### Methods

- `setTheme(name)` - Set color theme
- `setMode('dark'|'light')` - Set mode
- `toggleMode()` - Toggle between modes
- `getThemes()` - Get available themes
- `getCurrentTheme()` - Get current theme info
- `addTheme(name, config)` - Add custom theme
- `generateCSS()` - Generate CSS variables

## File Structure

```
theme-factory/
├── skill.yaml          # Skill definition
├── skill.json          # Skill metadata
├── theme-factory.js    # Main JavaScript class
├── examples.js          # Usage examples
├── README.md           # This file
└── preview.html        # Interactive preview
```

## License

MIT

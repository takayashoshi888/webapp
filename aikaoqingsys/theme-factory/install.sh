#!/bin/bash
# Theme Factory Skill Installer

echo "🎨 Installing Theme Factory Skill..."

# Create skill directory
mkdir -p skills/theme-factory

# Copy files
cp theme-factory.js skills/theme-factory/
cp theme-factory.css skills/theme-factory/
cp examples.js skills/theme-factory/

echo "✅ Theme Factory skill installed successfully!"
echo ""
echo "Usage:"
echo "  1. Include theme-factory.js and theme-factory.css in your HTML"
echo "  2. Initialize: new ThemeFactory().init()"
echo "  3. Switch themes: setColorTheme('orange-red')"
echo ""
echo "For more info, see skills/theme-factory/README.md"

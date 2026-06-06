# Color Changer

A Chrome extension that lets you customize the colors of any website. Change background colors, save your preferences per-site, and instantly revert to defaults—all with a simple popup interface.

## Features

- 🎨 **Color Customization** - Identify and change background colors on any website
- 💾 **Persistent Storage** - Your color preferences are saved per-site and survive page refreshes
- 🔄 **Dynamic Content Support** - Works with websites that load content dynamically
- ⚡ **One-Click Reset** - Revert to original colors instantly with the reset button
- 🌐 **Works Everywhere** - Compatible with any website

## How It Works

1. Click the extension icon in your toolbar to open the Color Changer popup
2. The extension detects all unique background colors on the current page
3. Each color is displayed with a color picker
4. Select a new color from the picker to replace it across the page
5. Your changes are automatically saved for that specific site
6. Click **Reset to defaults** to restore original colors

## Installation

### For Users
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the project folder
5. The Color Changer icon will appear in your toolbar

### For Developers
```bash
# Clone the repository
git clone https://github.com/yourusername/color-changer.git
cd color-changer

# No build step needed - it's ready to load in Chrome
```

## Project Structure

```
color-changer/
├── manifest.json       # Chrome extension configuration
├── content.js          # Page color detection & manipulation
├── popup.js            # Extension popup logic
├── view.html           # Extension popup UI
├── styles.css          # Popup styling
├── icon.png            # Extension icon (add this)
└── README.md           # This file
```

## Technical Details

### Architecture
- **Content Script** (`content.js`) - Runs on the webpage to detect and modify colors
- **Popup Script** (`popup.js`) - Manages the extension's user interface
- **Storage** - Uses Chrome's `chrome.storage.local` API for per-site persistence

### Key Features
- Per-site color mapping using `colorMap_[hostname]` keys
- MutationObserver for dynamically-loaded content support
- Hex↔RGB color conversion for color picker compatibility
- Chrome Manifest V3 (modern standard)

## Troubleshooting

**Colors not changing?**
- Ensure the extension has permission to access the website
- Some websites use complex CSS that may prevent color changes
- Try refreshing the page after changing a color

**Colors not saving?**
- Clear your browser cache and reload the extension
- Check that local storage isn't disabled in your browser

## Contributing

Feel free to fork, enhance, and submit improvements!

## License

MIT License - see LICENSE file for details

## Future Enhancements

- Text color customization
- Border and shadow color support
- Import/export color schemes
- Sync preferences across devices

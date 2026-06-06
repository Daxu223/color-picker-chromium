# Color Changer

A Chromium-based extension that lets you customize the colors of any website. Change background colors, save your preferences per-site, and instantly revert to defaults.

## Features

- Color Customization - Identify and change background colors on any website
- Persistent Storage - Your color preferences are saved per-site and survive page refreshes
- Dynamic Content Support - Works with websites that load content dynamically
- Reset button - Revert to original colors instantly with the reset button

## How It Works

1. Click the extension icon in your toolbar to open the Color Changer popup
2. The extension detects all unique background colors on the current page
3. Each color is displayed with a color picker
4. Select a new color from the picker to replace it across the page
5. Your changes are automatically saved for that specific site
6. Click **Reset to defaults** to restore original colors

## Installation

### End-user
1. Download or clone this repository
2. Open a Chromium-based browser and go to `[browser]://extensions/`
- Tested on the Brave browser
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the project folder
5. The Color Changer icon will appear in your toolbar

### Developers
```bash
# Clone the repository
git clone https://github.com/daxu223/color-changer.git
cd color-changer

# No build step needed - it's ready to load in Chrome
```

## Project Structure

```
color-changer/
├── manifest.json
├── src/
│   ├── content/
│   │   └── content.js
│   └── popup/
│       ├── popup.js
│       ├── popup.html
│       └── popup.css
├── README.md
```

- (`content.js`) - Reads the page and applies listeners to components, so that they can be changed.
- (`popup.js`) - Manages the view of the application and sends actions to the content script.

### Key Features
- Uses chrome.storage API to store keys as `colorMap_[hostname]` keys and apply them to the site you are visiting
- Uses MutationObserver to apply changes that might happen after loading the site.

## Contributing

Feel free to fork, enhance, and submit improvements!

## Future

Testing, using and developing it based on the bugs.
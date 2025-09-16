# ChatGPT Product Info Search - Chrome Extension

A Chrome extension that adds product search functionality directly to ChatGPT, allowing you to search for product reviews, comparisons, and detailed information without leaving the page.

## Features

- 🔍 **Single Product Search**: Search for individual products and get detailed reviews
- 📊 **Multi-Product Comparison**: Compare multiple products side-by-side in a table format  
- 📋 **Search History**: Automatically save all your searches and easily reopen them later
- 🎯 **Sentiment Analysis**: Visual sentiment breakdown of reviews (positive/neutral/negative)
- 🔗 **Citation Links**: Direct links to source websites for more information
- 🏷️ **Review Themes**: Categorized review themes for easy browsing
- 📱 **Responsive UI**: Clean, modern interface that works seamlessly with ChatGPT

## Installation

### From Source (Developer Mode)

1. **Download/Clone** this repository
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the `chrome-extension` folder
5. **Navigate to ChatGPT** (https://chatgpt.com) and log in
6. **Click the extension icon** in your toolbar or look for the floating 🛍️ button on ChatGPT

### From Chrome Web Store

*Coming soon - extension will be submitted to the Chrome Web Store*

## How to Use

1. **Make sure you're logged in** to ChatGPT (https://chatgpt.com)
2. **Click the extension icon** in your Chrome toolbar
3. **Click "Open Product Search"** to launch the search interface
4. **Search for products** like:
   - "iPhone 17 Pro camera quality"
   - "Nike Air Max running shoes"
   - "MacBook Air M3 performance"
   - "Tesla Model 3 reviews"

### Single Product Search
- Enter any product name or specific query
- Get detailed reviews, sentiment analysis, and citation links
- View product overview and review summaries

### Multi-Product Search
- Toggle "Multi-product search" mode
- Enter multiple product names (one per line)
- Compare products in a convenient table format
- Click "View" to see detailed information for any product

### Search History
- All successful searches are automatically saved to your history
- Click the "📋 History" tab to view your search history
- **Reopen** any previous search to view the results again
- **Filter** your history using the search box
- **Delete** individual searches or clear all history
- History is stored locally in your browser (up to 50 most recent searches)

## Why This Works as a Chrome Extension

Unlike the original bookmarklet, this Chrome extension has several advantages:

### ✅ **No CORS Issues**
- Extensions can make cross-origin requests to ChatGPT's API without restrictions
- No browser security blocks or CORS errors

### ✅ **Better Security**
- No need to paste code into the console repeatedly
- Proper extension sandboxing and permissions

### ✅ **Persistent & Reliable**
- Always available on ChatGPT pages
- Auto-updates through Chrome's extension system
- No need to re-inject code manually

### ✅ **Enhanced User Experience**
- Proper toolbar icon and popup interface
- Better error handling and status indicators
- Seamless integration with ChatGPT's interface

## Technical Details

### Permissions Required
- `activeTab`: To interact with the current ChatGPT tab
- `storage`: To save user preferences (future feature)
- `https://chatgpt.com/*`: To access ChatGPT's API and inject content

### Architecture
- **Content Script**: Injects the search interface into ChatGPT pages
- **Popup**: Provides status and controls from the extension toolbar
- **Manifest V3**: Uses the latest Chrome extension standards

### API Access
The extension uses ChatGPT's internal product search API:
- Automatically fetches authentication tokens from your session
- Makes requests to `https://chatgpt.com/backend-api/search/product_info`
- Parses streaming responses for real-time results

## Privacy & Security

- **No data collection**: The extension doesn't collect or store any personal data
- **Local processing**: All searches are processed locally in your browser
- **Secure authentication**: Uses your existing ChatGPT session tokens
- **No external servers**: Communicates only with ChatGPT's official API

## Development

### File Structure
```
chrome-extension/
├── manifest.json          # Extension configuration
├── content-script.js      # Main functionality injected into ChatGPT
├── popup.html            # Extension popup interface
├── popup.js              # Popup logic and controls
├── styles.css            # Extension styles
└── icons/                # Extension icons (16x16 to 128x128)
```

### Building from Source
1. Clone the repository
2. The extension is ready to load - no build process required
3. Load in Chrome developer mode for testing

## Troubleshooting

### Extension Not Working
- Make sure you're on https://chatgpt.com (not chat.openai.com)
- Refresh the ChatGPT page after installing the extension
- Check that you're logged in to ChatGPT

### Search Errors
- Verify you're logged in to ChatGPT
- Try refreshing the page if you get authentication errors
- Check Chrome's console for detailed error messages

### Popup Shows "Not Ready"
- Navigate to ChatGPT first
- Refresh the ChatGPT page
- Make sure the extension is enabled in chrome://extensions/

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

Created by [Martin Aberastegue (@Xyborg)](https://www.martinaberastegue.com/)

Based on the original ChatGPT Product Info bookmarklet, converted to a Chrome extension for better reliability and user experience.

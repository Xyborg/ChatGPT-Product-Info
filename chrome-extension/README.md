# ChatGPT Product Info Search - Chrome Extension

A Chrome extension that adds product search functionality directly to ChatGPT, allowing you to search for product reviews, comparisons, and detailed information without leaving the page.

## Features

### Core Search Features
- **Single Product Search**: Search for individual products and get detailed reviews
- **Multi-Product Comparison**: Compare multiple products side-by-side in a table format
- **Multi-Market Support**: Supports multiple countries and languages, so you can receive the same answers as users in your target market.
- **Sentiment Analysis**: Visual sentiment breakdown of reviews (positive/neutral/negative)
- **Citation Links**: Direct links to source websites for more information
- **Review Themes**: Categorized review themes for easy browsing
- **Projects & Tags**: Organize every search with project assignments and tag labels for richer filtering

### Chrome Extension Features
- **Search History**: Automatically save searches (up to 50) and reopen them instantly
- **Filter-Aware Reports**: Review/citation source reports that respect your active filters
- **Floating Product Bubble**: Always-visible light-yellow button with the extension logo in the bottom-right corner
- **Popup Interface**: Quick access and status checking from the Chrome toolbar
- **Responsive UI**: Clean, modern interface that works seamlessly with ChatGPT
- **Auto-Save**: All successful searches automatically saved to local history
- **Unified Project & Tag Filters**: Combine projects and tags, and have those selections stay in sync across History, Analysis, and Reports
- **History Filtering**: Text search plus synced project/tag filters to drill into past work

## Installation

### From Source (Developer Mode)

1. **Download/Clone** this repository
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the `chrome-extension` folder
5. **Navigate to ChatGPT** (https://chatgpt.com) and log in
6. **Click the extension icon** in your toolbar or look for the floating Product Info bubble on ChatGPT

### From Chrome Web Store

*Coming soon - extension will be submitted to the Chrome Web Store*

## How to Use

### Getting Started
1. **Make sure you're logged in** to ChatGPT (https://chatgpt.com)
2. **Access the search interface** using either:
   - Click the extension icon in your Chrome toolbar → "Open Product Search"
   - Click the floating Product Info bubble in the bottom-right corner of any ChatGPT page
3. **Start searching** for products using natural language queries

### Search Examples
Try searching for:
- "iPhone 17 Pro camera quality"
- "Nike Air Max running shoes" 
- "MacBook Air M3 performance"
- "Tesla Model 3 reviews"
- "best wireless headphones 2024"

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
- **Filter** your history using the search box plus shared project/tag filters
- **Delete** individual searches or clear all history
- History is stored locally in your browser (up to 50 most recent searches)
- **Organize** each search with project assignments and tag labels directly from the sidebar or post-search workflow

### Basic Reports
- Click the "📊 Reports" tab to view simple analytics from your search history
- **Review Sources Report**: See which websites have provided reviews in your searches
- **Citation Sources Report**: View the sources that have been cited across your searches
- Reports are generated from your local search history, processed locally, and reflect the same project/tag filters you have applied

## Why This Works as a Chrome Extension

Unlike the original bookmarklet, this Chrome extension has several advantages:

### **No CORS Issues**
- Extensions can make cross-origin requests to ChatGPT's API without restrictions
- No browser security blocks or CORS errors

### **Better Security & Reliability**
- No need to paste code into the console repeatedly
- Proper extension sandboxing and permissions
- Always available on ChatGPT pages
- Auto-updates through Chrome's extension system
- No need to re-inject code manually

### **Enhanced User Experience**
- Floating Product Info bubble (with branded icon) for instant access in the lower-right corner
- Proper toolbar icon and popup interface with status checking
- Persistent search history with powerful filtering and management
- Filter-aware reports on search sources
- Unified project/tag filters that seamlessly sync between History and Analysis views
- Better error handling, status indicators, and seamless integration with ChatGPT's interface

## Technical Details

### Permissions Required
- `activeTab`: To interact with the current ChatGPT tab
- `storage`: To save search history and user preferences locally
- `https://chatgpt.com/*`: To access ChatGPT's API and inject content

### Architecture
- **Content Script**: Injects the search interface and floating button into ChatGPT pages
- **Popup**: Provides status checking and quick access controls from the extension toolbar
- **Local Storage**: Manages search history and user data locally (no external servers)
- **Manifest V3**: Uses the latest Chrome extension standards for security and performance

### API Access
The extension uses ChatGPT's internal product search API:
- Automatically fetches authentication tokens from your existing session
- Makes requests to `https://chatgpt.com/backend-api/search/product_info`
- Parses streaming responses for real-time results
- Handles authentication errors gracefully with user feedback

## Privacy & Security

- **No data collection**: The extension doesn't collect or store any personal data externally
- **Local processing**: All searches and history are processed and stored locally in your browser
- **Secure authentication**: Uses your existing ChatGPT session tokens (no passwords stored)
- **No external servers**: Communicates only with ChatGPT's official API
- **Local storage only**: Search history and preferences stored in browser's local storage
- **No tracking**: No analytics, telemetry, or user behavior tracking
- **Open source**: Full code available for security review and transparency

## Development

### File Structure
```
chrome-extension/
├── manifest.json          # Extension configuration
├── content-script.js      # Main functionality injected into ChatGPT
├── popup.html            # Extension popup interface
├── popup.js              # Popup logic and controls
├── styles.css            # Extension styles
├── assets/               # Static assets and resources
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

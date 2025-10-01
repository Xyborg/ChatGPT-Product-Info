# ChatGPT Product Info Search 🔍

A powerful **Chrome extension** and browser script that **unlocks ChatGPT's internal product search API** to **fetch detailed product information, reviews, and comparisons** directly within ChatGPT's interface.

![ChatGPT Product Info Search Interface](assets/chatgpt-product-info.png)

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
  - [Chrome Extension (Recommended)](#chrome-extension-recommended)
  - [Browser Script](#browser-script)
- [Demo](#demo)
- [Features](#features)
- [How to Use](#how-to-use)
- [Search Examples](#search-examples)
- [What You'll Get](#what-youll-get)
- [Technical Details](#technical-details)
- [Browser Compatibility](#browser-compatibility)
- [Requirements](#requirements)
- [Troubleshooting](#troubleshooting)
- [Privacy & Security](#privacy--security)
- [Want to Improve Your AI Visibility?](#want-to-improve-your-ai-visibility)
- [Additional Resources](#additional-resources)
- [Contributing](#contributing)
- [Author](#author)
- [License](#license)

## Overview

This project provides two ways to access ChatGPT's internal product search API: a Chrome extension (recommended) and a browser script. Both create a modal interface within ChatGPT that allows you to search for product information, reviews, and detailed comparisons. They automatically handle authentication and present results in an organized, easy-to-read format.

## Installation

### Chrome Extension (Recommended)

The Chrome extension provides the best experience with enhanced features and reliability.

#### From Source (Developer Mode)
1. **Download/Clone** this repository
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the `chrome-extension` folder
5. **Navigate to ChatGPT** (https://chatgpt.com) and log in
6. **Click the extension icon** in your toolbar or look for the floating 🛍️ button on ChatGPT

#### From Chrome Web Store
*Coming soon - extension will be submitted to the Chrome Web Store*

#### Chrome Extension Features
- ✅ **No CORS Issues**: Extensions can make cross-origin requests without restrictions
- ✅ **Floating Button**: Always visible 🛍️ button on ChatGPT pages
- ✅ **Popup Interface**: Clean status indicator and quick access controls
- ✅ **Search History**: Persistent search history with filtering and management
- ✅ **Auto-Updates**: Automatic updates through Chrome's extension system
- ✅ **Better Security**: No need to paste code into console repeatedly
- ✅ **Enhanced UX**: Proper error handling and status indicators

### Browser Script

For users who prefer not to install extensions or use other browsers.

## Demo

### Single Product Search

https://github.com/user-attachments/assets/b5472c48-1cd9-496b-b120-3fd548582f9f

### Multi-Product Search

https://github.com/user-attachments/assets/9e661765-098e-48c6-ac1b-dc3f4c3e725e

## Features

### Core Features
- 🔍 **Single Product Search**: Search for individual products and get detailed reviews
- 📊 **Multi-Product Comparison**: Compare multiple products side-by-side in a table format
- 📋 **Search History**: Automatically save all your searches and easily reopen them later (Chrome extension)
- 🎯 **Sentiment Analysis**: Visual sentiment breakdown of reviews (positive/neutral/negative)
- 🔗 **Citation Links**: Direct links to source websites for more information
- 🏷️ **Review Themes**: Categorized review themes for easy browsing
- 📱 **Responsive UI**: Clean, modern interface that works seamlessly with ChatGPT

### Advanced Features
- **Auto Authentication**: Automatically fetches your ChatGPT session token
- **Real-time Results**: Live streaming of search results as they come in
- **Comprehensive Results**: Get product details, reviews, ratings, and merchant offers
- **Review Analysis**: AI-generated summaries with sentiment breakdown

## How to Use

### Chrome Extension (Recommended)

1. **Make sure you're logged in** to ChatGPT (https://chatgpt.com)
2. **Click the extension icon** in your Chrome toolbar to check status
3. **Click "Open Product Search"** or use the floating 🛍️ button on ChatGPT
4. **Search for products** using natural language queries
5. **Use tabs** to switch between Search, History, and Reports

#### Single Product Search
- Enter any product name or specific query
- Get detailed reviews, sentiment analysis, and citation links
- View product overview and review summaries

#### Multi-Product Search
- Toggle "Multi-product search" mode
- Enter multiple product names (one per line)
- Compare products in a convenient table format
- Click "View" to see detailed information for any product

#### Search History
- All successful searches are automatically saved to your history
- Click the "📋 History" tab to view your search history
- **Reopen** any previous search to view the results again
- **Filter** your history using the search box
- **Delete** individual searches or clear all history
- History is stored locally in your browser (up to 50 most recent searches)

### Browser Script

#### Method 1: Browser Console

1. **Open ChatGPT** in your browser and make sure you're logged in
2. **Open Developer Tools**:
   - **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - **Firefox**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - **Safari**: Press `Cmd+Option+I` (Mac) - you may need to enable Developer Tools first
3. **Go to Console tab** in the Developer Tools
4. **Copy the entire content of the script** from `chatgpt-product-info.js`
5. **Paste and press Enter** - the modal will appear immediately
6. **Start searching** for products!

#### Method 2: Bookmarklet

Due to CORS restrictions, you'll need to create a proper bookmarklet using a bookmarklet generator:

1. **Copy the entire script** from `chatgpt-product-info.js`
2. **Go to a bookmarklet generator**:
   - [Bookmarkleter](https://chriszarate.github.io/bookmarkleter) (Recommended)
   - [Bookmarklet Maker](https://caiorss.github.io/bookmarklet-maker)
3. **Paste the script** into the generator
4. **Generate the bookmarklet** - it will create a `javascript:` URL
5. **Create a new bookmark** in your browser with:
   - **Name**: "ChatGPT Product Search" 
   - **URL**: The generated `javascript:` code
6. **Visit ChatGPT** and click the bookmark to launch the search tool

**Note**: The bookmarklet will be quite long due to the script size, but it will work properly without CORS issues.

## Search Examples

Try these search queries to see the power of the tool:

- `"iPhone 17 Pro camera quality"`
- `"Nike Air Max running shoes"`
- `"MacBook Air M3 performance"`
- `"Tesla Model 3 reviews"`
- `"Pets Deli Hundefutter"`

## What You'll Get

### Product Information
- **Product Details**: Title, price, description, ratings when available.

### Review Analysis
- **Review Summary**: AI-generated overview of all reviews
- **Sentiment Breakdown**: Visual representation of positive/negative/neutral reviews
- **Review Themes**: Common topics mentioned across reviews
- **Source Citations**: Direct links to original review sources

![ChatGPT Product Info Search Reviews Interface](assets/chatgpt-product-info-reviews.png)

### Additional Data
- **Product Overview**: AI rationale explaining the product category
- **Citation Links**: All source websites with favicons and snippets

## Technical Details

### How It Works

The script leverages ChatGPT's internal `/backend-api/search/product_info` endpoint, which is the same API that powers ChatGPT's built-in product search functionality. It:

1. **Authenticates** using your existing ChatGPT session
2. **Sends search queries** to ChatGPT's product API
3. **Parses streaming responses** in real-time
4. **Extracts structured data** including products, reviews, and citations
5. **Renders results** in a beautiful, organized interface

### API Endpoint
```
POST https://chatgpt.com/backend-api/search/product_info
```

### Authentication
The script automatically fetches your session token from `/api/auth/session` - no manual token input required!

### Data Structure
The API returns structured data including:
- Product entities with pricing and merchant information
- Review summaries with sentiment analysis
- Citation links to source websites
- Rationale and summary text

## Browser Compatibility

- ✅ **Chrome** (Recommended)
- ✅ **Firefox**
- ✅ **Safari**
- ✅ **Opera**

## Requirements

- Active ChatGPT account (free or paid)
- Modern web browser with JavaScript enabled
- Must be used on chatgpt.com domain

## Troubleshooting

### Chrome Extension Issues

#### Extension Not Working
- Make sure you're on https://chatgpt.com (not chat.openai.com)
- Refresh the ChatGPT page after installing the extension
- Check that you're logged in to ChatGPT
- Verify the extension is enabled in chrome://extensions/

#### Popup Shows "Not Ready"
- Navigate to ChatGPT first
- Refresh the ChatGPT page
- Make sure the extension is enabled in chrome://extensions/

#### Floating Button Not Visible
- Check if you're on the correct ChatGPT domain
- Refresh the page
- Look for the 🛍️ button in the bottom-right area of the page

### General Issues

#### "Failed to get authentication token"
- Make sure you're logged in to ChatGPT
- Refresh the ChatGPT page and try again
- Check that you're on the correct chatgpt.com domain

#### "No results found"
- Try different search terms
- Use more specific product names
- Include brand or product names in your search

#### Modal doesn't appear (Browser Script)
- Make sure JavaScript is enabled
- Check browser console for errors
- Try refreshing the page and running the script again

## Privacy & Security

### Chrome Extension
- **No data collection**: The extension doesn't collect or store any personal data
- **Local processing**: All searches are processed locally in your browser
- **Secure authentication**: Uses your existing ChatGPT session tokens
- **No external servers**: Communicates only with ChatGPT's official API
- **Local storage only**: Search history is stored locally in your browser

### Browser Script
- **No data collection**: The script runs entirely in your browser
- **Uses your session**: Leverages your existing ChatGPT authentication
- **No external servers**: All requests go directly to ChatGPT's API
- **No chat history impact**: This won't create new chats, so you won't see it in your history

### Both Methods
- **Open source**: Full code is available for inspection
- **Secure by design**: No third-party data sharing or analytics

## Want to Improve Your AI Visibility?

If you're a business owner or marketer, you might be wondering: **"How do I get MY products to show up in ChatGPT search results?"**

[**Try Finseo**](https://www.finseo.ai/?ref=gptproductsearch) - The next-gen AI SEO platform that helps you:
- **Track your brand visibility** across ChatGPT, Claude, Perplexity, and other AI platforms
- **Monitor what AI says** about your business and products
- **Get actionable recommendations** to improve your presence in AI search results
- **Stay ahead of competitors** in the AI search landscape

*Perfect complement to this product search tool - see what others are finding, then optimize your own products to be discovered!*

## Additional Resources

Learn more about ChatGPT's product discovery capabilities:

- **[Help ChatGPT discover your products](https://openai.com/chatgpt/search-product-discovery)** - Official guide for businesses on how to make their products discoverable in ChatGPT Search
- **[Improved Shopping Results from ChatGPT Search, and How Product Results are Selected](https://help.openai.com/en/articles/11128490-improved-shopping-results-from-chatgpt-search)** - Detailed explanation of how ChatGPT selects and ranks product results

## Contributing

Feel free to submit issues, feature requests, or pull requests on GitHub!

## Author

Created by [Martin Aberastegue (@Xyborg)](https://www.martinaberastegue.com/)

*Originally developed as a browser script, now enhanced with a full-featured Chrome extension for better reliability and user experience.*

## License

MIT License - feel free to modify and use as needed!

---

**Note**: This tool uses ChatGPT's internal API and is intended for educational and personal use. Please respect ChatGPT's terms of service.

**Recommendation**: Use the Chrome extension for the best experience with persistent history, enhanced UI, and automatic updates.
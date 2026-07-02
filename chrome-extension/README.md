# ChatGPT GEO/AEO Product Research

A Chrome extension that scans the current ChatGPT conversation and extracts GEO/AEO, source, citation, product, and offer intelligence.

## What It Does

- Reads the active ChatGPT conversation JSON from your own logged-in session.
- Extracts fan-out queries, fetched sources, cited domains, browsing actions, exposed reasoning recaps, memory/personalization metadata, and product carousel data.
- Optionally hydrates live product offers when ChatGPT provided a real `product_lookup_key`.
- Saves normalized scan snapshots locally with `chrome.storage.local`.
- Exports JSON, sources CSV, products CSV, and a flow SVG/PNG.

## Installation

1. Open `chrome://extensions/`.
2. Enable Developer Mode.
3. Click **Load unpacked**.
4. Select the `chrome-extension` folder.
5. Open `https://chatgpt.com`, log in, and open a conversation.

## How To Use

1. Open a ChatGPT conversation you want to analyze.
2. Click the floating **GEO/AEO** pill or the extension popup button.
3. Use the tabs to inspect Overview, Flow, Fan-out queries, Sources, Citations, Products, Browsing, Reasoning, and Saved scans.

## Privacy

- No external server is used.
- Raw conversation JSON is not saved.
- Saved scans contain normalized extracted fields only and stay in local browser storage.
- The extension communicates only with ChatGPT endpoints in your active session.

## Technical Notes

Runtime scripts:

- `geo-core.js`: session token, conversation fetch, extraction, saved snapshots, product offer hydration.
- `geo-ui.js`: Shadow DOM modal and exports.
- `content-script.js`: floating button, route-change status, popup message bridge.

The old direct `product_info` workflow was replaced because it depended on unstable internal request shapes. The current model analyzes real ChatGPT conversation output and only calls `product_update` when a product card already includes a valid lookup key.

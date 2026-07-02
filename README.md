# ChatGPT GEO/AEO Research

A Chrome extension for extracting GEO/AEO, source, citation, product, and offer intelligence from ChatGPT conversations.

The extension runs inside `chatgpt.com`, reads the active conversation from your logged-in ChatGPT session, normalizes the visible research signals, and lets you save, organize, inspect, and export the results locally.

<img width="1912" height="962" alt="2" src="https://github.com/user-attachments/assets/c6eb21d6-3f76-4d1b-ae47-d005bc2bcf94" />


## What It Captures

- Conversation prompt, title, id, and scan timestamp.
- Fan-out queries generated during the ChatGPT answer.
- Fetched sources, source pipelines, domains, titles, URLs, and dates.
- Cited domains and citation links.
- Exposed reasoning recap and memory/personalization metadata when present.
- Product carousel entities, images, prices, ratings, review counts, selected source links, and available offer data.
- Request flow diagrams showing prompt, fan-out queries, source pipelines, product fan-out, products, and offers.

<img width="1912" height="962" alt="5" src="https://github.com/user-attachments/assets/7793b3a1-fbed-4e69-8234-eeac26e8262b" />

## v2 Highlights

- Cache-first saved conversations: reopening a previously saved conversation loads the saved scan instantly unless you click **Rescan**.
- Saved research library with projects, tags, notes, filters, and import/export.
- Live offer hydration for product cards when ChatGPT provides a valid `product_lookup_key`.
- Flow export as SVG or PNG, including copy-to-clipboard actions.
- Current scan export as JSON or sources CSV.
- Saved library export as JSON, sources CSV, or products CSV.
- No external backend. Saved scans stay in `chrome.storage.local`.

<img width="1912" height="962" alt="6" src="https://github.com/user-attachments/assets/d1974258-9be3-4209-94ce-439568ae4d23" />

## Installation

1. Open `chrome://extensions/`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `chrome-extension` folder.
5. Open `https://chatgpt.com`, log in, and open a conversation.
6. Click the floating **GEO/AEO Research** button or the extension popup button.

## Build A Release Zip

Update the version in `chrome-extension/manifest.json`, then run:

```bash
./scripts/build-extension.sh
```

The script creates `dist/chatgpt-geo-aeo-research-v<version>.zip` with `manifest.json` at the archive root, plus a `.sha256` checksum file. It stages only the runtime files required by the extension and excludes docs, local files, old scripts, `.DS_Store`, PEM keys, existing zips, screenshots, and store assets.

## How To Use

1. Open a ChatGPT conversation.
2. Click **GEO/AEO Research**.
3. Review the tabs:
   - **Overview** for summary metrics and domain breakdowns.
   - **Request flow** for the visual request/source/product graph.
   - **Fan-out queries** for generated search/product queries.
   - **Sources** and **Citations** for fetched and cited URLs.
   - **Products** for product cards, ratings, selected links, and offers.
   - **Reasoning** for exposed reasoning recap or memory metadata.
   - **Saved** for local research organization.
4. Click **Save** to assign a project, tags, and notes.
5. Use **Rescan** only when you want to refresh the conversation from ChatGPT.

## Saved Library

Saved scans are stored locally in Chrome. The Saved tab supports:

- Assigning scans to projects.
- Adding tags with custom colors.
- Adding notes.
- Filtering by project or tag.
- Opening cached scans without rescanning.
- Importing and exporting saved library backups.
- Exporting saved source and product tables as CSV.

## Product Offers

The extension does not call the old direct `product_info` endpoint. It analyzes products already present in the ChatGPT conversation and hydrates live offers only when a product includes a valid lookup key.

If a saved scan is opened from cache, offers are not auto-refetched. Click **Reload offers** when you want fresh offer data.

## Research Inspiration

This v2 revamp was partly inspired by Suganthan Mohanadasan's research, [How ChatGPT Actually Picks Sources](https://suganthan.com/blog/how-chatgpt-picks-sources/), which documents source-selection signals visible in ChatGPT network traffic, including fan-out queries, source pipelines, and the difference between fetched, cited, and mentioned sources.

## Privacy

- No external server is used.
- Data is stored locally in Chrome extension storage.
- The extension communicates with ChatGPT endpoints using your active ChatGPT session.
- Raw conversation JSON is not saved; saved snapshots contain normalized extracted fields.

## Runtime Files

- `chrome-extension/manifest.json`: extension manifest.
- `chrome-extension/content-script.js`: floating button, route status, popup bridge.
- `chrome-extension/geo-core.js`: ChatGPT session access, conversation extraction, storage, import/export helpers, offer hydration.
- `chrome-extension/geo-ui.js`: Shadow DOM modal UI, tabs, flow diagram, saved-library UI.
- `chrome-extension/popup.html` and `chrome-extension/popup.js`: extension toolbar popup.
- `chrome-extension/styles.css`: floating button styles.

## Release Notes

This v2 extension replaces the old browser-script flow. The old direct product-search scripts and screenshots are no longer part of the tracked release package.

## Author

Created by [Martin Aberastegue](https://www.martinaberastegue.com).

## License

See [LICENSE](LICENSE).

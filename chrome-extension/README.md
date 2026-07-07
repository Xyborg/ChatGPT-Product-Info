# ChatGPT GEO/AEO Research

A Chrome extension that scans the current ChatGPT conversation and extracts GEO/AEO, source, citation, product, and offer intelligence.

## What It Does

- Reads the active ChatGPT conversation JSON from your own logged-in session.
- Extracts fan-out queries, fetched sources, cited domains, exposed reasoning recaps, memory/personalization metadata, Deep Research artifacts, and product carousel data.
- Shows GEO/AEO query intent distribution and source pipeline/source-type summaries in the Overview tab.
- Classifies fetched sources with a local US/EU-aware domain heuristic, including public/education domains, retailers and marketplaces, brands/vendors, price-comparison sites, review/test sites, news/media, forums, social/video, docs/repos, blogs, and encyclopedic sources.
- Shows Deep Research selected sources, recoverable search/open/find traces, blocked-fetch signals, async retrieval hints, and diagnostics when ChatGPT exposes them.
- Optionally hydrates live product offers when ChatGPT provided a real `product_lookup_key`.
- Saves normalized scan snapshots locally with `chrome.storage.local`.
- Organizes saved scans with local projects, tags, and notes.
- Exports current scans, sources CSV, products CSV, flow SVG/PNG, and the saved scan library.

## Installation

1. Open `chrome://extensions/`.
2. Enable Developer Mode.
3. Click **Load unpacked**.
4. Select the `chrome-extension` folder.
5. Open `https://chatgpt.com`, log in, and open a conversation.

## How To Use

1. Open a ChatGPT conversation you want to analyze.
2. Click the floating **GEO/AEO Research** pill or the extension popup button.
3. Use the tabs to inspect Overview, Request flow, Fan-out queries, Sources, Citations, Products, Deep Research, Reasoning, and Saved scans.
4. Use **Overview** to compare query intent, source pipelines, fetched source type percentages, and fetched-vs-cited domains.
5. Use **Saved** to assign scans to projects, add tags/notes, import backups, or export all saved research.

## Privacy

- No external server is used.
- Raw conversation JSON is not saved.
- Saved scans contain normalized extracted fields only and stay in local browser storage.
- The extension communicates only with ChatGPT endpoints in your active session.

## Technical Notes

Runtime scripts:

- `geo-core.js`: session token, conversation fetch, extraction, saved snapshots, project/tag storage, imports, and product offer hydration.
- `geo-ui.js`: Shadow DOM modal, saved scan organization, and exports.
- `content-script.js`: floating button, route-change status, popup message bridge.
- `../scripts/classify-domain-smoke-test.js`: source taxonomy smoke test for representative public, retailer, brand, price-comparison, and commercial domains.

The old direct `product_info` workflow was replaced because it depended on unstable internal request shapes. The current model analyzes real ChatGPT conversation output and only calls `product_update` when a product card already includes a valid lookup key.

Deep Research activity is partly server-side and the full live step trail is not always persisted into the final conversation payload. When that happens, the extension shows the recovered selected sources, backend hints, and diagnostic metadata rather than fabricating missing steps.

Source type labels are domain-based heuristics. Fetched sources and final citations are tracked separately, so the extension can show what ChatGPT retrieved versus what it cited.

## Research Inspiration

This v2 revamp was partly inspired by Suganthan Mohanadasan's research, [How ChatGPT Actually Picks Sources](https://suganthan.com/blog/how-chatgpt-picks-sources/), which documents source-selection signals visible in ChatGPT network traffic, including fan-out queries, source pipelines, and fetched-vs-cited behavior.

#!/usr/bin/env node

global.window = global;
require('../chrome-extension/geo-core.js');

const parseSidebarConversation = global.CgptGeoResearchCore && global.CgptGeoResearchCore.parseSidebarConversation;
if (typeof parseSidebarConversation !== 'function') {
    throw new Error('parseSidebarConversation export was not found.');
}

const stream = [
    'data: {"v":{"type":"message","data":{"id":"assistant-1","author":{"role":"assistant"},"content":{"content_type":"text","parts":[""]},"metadata":{"content_references":[]},"channel":"final"}}}',
    'data: {"o":"patch","v":[{"p":"/data/content/parts/0","o":"append","v":"\\ue200product_rationale\\ue202Sensitive food summary.\\ue202turn0search0\\ue201"},{"p":"/data/metadata/content_references","o":"append","v":[{"matched_text":"product_rationale","type":"product_rationale","rationale":"Sensitive food summary.","citations":[{"cite":"turn0search0","title":"Shop source","url":"https://www.fressnapf.de/product","snippet":"Single protein wet food."}],"grouped_citation":{"title":"Grouped shop","url":"https://www.amazon.de/product","supporting_websites":[{"title":"Retail support","url":"https://www.galaxus.ch/product","snippet":"Good overall value."}]}}]}]}',
    'data: {"v":[{"p":"/data/metadata/content_references","o":"append","v":[{"matched_text":"review","type":"product_review","name":"Amazon Reviews","title":"Amazon","url":"https://www.amazon.de/review","prompt_text":"Positive: owners report good palatability.","sentiment":"Positive"},{"matched_text":"review","type":"product_review","title":"Brand review","url":"https://example.com/review","prompt_text":"Negative: one dog had soft stools.","sentiment":"Negative"},{"matched_text":"review","type":"product_review","prompt_text":"Positive generated summary without a source.","sentiment":"Positive"}]},{"p":"/data/metadata/search_result_groups","o":"replace","v":[{"domain":"www.fressnapf.de","entries":[{"name":"Fressnapf Reviews","title":"Shop source","url":"https://www.fressnapf.de/product","snippet":"Single protein wet food."}]}]}]}',
    'data: [DONE]',
].join('\n');

const insight = parseSidebarConversation(stream);
if (!insight) throw new Error('Expected sidebar insight.');
if (insight.rationale !== 'Sensitive food summary.') {
    throw new Error(`Expected rationale, got ${JSON.stringify(insight.rationale)}`);
}
if (insight.sentimentCounts.positive !== 1 || insight.sentimentCounts.negative !== 1) {
    throw new Error(`Unexpected sentiment counts: ${JSON.stringify(insight.sentimentCounts)}`);
}
if (insight.sources.length < 3) {
    throw new Error(`Expected at least 3 sources, got ${insight.sources.length}`);
}
if (!insight.sources.some((source) => source.domain === 'amazon.de')) {
    throw new Error('Expected grouped citation source domain.');
}
if (!insight.reviews.some((review) => review.name === 'Amazon Reviews')) {
    throw new Error('Expected review source name to be preserved.');
}
if (!insight.sources.some((source) => source.name === 'Fressnapf Reviews')) {
    throw new Error('Expected search result source name to be preserved.');
}

console.log(`sidebar insight smoke test passed (${insight.sources.length} sources).`);

#!/usr/bin/env node

global.window = global;
require('../chrome-extension/geo-core.js');

const CORE = global.CgptGeoResearchCore || {};
if (typeof CORE.extractConversationIntel !== 'function') {
    throw new Error('extractConversationIntel export was not found.');
}
if (typeof CORE.loadProductOffers !== 'function') {
    throw new Error('loadProductOffers export was not found.');
}

const conversation = {
    title: 'Product locale smoke test',
    mapping: {
        msg1: {
            message: {
                id: 'msg1',
                author: { role: 'assistant' },
                content: { content_type: 'text', parts: ['Products'] },
                metadata: {
                    content_references: [{
                        type: 'products',
                        products: [
                            {
                                title: 'Exact US mower',
                                price: '$499.00',
                                product_lookup_data: {
                                    type: 'chat_gpt_google_shopping_product',
                                    catalogid: '111111111111',
                                    query: 'lawn mower',
                                    gl: 'us',
                                    hl: 'en',
                                },
                            },
                            {
                                title: 'Missing locale mower',
                                price: '$399.00',
                                product_lookup_data: {
                                    type: 'chat_gpt_google_shopping_product',
                                    catalogid: '222222222222',
                                    query: 'lawn mower',
                                },
                            },
                        ],
                    }],
                },
            },
        },
    },
};

const intel = CORE.extractConversationIntel(conversation, { id: 'locale-test', url: 'https://chatgpt.com/c/locale-test' });
const exact = intel.products.find((product) => product.title === 'Exact US mower');
const missing = intel.products.find((product) => product.title === 'Missing locale mower');

if (!exact || !missing) throw new Error(`Expected two parsed products, got ${intel.products.length}.`);
if (exact.googleGl !== 'us' || exact.googleHl !== 'en' || exact.googleLocaleSource !== 'metadata') {
    throw new Error(`Expected exact locale metadata, got ${JSON.stringify({ gl: exact.googleGl, hl: exact.googleHl, source: exact.googleLocaleSource })}`);
}
if (!/gl=us/.test(exact.googleShoppingCandidateUrl) || !/hl=en/.test(exact.googleShoppingCandidateUrl)) {
    throw new Error(`Expected exact URL to preserve locale, got ${exact.googleShoppingCandidateUrl}`);
}
if (missing.googleGl || missing.googleHl || missing.googleLocaleSource !== 'missing') {
    throw new Error(`Expected missing locale provenance, got ${JSON.stringify({ gl: missing.googleGl, hl: missing.googleHl, source: missing.googleLocaleSource })}`);
}
if (/gl=de|hl=en/.test(missing.googleShoppingCandidateUrl)) {
    throw new Error(`Missing locale URL should not contain fallback locale params: ${missing.googleShoppingCandidateUrl}`);
}

(async () => {
    let captured = null;
    global.fetch = async (_url, init) => {
        captured = init;
        return { ok: true, status: 200, text: async () => 'data: [DONE]\n' };
    };

    await CORE.loadProductOffers({
        title: 'Override mower',
        query: 'lawn mower',
        lookupKey: {
            data: JSON.stringify({
                provider_metadata: {
                    p2: {
                        id_to_token_map: {},
                    },
                },
            }),
            version: '1',
        },
    }, 'token', { gl: 'ar', hl: 'es' });

    const body = JSON.parse(captured.body);
    const lookupData = JSON.parse(body.product_lookup_key.data);
    if (lookupData.gl !== 'ar' || lookupData.hl !== 'es' || lookupData.market_override_source !== 'user') {
        throw new Error(`Expected lookup key market override, got ${JSON.stringify(lookupData)}`);
    }
    if (captured.headers['oai-language'] !== 'es-AR' || !/^es-AR,es;q=0\.9/.test(captured.headers['accept-language'])) {
        throw new Error(`Expected market headers, got ${JSON.stringify(captured.headers)}`);
    }

    console.log('product locale smoke test passed.');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});

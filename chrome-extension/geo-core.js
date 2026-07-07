// ChatGPT GEO/AEO Research - core extraction and storage helpers.
(function () {
    'use strict';

    const SNAPSHOT_KEY = 'cgptGeoResearchSnapshots';
    const PROJECTS_KEY = 'cgptGeoResearchProjects';
    const TAGS_KEY = 'cgptGeoResearchTags';
    const QUERY_JUNK = new Set(['deprecated', 'none', 'null', 'n/a', 'undefined']);
    const UNKNOWN_PIPELINE = 'Unknown';

    function normalizePipeline(value) {
        const pipeline = String(value || '').trim();
        return pipeline && pipeline !== '?' ? pipeline : UNKNOWN_PIPELINE;
    }

    function pipelineCountsFromSources(sources) {
        const counts = {};
        (sources || []).forEach((source) => {
            const key = normalizePipeline(source && source.pipeline);
            counts[key] = (counts[key] || 0) + 1;
        });
        return counts;
    }

    function normalizePipelineMix(mix) {
        const counts = {};
        Object.keys(mix || {}).forEach((key) => {
            const pipeline = normalizePipeline(key);
            const value = Number(mix[key] || 0);
            counts[pipeline] = (counts[pipeline] || 0) + (Number.isFinite(value) ? value : 0);
        });
        return counts;
    }

    function normalizeStatsPipelines(stats) {
        const next = { ...(stats || {}) };
        if (next.primaryPipeline) next.primaryPipeline = normalizePipeline(next.primaryPipeline);
        if (next.pipelineMix) next.pipelineMix = normalizePipelineMix(next.pipelineMix);
        return next;
    }

    function normalizeIntelPipelines(intel) {
        const next = { ...(intel || {}) };
        if (Array.isArray(next.sources)) {
            next.sources = next.sources.map((source) => ({ ...source, pipeline: normalizePipeline(source && source.pipeline) }));
        }
        next.stats = normalizeStatsPipelines(next.stats || {});
        return next;
    }

    function getConversationId(urlPath = window.location.href) {
        const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
        const directMatch = String(urlPath || '').match(uuidPattern);
        if (directMatch) return directMatch[0];

        const candidates = [
            window.location.pathname,
            document.querySelector('link[rel="canonical"]')?.href,
            document.querySelector('meta[property="og:url"]')?.content,
        ];
        for (const candidate of candidates) {
            const match = String(candidate || '').match(uuidPattern);
            if (match) return match[0];
        }
        return null;
    }

    function getPageStatus() {
        if (!window.location.hostname.includes('chatgpt.com')) {
            return { ready: false, reason: 'not_chatgpt', message: 'Open ChatGPT first.' };
        }
        const conversationId = getConversationId();
        if (!conversationId) {
            return { ready: false, reason: 'no_conversation', message: 'Open a ChatGPT conversation to scan.' };
        }
        return { ready: true, reason: 'ready', conversationId, message: 'Ready to scan this conversation.' };
    }

    async function getSessionToken() {
        const response = await fetch('/api/auth/session', { credentials: 'include' });
        if (!response.ok) {
            throw new Error(`Session API returned HTTP ${response.status}`);
        }
        const session = await response.json();
        if (!session || !session.accessToken) {
            throw new Error('No ChatGPT access token found. Make sure you are logged in.');
        }
        return session.accessToken;
    }

    async function fetchConversation(conversationId, token) {
        const response = await fetch(`/backend-api/conversation/${conversationId}`, {
            credentials: 'include',
            headers: { authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
            throw new Error(`Conversation API returned HTTP ${response.status}`);
        }
        return response.json();
    }

    async function scanConversationById(conversationId) {
        if (!conversationId) throw new Error('No conversation id to scan.');
        const token = await getSessionToken();
        const raw = await fetchConversation(conversationId, token);
        const intel = extractConversationIntel(raw, {
            id: conversationId,
            url: `https://chatgpt.com/c/${conversationId}`,
        });
        return { intel, raw, token };
    }

    async function scanCurrentConversation() {
        const status = getPageStatus();
        if (!status.ready) {
            throw new Error(status.message);
        }
        return scanConversationById(status.conversationId);
    }

    function cleanDomain(value) {
        return (value || '').toString().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    }

    function flattenText(value) {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (Array.isArray(value)) return value.map(flattenText).filter(Boolean).join('\n');
        if (typeof value === 'object') {
            if (typeof value.text === 'string') return value.text;
            if (typeof value.content === 'string') return value.content;
            if (Array.isArray(value.parts)) return value.parts.map(flattenText).filter(Boolean).join('\n');
        }
        return '';
    }

    function messageText(content) {
        if (!content) return '';
        if (Array.isArray(content.parts)) return content.parts.map(flattenText).filter(Boolean).join('\n');
        if (typeof content.text === 'string') return content.text;
        if (typeof content.content === 'string') return content.content;
        return '';
    }

    function dedupe(items, keyFn) {
        const seen = new Set();
        const out = [];
        items.forEach((item) => {
            const key = keyFn(item);
            if (!key || seen.has(key)) return;
            seen.add(key);
            out.push(item);
        });
        return out;
    }

    function pushQuery(queries, query, via) {
        if (query == null) return;
        let value = query;
        if (typeof value === 'object') {
            value = value.q || value.query || value.text || value.title;
        }
        const text = String(value || '').trim();
        if (!text || QUERY_JUNK.has(text.toLowerCase())) return;
        queries.push({ query: text, via: via || 'unknown' });
    }

    function parseWebCommand(raw, queries, browseActions) {
        if (!raw || typeof raw !== 'string') return;
        let parsed = null;
        try {
            parsed = JSON.parse(raw);
        } catch (_) {
            parsed = null;
        }

        if (parsed && typeof parsed === 'object') {
            if (parsed.search_query) [].concat(parsed.search_query).forEach((q) => pushQuery(queries, q, 'web.search_query'));
            if (parsed.system1_search_query) [].concat(parsed.system1_search_query).forEach((q) => pushQuery(queries, q, 'system1_search_query'));
            if (parsed.product_query && parsed.product_query.search) [].concat(parsed.product_query.search).forEach((q) => pushQuery(queries, q, 'product_query.search'));
            if (parsed.q) pushQuery(queries, parsed.q, 'web.q');
            if (parsed.open) browseActions.push({ action: 'open', arg: JSON.stringify(parsed.open) });
            if (parsed.click) browseActions.push({ action: 'click', arg: JSON.stringify(parsed.click) });
            if (parsed.find) browseActions.push({ action: 'find', arg: JSON.stringify(parsed.find) });
            return;
        }

        let match;
        const searchRegex = /search\(\s*["'`]([^"'`]+)["'`]/g;
        while ((match = searchRegex.exec(raw))) pushQuery(queries, match[1], 'web.search()');

        const findRegex = /find\(\s*["'`]([^"'`]+)["'`]/g;
        while ((match = findRegex.exec(raw))) browseActions.push({ action: 'find', arg: match[1] });

        const openRegex = /(?:open_url|open|mclick)\(\s*([^)]+)\)/g;
        while ((match = openRegex.exec(raw))) browseActions.push({ action: 'open', arg: match[1].trim() });
    }

    function googleShoppingUrl(parts) {
        const terms = (parts || [])
            .map((part) => String(part || '').trim())
            .filter(Boolean);
        const unique = [...new Set(terms)];
        if (!unique.length) return '';
        return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(unique.join(' '))}`;
    }

    function decodeBase64Json(value) {
        const token = String(value || '').trim();
        if (!token) return null;
        try {
            const normalized = token.replace(/-/g, '+').replace(/_/g, '/');
            const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
            const json = typeof atob === 'function'
                ? decodeURIComponent(escape(atob(padded)))
                : '';
            return json ? JSON.parse(json) : null;
        } catch (_) {
            return null;
        }
    }

    function parseMaybeJsonObject(value) {
        if (!value) return null;
        if (typeof value === 'object') return value;
        if (typeof value !== 'string') return null;
        const trimmed = value.trim();
        if (!trimmed || !/^[{[]/.test(trimmed)) return null;
        try {
            return JSON.parse(trimmed);
        } catch (_) {
            return null;
        }
    }

    function looksLikeGoogleCatalogId(value) {
        return /^\d{8,}$/.test(String(value || '').trim());
    }

    function buildGoogleShoppingCandidateUrl({
        catalogId,
        headlineOfferDocid,
        imageDocid,
        rds,
        gpcid,
        merchantId,
        query = '',
        pvt = 'hg',
        uule = null,
        gl = 'de',
        hl = 'en',
        overlay = true,
    }) {
        if (!catalogId) return null;
        const prdsParts = [`catalogid:${catalogId}`];
        if (headlineOfferDocid) prdsParts.push(`headlineOfferDocid:${headlineOfferDocid}`);
        if (imageDocid) prdsParts.push(`imageDocid:${imageDocid}`);
        if (rds) prdsParts.push(`rds:${rds}`);
        if (gpcid) prdsParts.push(`gpcid:${gpcid}`);
        if (merchantId) prdsParts.push(`mid:${merchantId}`);
        if (pvt) prdsParts.push(`pvt:${pvt}`);

        const params = new URLSearchParams();
        if (overlay) params.set('ibp', 'oshop');
        params.set('udm', '28');
        params.set('q', String(query || '').replace(/\+/g, ' ').trim());
        params.set('hl', hl || 'en');
        params.set('gl', gl || 'de');
        if (uule) params.set('uule', uule);
        params.set('prds', prdsParts.join(','));

        const queryString = params.toString()
            .replace(/%3A/g, ':')
            .replace(/%2C/g, ',');
        return `https://www.google.com/search?${queryString}`;
    }

    function normalizeGoogleShoppingProduct(raw = {}) {
        if (!raw || typeof raw !== 'object') return null;
        const catalogId = raw.catalogid || raw.catalog_id || null;
        const productId = raw.productid || raw.product_id || null;
        const headlineOfferDocid = raw.headlineOfferDocid || raw.headline_offer_docid || null;
        const imageDocid = raw.imageDocid || raw.image_docid || null;
        const gpcid = raw.gpcid || null;
        const merchantId = raw.mid || null;
        const rds = raw.rds || null;
        const query = raw.query || '';
        const pvt = raw.pvt || 'hg';
        const uule = raw.uule || null;
        const gl = raw.gl || 'de';
        const hl = raw.hl || 'en';
        const ei = raw.ei || null;
        const googleShoppingCandidateUrl = buildGoogleShoppingCandidateUrl({
            catalogId,
            headlineOfferDocid,
            imageDocid,
            rds,
            gpcid,
            merchantId,
            query,
            pvt,
            uule,
            gl,
            hl,
        });
        if (!catalogId && !googleShoppingCandidateUrl) return null;
        return {
            source: 'chatgpt_google_shopping_product',
            catalogId,
            productId: productId || null,
            gpcid,
            headlineOfferDocid,
            imageDocid,
            merchantId,
            rds,
            query,
            pvt,
            uule,
            gl,
            hl,
            ei,
            googleShoppingCandidateUrl,
        };
    }

    function pushGoogleShoppingProduct(products, raw) {
        const normalized = normalizeGoogleShoppingProduct(raw);
        if (normalized && normalized.googleShoppingCandidateUrl) products.push(normalized);
    }

    function googleShoppingProductsFromAny(value, products = [], seen = new WeakSet(), depth = 0) {
        if (depth > 8 || !value) return products;
        const parsed = parseMaybeJsonObject(value) || value;
        if (!parsed || typeof parsed !== 'object') return products;
        if (seen.has(parsed)) return products;
        seen.add(parsed);

        if (Array.isArray(parsed)) {
            parsed.forEach((item) => googleShoppingProductsFromAny(item, products, seen, depth + 1));
            return products;
        }

        if (parsed.type === 'chat_gpt_google_shopping_product' || parsed.catalogid || parsed.catalog_id) {
            pushGoogleShoppingProduct(products, parsed);
        }

        const tokenMap = parsed.id_to_token_map;
        if (tokenMap && typeof tokenMap === 'object') {
            Object.keys(tokenMap).forEach((id) => {
                pushGoogleShoppingProduct(products, decodeBase64Json(tokenMap[id]));
            });
        }

        Object.keys(parsed).forEach((key) => {
            const child = parsed[key];
            if (!child || (typeof child !== 'object' && typeof child !== 'string')) return;
            googleShoppingProductsFromAny(child, products, seen, depth + 1);
        });
        return products;
    }

    function googleShoppingProductsFromLookupData(lookupData) {
        return googleShoppingProductsFromAny(lookupData);
    }

    function googleShoppingProductsFromProductIds(product) {
        const ids = Array.isArray(product && product.product_ids) ? product.product_ids : [];
        const products = [];
        for (const item of ids) {
            if (!item || typeof item !== 'object') continue;
            if (item.type !== 'chat_gpt_google_shopping_product') continue;
            const normalized = normalizeGoogleShoppingProduct(item);
            if (normalized && normalized.googleShoppingCandidateUrl) products.push(normalized);
        }
        return products;
    }

    function firstGoogleShoppingProduct(products) {
        const seen = new Set();
        const deduped = [];
        (products || []).forEach((product) => {
            const key = product.catalogId || product.googleShoppingCandidateUrl;
            if (!key || seen.has(key)) return;
            seen.add(key);
            deduped.push(product);
        });
        return deduped.find((product) => product.googleShoppingCandidateUrl) || deduped[0] || null;
    }

    function googleShoppingProductFromOuterProduct(product, query) {
        if (!product || typeof product !== 'object') return null;
        const catalogId = [
            product.catalogid,
            product.catalog_id,
            product.googleCatalogId,
            product.product_id,
            product.id,
        ].find(looksLikeGoogleCatalogId) || null;
        if (!catalogId) return null;
        return normalizeGoogleShoppingProduct({
            catalog_id: catalogId,
            product_id: product.productid || null,
            query: query || product.query || '',
        });
    }

    function mapOffers(offers) {
        return (offers || []).map((offer) => {
            const details = offer.price_details || {};
            const url = offer.url || offer.offer_url || offer.product_url || offer.click_url || offer.checkout_url || offer.external_url || '';
            const merchant = offer.merchant_name || offer.seller_name || '';
            const productName = offer.product_name || '';
            return {
                merchant,
                productName,
                price: offer.price || '',
                base: details.base || '',
                total: details.total || '',
                shipping: details.shipping || '',
                details: offer.details || '',
                tag: (offer.tag && offer.tag.text) || '',
                url,
                shoppingUrl: googleShoppingUrl([productName, merchant]),
                available: offer.available !== false,
                original: offer.original_price || '',
            };
        });
    }

    function addSource(sources, entry) {
        if (!entry || (!entry.url && !entry.attribution)) return;
        sources.push({
            domain: cleanDomain(entry.attribution || entry.url),
            pipeline: normalizePipeline(entry.result_source || entry.pipeline),
            title: entry.title || '',
            url: entry.url || '',
            pubDate: entry.pub_date || '',
            snippet: entry.snippet || '',
            snippetLength: (entry.snippet || '').length,
        });
    }

    function addProduct(products, product, index, origin) {
        if (!product) return;
        const firstValue = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');
        let providerUrl = '';
        let generatedQuery = '';
        let lookupData = null;
        try {
            lookupData = parseMaybeJsonObject(product.product_lookup_key && product.product_lookup_key.data) || {};
            providerUrl = lookupData.provider_url || '';
            generatedQuery = lookupData.generated_product_query || lookupData.request_query || '';
        } catch (_) {
            providerUrl = '';
            generatedQuery = '';
        }
        const googleProducts = [
            ...googleShoppingProductsFromProductIds(product),
            ...googleShoppingProductsFromAny(product.product_lookup_data),
            ...googleShoppingProductsFromAny(product.product_lookup_key),
            ...googleShoppingProductsFromLookupData(lookupData),
        ];
        const outerGoogleProduct = googleShoppingProductFromOuterProduct(product, generatedQuery);
        if (outerGoogleProduct) googleProducts.push(outerGoogleProduct);
        const googleProduct = firstGoogleShoppingProduct(googleProducts);
        const googleQuery = (googleProduct && googleProduct.query) || generatedQuery;

        const showcase = product.showcase_metadata || null;
        const image = (showcase && showcase.image && showcase.image.url) || (product.image_urls && product.image_urls[0]) || '';
        const description = product.description || product.snippet || product.subtitle || product.tagline || product.caption || product.body || product.summary || product.merchant_description || product.rationale ||
            (showcase && (showcase.description || showcase.subtitle || showcase.summary || showcase.tagline || showcase.caption || showcase.body)) || '';

        products.push({
            title: product.title || '',
            price: product.price || '',
            merchants: product.merchants || '',
            tag: product.featured_tag || '',
            description,
            rating: firstValue(product.rating, product.average_rating, product.aggregate_rating, product.star_rating, product.review_rating, product.rating_value, product.ratingValue) || null,
            reviews: firstValue(product.num_reviews, product.review_count, product.reviews_count, product.rating_count, product.numRatings, product.num_ratings, product.reviews) || null,
            image,
            providerUrl: providerUrl || product.url || '',
            shoppingUrl: '',
            googleCatalogId: googleProduct && googleProduct.catalogId || null,
            googleProductId: googleProduct && googleProduct.productId || null,
            googleGpcid: googleProduct && googleProduct.gpcid || null,
            googleHeadlineOfferDocid: googleProduct && googleProduct.headlineOfferDocid || null,
            googleImageDocid: googleProduct && googleProduct.imageDocid || null,
            googleMerchantId: googleProduct && googleProduct.merchantId || null,
            googleRds: googleProduct && googleProduct.rds || null,
            googlePvt: googleProduct && googleProduct.pvt || null,
            googleEi: googleProduct && googleProduct.ei || null,
            googleQuery: googleQuery || null,
            googleGl: googleProduct && googleProduct.gl || null,
            googleHl: googleProduct && googleProduct.hl || null,
            googleUule: googleProduct && googleProduct.uule || null,
            googleShoppingCandidateUrl: googleProduct && googleProduct.googleShoppingCandidateUrl || null,
            query: generatedQuery,
            showcased: Boolean(showcase),
            position: index || 0,
            offers: mapOffers(product.offers),
            lookupKey: product.product_lookup_key || null,
            origin: origin || 'conversation',
        });
    }

    const RESEARCH_COMMAND_ALIASES = {
        search: 'search', search_query: 'search',
        open: 'open', open_url: 'open', mclick: 'open',
        find: 'find', find_in_page: 'find', find_on_page: 'find',
        click: 'click', click_result: 'click',
        quote: 'quote', quote_lines: 'quote',
        back: 'back', scroll: 'scroll', screenshot: 'screenshot',
    };

    function parseResearchStep(message, meta, content) {
        const authorName = (message.author && message.author.name) || '';
        const isBrowserTool = /^browser([._]|$)/.test(authorName);
        const isWebRun = /^web\.run$|^web$/.test(authorName);
        // other tools (file_search, myfiles_browser, python, ...) reuse metadata.command and even
        // tether_browsing_display, so anything not clearly the web browser/runner is rejected.
        if (!isBrowserTool && !isWebRun && authorName) return null;
        const isTether = content.content_type === 'tether_browsing_display';
        if (!isBrowserTool && !isWebRun && !isTether) return null;
        const kwargs = (meta.kwargs && typeof meta.kwargs === 'object') ? meta.kwargs : {};

        const summary = String(content.summary || '');
        const result = String(content.result || '');
        const queryMatch = summary.match(/Search results for query\s*[`'"](.+?)[`'"]/i) || result.match(/Search results for query\s*[`'"](.+?)[`'"]/i);
        const windowMatch = (summary + '\n' + result).match(/viewing lines? \[(\d+)\s*-\s*(\d+)\] of (\d+)/i);

        // command: explicit metadata first, then the tool author suffix (browser.search -> search),
        // then infer from the payload shape (search summary vs page window).
        let rawCommand = meta.command || (isBrowserTool && authorName.includes('.') ? authorName.split('.').pop() : '');
        if (!rawCommand && isWebRun) rawCommand = queryMatch ? 'search' : (windowMatch ? 'open' : 'run');
        if (!rawCommand && isTether) rawCommand = queryMatch ? 'search' : (windowMatch ? 'open' : '');
        const command = RESEARCH_COMMAND_ALIASES[String(rawCommand).toLowerCase()] || '';
        // strict whitelist: reject spinner/prompt/context_stuff and any other non-browser command
        if (!command) return null;
        // a bare tether message with no author must show real browsing evidence
        if (!isBrowserTool && !isWebRun && !meta.command && !queryMatch && !windowMatch && !/Fetch denied by robots\.txt/i.test(result)) return null;

        // web.run search calls store the query in content parts / kwargs rather than a summary line.
        const partsText = Array.isArray(content.parts) ? content.parts.filter((part) => typeof part === 'string').join(' ') : '';
        const webRunQuery = kwargs.query || kwargs.q || kwargs.search_query
            || (queryMatch ? queryMatch[1] : '')
            || (isWebRun && command === 'search' ? (partsText.match(/(?:search|query)[:\s"']+([^"'\n]{3,120})/i) || [])[1] || '' : '');

        const urlCandidate = meta.display_url || meta.url || content.url || kwargs.url || kwargs.href || kwargs.link || '';
        const resultUrlMatch = !urlCandidate ? ((result + '\n' + partsText).match(/^\s*URL:\s*(https?:\/\/\S+)/im) || (result + '\n' + partsText).match(/https?:\/\/[^\s\)\]】]+/)) : null;
        const url = urlCandidate || (resultUrlMatch ? (resultUrlMatch[1] || resultUrlMatch[0]) : '');
        const robotsBlocked = /Fetch denied by robots\.txt/i.test(result) || /Fetch denied by robots\.txt/i.test(summary);
        const findMiss = command === 'find' && (/(no match|not found|0 matches)/i.test(result) || result.length < 70);

        return {
            command,
            query: webRunQuery,
            pattern: kwargs.pattern || (command === 'find' ? kwargs.query || kwargs.q || '' : ''),
            topn: kwargs.topn != null ? kwargs.topn : null,
            source: kwargs.source || meta.source || '',
            url,
            domain: cleanDomain(url),
            title: meta.display_title || content.title || '',
            fromUrl: meta.clicked_from_url || '',
            fromTitle: meta.clicked_from_title || '',
            window: windowMatch ? { from: Number(windowMatch[1]), to: Number(windowMatch[2]), total: Number(windowMatch[3]) } : null,
            caterpillarUrls: Array.isArray(meta.caterpillar_urls) ? meta.caterpillar_urls.slice(0, 20) : [],
            robotsBlocked,
            findMiss,
            resultChars: result.length,
            summaryPreview: summary.slice(0, 160),
            resultPreview: result.slice(0, 200),
            createTime: message.create_time || 0,
            debug: {
                author: authorName || '(none)',
                contentType: content.content_type || '(none)',
                rawCommand: rawCommand || '(none)',
                metaKeys: Object.keys(meta).slice(0, 24).join(','),
                kwargsKeys: Object.keys(kwargs).slice(0, 12).join(','),
            },
        };
    }

    function extractConversationIntel(conversation, context) {
        const queries = [];
        const sources = [];
        const citations = [];
        const useCases = [];
        const browseActions = [];
        const personalSources = [];
        const products = [];
        const memory = [];
        const reasoning = [];
        const reasoningRecaps = [];
        const researchSteps = [];
        const researchQuotes = [];
        const census = { authors: {}, contentTypes: {}, commands: {}, recipients: {}, hintKeys: {}, allMetaKeys: {} };
        const bump = (bucket, key) => { if (key) bucket[key] = (bucket[key] || 0) + 1; };
        const selectedSources = [];      // caterpillar_selected_sources — what the run actually chose
        const asyncSources = {};          // async_source counts — server-side retrieval backends used
        let deepResearchVersion = '';
        const assistantTexts = [];
        const userPrompts = [];

        const mapping = conversation.mapping || {};
        Object.values(mapping).forEach((node) => {
            const message = node && node.message;
            if (!message) return;

            const meta = message.metadata || {};
            const content = message.content || {};
            const role = (message.author && message.author.role) || '';
            const recipient = message.recipient || '';
            const authorName = (message.author && message.author.name) || '';
            const text = messageText(content);

            if (role === 'user' && text) userPrompts.push(text.trim());
            if (role === 'assistant' && text) assistantTexts.push(text.trim());

            bump(census.authors, authorName || role || '(none)');
            Object.keys(meta).forEach((key) => bump(census.allMetaKeys, key));
            bump(census.contentTypes, content.content_type || '(none)');
            if (meta.command) bump(census.commands, String(meta.command));
            if (recipient) bump(census.recipients, recipient);
            Object.keys(meta).forEach((key) => {
                if (!/research|async|task|agent|tether|browse|caterpillar|quote|cite|citation|reference|result_group|sources/i.test(key)) return;
                const fieldValue = meta[key];
                const isEmpty = (Array.isArray(fieldValue) && !fieldValue.length)
                    || (fieldValue && typeof fieldValue === 'object' && !Array.isArray(fieldValue) && !Object.keys(fieldValue).length);
                bump(census.hintKeys, isEmpty ? `${key}:empty` : key);
            });
            // retrieval experiments: the telemetry research observed A/B experiment names in the wild
            Object.keys(meta).forEach((key) => {
                if (!/experiment|ab_?test|statsig|feature_flag|feed_serving/i.test(key)) return;
                bump(census.hintKeys, key);
                if (!census.samples) census.samples = {};
                if (!census.samples[key]) { try { census.samples[key] = JSON.stringify(meta[key]).slice(0, 300); } catch (_) { /* ignore */ } }
            });
            // sample the first NON-EMPTY value of every citation-bearing field so shapes are visible
            census.samples = census.samples || {};
            ['citations', 'content_references', 'search_result_groups', 'selected_sources', 'selected_mcp_sources', '_cite_metadata', 'caterpillar_selected_sources'].forEach((key) => {
                if (census.samples[key]) return;
                const fieldValue = meta[key];
                if (fieldValue == null) return;
                if (Array.isArray(fieldValue) && !fieldValue.length) return;
                if (typeof fieldValue === 'object' && !Array.isArray(fieldValue) && !Object.keys(fieldValue).length) return;
                try { census.samples[key] = JSON.stringify(fieldValue).slice(0, 500); } catch (_) { /* ignore */ }
            });
            // one-time raw-shape samples so unknown field structures are visible in the diagnostic
            if (!census.sampleCaterpillar && (meta.caterpillar_selected_sources || content.caterpillar_selected_sources)) {
                try { census.sampleCaterpillar = JSON.stringify(meta.caterpillar_selected_sources || content.caterpillar_selected_sources).slice(0, 400); } catch (_) { /* ignore */ }
            }
            if (!census.sampleWebRun && /^web\.run$|^web$/.test(authorName)) {
                try { census.sampleWebRun = JSON.stringify({ contentType: content.content_type, metaKeys: Object.keys(meta), contentKeys: Object.keys(content) }).slice(0, 400); } catch (_) { /* ignore */ }
            }

            // Persisted Deep Research artifacts (the live step trail is not saved; these are).
            if (meta.deep_research_version) deepResearchVersion = String(meta.deep_research_version);
            // async_source values are server/turn IDs like "saserver-centralus-prod...:conversation-turn-<id>:US"
            // — aggregate by region so the chips are meaningful instead of a wall of raw IDs.
            const asyncVal = typeof meta.async_source === 'string' ? meta.async_source
                : (meta.async_source && typeof meta.async_source === 'object' ? (meta.async_source.source || meta.async_source.type || '') : '');
            if (asyncVal) {
                const regionMatch = asyncVal.match(/saserver-([a-z0-9]+)-/i);
                bump(asyncSources, regionMatch ? regionMatch[1] : (asyncVal.length > 40 ? 'async turn' : asyncVal));
            }

            // caterpillar_selected_sources appears in several shapes across DR versions:
            // bare string URLs, {url,title}, {source:{url}}, {ref_id,url}, or a wrapper {sources:[...]}.
            const pullUrl = (item) => {
                if (!item) return '';
                if (typeof item === 'string') return /^https?:\/\//.test(item) ? item : '';
                return item.url || item.link || item.ref_url || item.href
                    || (item.source && (item.source.url || item.source.link))
                    || (item.metadata && item.metadata.url) || '';
            };
            const collectSelected = (bucket) => {
                if (!bucket) return;
                const arr = Array.isArray(bucket) ? bucket : (Array.isArray(bucket.sources) ? bucket.sources : (Array.isArray(bucket.selected) ? bucket.selected : []));
                arr.forEach((item) => {
                    const url = pullUrl(item);
                    if (!url) return;
                    const obj = (item && typeof item === 'object') ? item : {};
                    const src = obj.source || {};
                    selectedSources.push({ url, domain: cleanDomain(url), title: obj.title || src.title || obj.snippet || '', attribution: obj.attribution || src.attribution || '' });
                    addSource(sources, { url, attribution: obj.attribution || url, result_source: 'caterpillar', title: obj.title || src.title || '', snippet: obj.snippet || '' });
                });
            };
            [meta.caterpillar_selected_sources, content.caterpillar_selected_sources, meta.selected_sources, meta.selected_mcp_sources, meta.sources].forEach(collectSelected);

            if (meta.turn_use_case) useCases.push({ useCase: meta.turn_use_case, role });
            (meta.search_result_groups || []).forEach((group) => (group.entries || []).forEach((entry) => addSource(sources, entry)));
            if (meta.search_queries) [].concat(meta.search_queries).forEach((query) => pushQuery(queries, query, 'metadata.search_queries'));
            if (meta.search_model_queries && meta.search_model_queries.queries) {
                [].concat(meta.search_model_queries.queries).forEach((query) => pushQuery(queries, query, 'search_model_queries'));
            }
            if (typeof meta.command === 'string') parseWebCommand(meta.command, queries, browseActions);

            (meta.citations || []).forEach((citation) => {
                const citationMeta = citation.metadata || citation.citation || citation || {};
                const citeUrl = citationMeta.url || (citationMeta.metadata && citationMeta.metadata.url) || '';
                if (citeUrl) {
                    citations.push({ domain: cleanDomain(citeUrl), title: citationMeta.title || '', url: citeUrl, refType: citationMeta.type || citation.citation_format_type || '' });
                }
            });

            // Deep Research reports cite via inline citeturnXviewY markers resolved against
            // _cite_metadata.metadata_list — this is where DR's "N citations" actually live.
            const citeMeta = meta._cite_metadata || content._cite_metadata || null;
            if (citeMeta) {
                const metadataList = [].concat(citeMeta.metadata_list || citeMeta.metadataList || citeMeta.list || []);
                metadataList.forEach((item) => {
                    if (!item) return;
                    const url = item.url || (item.metadata && item.metadata.url) || '';
                    const title = item.title || (item.metadata && item.metadata.title) || '';
                    if (!url) return;
                    citations.push({ domain: cleanDomain(url), title, url, refType: item.type || 'deep_research' });
                    addSource(sources, { url, attribution: url, result_source: 'caterpillar', title, snippet: item.snippet || '', pub_date: item.pub_date || '' });
                });
            }

            (meta.content_references || []).forEach((reference) => {
                if (reference.url) {
                    citations.push({ domain: cleanDomain(reference.url), title: reference.title || reference.alt || '', url: reference.url, refType: reference.type || '' });
                }
                const collectRefItems = (items, refType) => (items || []).forEach((item) => {
                    if (!item) return;
                    if (item.url) citations.push({ domain: cleanDomain(item.url), title: item.title || '', url: item.url, refType: refType || item.type || '' });
                    // grouped_webpages nests further lists (sources/items/refs/fallback_items)
                    [item.items, item.refs, item.sources, item.fallback_items].forEach((nested) => collectRefItems(nested, refType || item.type));
                });
                [reference.items, reference.refs, reference.sources, reference.fallback_items].forEach((bucket) => collectRefItems(bucket, reference.type));
                if (reference.type === 'products' && Array.isArray(reference.products)) {
                    reference.products.forEach((product, index) => addProduct(products, product, index, 'conversation'));
                }
            });

            (meta.conversation_context_citation_metadata || []).forEach((item) => {
                const citation = item.citation || {};
                memory.push({
                    title: citation.title || citation.reason || '',
                    snippet: citation.snippet || '',
                    attribution: citation.attribution || 'Memory',
                });
            });

            if (meta.personal_sources) personalSources.push(...[].concat(meta.personal_sources));
            if (content.personal_sources) personalSources.push(...[].concat(content.personal_sources));
            if (content.content_type === 'thoughts' && Array.isArray(content.thoughts)) {
                content.thoughts.forEach((thought) => reasoning.push({ summary: thought.summary || '', content: thought.content || '' }));
            }
            if (content.content_type === 'reasoning_recap' && content.content) {
                reasoningRecaps.push(String(content.content).trim());
            }
            if (/web/i.test(recipient) || /web/i.test(authorName) || content.content_type === 'code') {
                parseWebCommand(text, queries, browseActions);
            }

            // Deep Research text-browser trail (browser.search / open / find via tether_browsing_display)
            const step = parseResearchStep(message, meta, content);
            if (step) {
                researchSteps.push(step);
                if (step.command === 'search' && step.query) pushQuery(queries, step.query, 'browser.search (bing)');
                step.caterpillarUrls.forEach((candidateUrl) => addSource(sources, { url: candidateUrl, attribution: candidateUrl, result_source: 'bing', title: '', snippet: '' }));
            }
            if (content.content_type === 'tether_quote') {
                researchQuotes.push({
                    url: content.url || '',
                    domain: cleanDomain(content.domain || content.url || ''),
                    title: content.title || '',
                    text: String(content.text || '').slice(0, 600),
                });
            }
        });

        const seenSource = new Set(sources.map((source) => `${source.url}|${source.pipeline}`));
        (function deepScan(value) {
            if (!value || typeof value !== 'object') return;
            if (Array.isArray(value)) {
                value.forEach(deepScan);
                return;
            }
            if (value.result_source && (value.url || value.attribution)) {
                const key = `${value.url || ''}|${value.result_source}`;
                if (!seenSource.has(key)) {
                    seenSource.add(key);
                    addSource(sources, value);
                }
            }
            Object.keys(value).forEach((key) => {
                if (/quer(y|ies)$/i.test(key)) [].concat(value[key]).forEach((query) => pushQuery(queries, query, key));
                if (key === '_cite_metadata' && value[key] && typeof value[key] === 'object') {
                    [].concat(value[key].metadata_list || value[key].metadataList || []).forEach((item) => {
                        const url = item && (item.url || (item.metadata && item.metadata.url)) || '';
                        if (url && !citations.some((existing) => existing.url === url)) {
                            const title = item.title || (item.metadata && item.metadata.title) || '';
                            citations.push({ domain: cleanDomain(url), title, url, refType: item.type || 'deep_research' });
                            addSource(sources, { url, attribution: url, result_source: 'caterpillar', title, snippet: item.snippet || '', pub_date: item.pub_date || '' });
                        }
                    });
                }
                if (/caterpillar_selected_sources|^selected_sources$/i.test(key) && Array.isArray(value[key])) {
                    value[key].forEach((item) => {
                        const url = typeof item === 'string' ? item : (item && (item.url || item.link || item.ref_url) || '');
                        if (url && !selectedSources.some((existing) => existing.url === url)) {
                            selectedSources.push({ url, domain: cleanDomain(url), title: (item && item.title) || '', attribution: (item && item.attribution) || '' });
                            addSource(sources, { url, attribution: (item && item.attribution) || url, result_source: 'caterpillar', title: (item && item.title) || '', snippet: (item && item.snippet) || '' });
                        }
                    });
                }
                deepScan(value[key]);
            });
        })(conversation);

        researchSteps.sort((left, right) => (left.createTime || 0) - (right.createTime || 0));
        const openCounts = {};
        researchSteps.forEach((step) => {
            if (step.command !== 'open' || !step.url) return;
            openCounts[step.url] = (openCounts[step.url] || 0) + 1;
            step.readIndex = openCounts[step.url];
        });
        const hintText = [
            ...Object.keys(census.authors), ...Object.keys(census.contentTypes),
            ...Object.keys(census.commands), ...Object.keys(census.recipients), ...Object.keys(census.hintKeys),
        ].join(' ');
        const looksLikeResearch = researchSteps.length > 0 || /research|tether|caterpillar|browser/i.test(hintText);
        const dedupeSelected = dedupe(selectedSources, (item) => item.url);
        const isDeepResearch = Boolean(deepResearchVersion) || Object.keys(asyncSources).length > 0 || dedupeSelected.length > 0 || researchSteps.length > 0;
        const research = {
            census,
            looksLikeResearch,
            isDeepResearch,
            version: deepResearchVersion,
            asyncSources,
            selectedSources: dedupeSelected,
            liveTrailPersisted: researchSteps.length > 0,
            steps: researchSteps,
            quotes: dedupe(researchQuotes, (quote) => `${quote.url}|${quote.text.slice(0, 80)}`),
            stats: {
                searches: researchSteps.filter((step) => step.command === 'search').length,
                opens: researchSteps.filter((step) => step.command === 'open').length,
                uniquePagesRead: Object.keys(openCounts).length,
                reReads: Object.values(openCounts).filter((count) => count > 1).length,
                finds: researchSteps.filter((step) => step.command === 'find').length,
                other: researchSteps.filter((step) => !['search', 'open', 'find'].includes(step.command)).length,
                findMisses: researchSteps.filter((step) => step.command === 'find' && step.findMiss).length,
                linkFollows: researchSteps.filter((step) => step.fromUrl).length,
                robotsBlocked: researchSteps.filter((step) => step.robotsBlocked).length,
            },
        };

        const normalizedSources = dedupe(sources, (source) => `${source.url || source.domain}|${source.pipeline}`);
        normalizedSources.forEach((source) => { source.category = classifyDomain(source.domain); });
        const normalizedCitations = dedupe(citations, (citation) => citation.url);
        const normalizedProducts = dedupe(products, (product) => `${product.title}|${product.price}|${product.tag}`);
        const normalizedQueries = dedupe(queries, (query) => query.query.toLowerCase());
        normalizedQueries.forEach((query) => { Object.assign(query, classifyQuery(query.query)); });
        const normalizedBrowseActions = dedupe(browseActions, (action) => `${action.action}|${action.arg}`);
        const answerText = assistantTexts.join('\n\n');

        return {
            schemaVersion: 1,
            scannedAt: new Date().toISOString(),
            id: context.id,
            url: context.url,
            title: conversation.title || '(untitled)',
            prompt: userPrompts[0] || '',
            prompts: userPrompts,
            answerText,
            queries: normalizedQueries,
            sources: normalizedSources,
            citations: normalizedCitations,
            useCases,
            browseActions: normalizedBrowseActions,
            personalSources: Array.from(new Set(personalSources)),
            products: normalizedProducts,
            memory,
            reasoning,
            reasoningRecap: Array.from(new Set(reasoningRecaps)).join('  ·  '),
            deepResearch: research,
            stats: {
                queries: normalizedQueries.length,
                sources: normalizedSources.length,
                primaryPipeline: (() => {
                    const counts = pipelineCountsFromSources(normalizedSources);
                    const top = Object.keys(counts).sort((left, right) => counts[right] - counts[left])[0] || '';
                    return top;
                })(),
                primaryPipelineShare: (() => {
                    if (!normalizedSources.length) return 0;
                    const counts = pipelineCountsFromSources(normalizedSources);
                    const top = Object.keys(counts).sort((left, right) => counts[right] - counts[left])[0];
                    return Math.round(counts[top] / normalizedSources.length * 100);
                })(),
                pipelineMix: pipelineCountsFromSources(normalizedSources),
                domains: new Set(normalizedSources.map((source) => source.domain).filter(Boolean)).size,
                citations: normalizedCitations.length,
                citedDomains: new Set(normalizedCitations.map((citation) => citation.domain).filter(Boolean)).size,
                products: normalizedProducts.length,
                browseActions: normalizedBrowseActions.length,
                memoryItems: memory.length,
                researchSteps: researchSteps.length,
                queryStages: (() => { const counts = {}; normalizedQueries.forEach((query) => { counts[query.stage] = (counts[query.stage] || 0) + 1; }); return counts; })(),
                queryTypes: (() => { const counts = {}; normalizedQueries.forEach((query) => { counts[query.qtype] = (counts[query.qtype] || 0) + 1; }); return counts; })(),
                sourceCategories: (() => { const counts = {}; normalizedSources.forEach((source) => { counts[source.category] = (counts[source.category] || 0) + 1; }); return counts; })(),
            },
        };
    }

    // Query-intent + source-type classification, adapted from Taylor Scher's AEO
    // framework (stage x type). Heuristic keyword matching: EN, DE, ES, FR, IT, NL, PT.
    // Queries are diacritic/apostrophe-normalized first (cómo -> como, qu'est -> qu est)
    // so patterns stay ASCII and unaccented user input matches too.
    function classifyQuery(raw) {
        const query = String(raw || '')
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/['\u2019\u02bc\u0060\u00b4]/g, ' ');
        const isHowTo = /\bhow (to|do|does|can)\b|\bguide\b|\btutorials?\b|\btutoriel\b|\bstep[-\s]?by[-\s]?step\b|\bset ?up\b|\banleitung\b|\bwie (kann|macht|funktioniert|geht)\b|\bschritt\b|\bcomo (se |hacer|instalar|configurar|funciona|usar|fazer|criar|crear|montar)\b|\bcomment (faire|installer|configurer|fonctionne|utiliser|marche)\b|\bcome (fare|installare|configurare|funziona|usare|creare)\b|\bhoe (kan|werkt|maak|installeer|stel|gebruik)\b|\bhandleiding\b|\bstap voor stap\b|\bpaso a paso\b|\bpasso (a|dopo) passo\b|\betape par etape\b|\bguia\b/.test(query);
        const isComparison = /\b(vs\.?|versus)\b|\bcompared?\b|\bcomparison\b|\balternatives?\b|\bvergleich\b|\balternativen?\b|\bunterschied\b|\bcomparacion\b|\bcomparativ[ao]s?\b|\balternativas?\b|\bdiferencias?\b|\bcomparatifs?\b|\bcomparaison\b|\bdifference\b|\bconfronto\b|\bcomparazione\b|\bdifferenz[ae]\b|\bvergelijk(ing)?\b|\balternatieven?\b|\bverschil\b|\bcomparacao\b|\bdiferencas?\b/.test(query);
        const isPricing = /\bpricing\b|\bprice[ds]?\b|\bcost(s|ing)?\b|\bhow much\b|\bcheap(est|er)?\b|\bpreis(e|werte?)?\b|\bkosten\b|\bgunstig(e|st)?\b|\bbillig\b|\bangebot(e)?\b|\bkaufen\b|\bwhere to buy\b|\bbuy\b|\bdeal(s)?\b|\bprecios?\b|\bcost[eo]s?\b|\bcuanto cuesta\b|\bbarat[ao]s?\b|\b(donde|onde) comprar\b|\bcomprare?\b|\bofertas?\b|\bprix\b|\bcouts?\b|\bcombien coute\b|\bpas cher\b|\bacheter\b|\bpromo(tion)?\b|\bprezz[oi]\b|\bquanto (costa|custa)\b|\beconomic[oa]\b|\bdove comprare\b|\bprij(s|zen)\b|\bhoeveel kost\b|\bgoedkoop\b|\bkopen\b|\bwaar (te )?kopen\b|\baanbieding(en)?\b|\bprecos?\b|\bcustos?\b|\bpromocao\b/.test(query);
        const isReviews = /\breviews?\b|\bratings?\b|\btestimonials?\b|\bworth it\b|\bpros and cons\b|\berfahrung(en)?\b|\btest(bericht|sieger)?\b|\bbewertung(en)?\b|\bstiftung warentest\b|\bopinion(es)?\b|\bresenas?\b|\bvaloraciones\b|\bvale la pena\b|\bavis\b|\bvaut (le coup|la peine)\b|\brecensioni?\b|\bopinioni\b|\bvale la pena\b|\bervaringen\b|\bbeoordelingen\b|\bde moeite waard\b|\bavaliacoes\b|\bopinioes\b|\bresenhas?\b|\bvale a pena\b/.test(query);
        const isBestTop = /\bbest(e[rsn]?|es)?\b|\btop ?\d*\b|\bleading\b|\bmost popular\b|\brecommended\b|\bempfehlung(en)?\b|\bmejor(es)?\b|\brecomendad[oa]s?\b|\bmeilleurs?e?s?\b|\brecommandes?\b|\bmiglior[ei]?\b|\bconsigliat[oi]\b|\baanbevolen\b|\bmelhor(es)?\b/.test(query);
        const isWhatWhy = /\bwhat (is|are)\b|\bwhy\b|\bdefinitions?\b|\bwas (ist|sind)\b|\bwarum\b|\bbedeutung\b|\bque (es|son)\b|\bpor ?que\b|\bsignificado\b|\bqu ?est[- ]ce\b|\bpourquoi\b|\bsignification\b|\b(che )?cos ?a? e\b|\bperche\b|\bsignificato\b|\bwat (is|zijn)\b|\bwaarom\b|\bbetekenis\b|\bo que (e|sao)\b/.test(query);
        const isTroubleshoot = /\b(fix|error|not working|troubleshoot|broken)\b|\b(problem|fehler|kaputt|funktioniert nicht)\b|\bno funciona\b|\barreglar\b|\bsolucionar\b|\bne (fonctionne|marche) pas\b|\berreur\b|\breparer\b|\bnon funziona\b|\berrore\b|\briparare\b|\bwerkt niet\b|\bfout\b|\brepareren\b|\bnao funciona\b|\berro\b|\bconsertar\b/.test(query);
        const isBoFu = isPricing || isReviews || isBestTop || isComparison;

        let type = 'other';
        if (isComparison) type = 'comparison';
        else if (isHowTo && !isTroubleshoot) type = 'how-to';
        else if (isBoFu) type = 'bofu';

        let stage;
        if (isPricing || isReviews) stage = 'decision';
        else if (isComparison) stage = 'solution';
        else if (isBestTop || isWhatWhy || isHowTo || isTroubleshoot) stage = 'problem';
        else stage = 'solution';
        return { stage, qtype: type };
    }

    const GOV_EDU_SUFFIXES = [
        '.gov', '.edu', '.mil',
        'gov.uk', 'ac.uk', 'gov.ie', 'gov.pl', 'gov.pt', 'gov.it', 'gob.es', 'gv.at',
    ];
    const GOV_EDU_DOMAINS = [
        'europa.eu', 'ec.europa.eu', 'data.europa.eu', 'eur-lex.europa.eu',
        'gouv.fr', 'service-public.fr', 'bund.de', 'bundestag.de', 'rijksoverheid.nl', 'overheid.nl',
        'nih.gov', 'who.int', 'oecd.org', 'arbeiterkammer.at',
    ];
    const DOMAIN_CATEGORY_SETS = {
        docs: [
            'github.com', 'gitlab.com', 'bitbucket.org', 'npmjs.com', 'pypi.org', 'developer.mozilla.org',
        ],
        social: [
            'youtube.com', 'youtu.be', 'x.com', 'twitter.com', 'linkedin.com', 'facebook.com', 'instagram.com',
            'tiktok.com', 'pinterest.com', 'threads.net', 'vimeo.com',
        ],
        forum: [
            'stackoverflow.com', 'stackexchange.com', 'superuser.com', 'serverfault.com', 'askubuntu.com',
            'quora.com', 'gutefrage.net', 'gutefrage.de', 'news.ycombinator.com',
        ],
        wiki: [
            'wikipedia.org', 'fandom.com', 'wiktionary.org',
        ],
        blog: [
            'medium.com', 'substack.com', 'blogspot.com', 'wordpress.com', 'beehiiv.com', 'ghost.org',
        ],
        review: [
            'g2.com', 'capterra.com', 'trustpilot.com', 'trustradius.com', 'getapp.com', 'softwareadvice.com',
            'gartner.com', 'producthunt.com', 'wirecutter.com', 'consumerreports.org', 'pcmag.com',
            'testberichte.de', 'vergleich.org', 'chip.de', 'computerbild.de',
        ],
        price: [
            'idealo.de', 'idealo.co.uk', 'idealo.fr', 'idealo.it', 'idealo.es',
            'pricerunner.com', 'pricerunner.co.uk', 'kelkoo.com', 'kelkoo.co.uk', 'kelkoo.fr',
            'geizhals.de', 'geizhals.at', 'billiger.de', 'pricespy.co.uk',
        ],
        retailer: [
            'amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.fr', 'amazon.it', 'amazon.es', 'amazon.nl',
            'amazon.se', 'amazon.pl', 'walmart.com', 'target.com', 'bestbuy.com', 'costco.com',
            'ebay.com', 'ebay.co.uk', 'ebay.de', 'ebay.fr', 'etsy.com', 'zalando.com', 'zalando.de',
            'otto.de', 'mediamarkt.de', 'mediamarkt.es', 'mediamarkt.nl', 'saturn.de', 'fnac.com',
            'darty.com', 'bol.com', 'coolblue.nl', 'coolblue.be', 'currys.co.uk', 'argos.co.uk',
            'tesco.com', 'carrefour.fr', 'carrefour.es', 'elcorteingles.es', 'allegro.pl',
        ],
        brand: [
            'apple.com', 'microsoft.com', 'google.com', 'google.de', 'google.fr', 'google.co.uk',
            'adobe.com', 'samsung.com', 'samsung.de', 'sony.com', 'sony.co.uk', 'lg.com',
            'lenovo.com', 'hp.com', 'dell.com', 'bosch.com', 'bosch-home.com', 'bosch-home.co.uk',
            'siemens.com', 'philips.com', 'miele.com', 'miele.de', 'dyson.com', 'dyson.co.uk',
            'nike.com', 'adidas.com',
        ],
        news: [
            'theverge.com', 'techcrunch.com', 'wired.com', 'zdnet.com', 'cnbc.com', 'forbes.com',
            'businessinsider.com', 'reuters.com', 'bloomberg.com', 'nytimes.com', 'washingtonpost.com',
            'wsj.com', 'cnn.com', 'bbc.com', 'bbc.co.uk', 'theguardian.com', 'guardian.co.uk',
            'techradar.com', 'tomsguide.com', 't3.com', 'heise.de', 'golem.de', 'spiegel.de',
            'faz.net', 'sueddeutsche.de', 'zeit.de', 'welt.de', 't-online.de', 'bild.de',
        ],
    };
    const DOMAIN_CATEGORY_RULES = [
        ['reddit', /(^|\.)reddit\.com$/i],
        ['review', /stiftung/i],
        ['docs', /^docs\.|^developer\.|^developers\.|^learn\.|^support\./i],
    ];
    function normalizeHostname(value) {
        return String(value || '')
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .split('/')[0]
            .split('?')[0]
            .split('#')[0]
            .replace(/:\d+$/, '');
    }
    function matchesExactOrSubdomain(domain, root) {
        return domain === root || domain.endsWith(`.${root}`);
    }
    function matchesKnownSuffix(domain, suffix) {
        return suffix.charAt(0) === '.'
            ? domain.endsWith(suffix)
            : matchesExactOrSubdomain(domain, suffix);
    }
    function matchesAnyDomain(domain, domains) {
        return domains.some((root) => matchesExactOrSubdomain(domain, root));
    }
    function classifyDomain(domain) {
        const value = normalizeHostname(domain);
        if (!value) return 'other';
        if (GOV_EDU_SUFFIXES.some((suffix) => matchesKnownSuffix(value, suffix)) || matchesAnyDomain(value, GOV_EDU_DOMAINS)) return 'gov-edu';
        const orderedSets = ['docs', 'social', 'forum', 'wiki', 'blog', 'review', 'price', 'retailer', 'brand', 'news'];
        for (const category of orderedSets) {
            if (matchesAnyDomain(value, DOMAIN_CATEGORY_SETS[category] || [])) return category;
        }
        for (const [category, pattern] of DOMAIN_CATEGORY_RULES) {
            if (pattern.test(value)) return category;
        }
        return 'commercial';
    }

    function toCsv(rows) {
        if (!rows || !rows.length) return '';
        const keys = Object.keys(rows[0]);
        const escapeCell = (value) => {
            let text = String(value == null ? '' : value);
            if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`; // guard against spreadsheet formula injection
            return `"${text.replace(/"/g, '""')}"`;
        };
        return [keys.join(','), ...rows.map((row) => keys.map((key) => escapeCell(row[key])).join(','))].join('\n');
    }

    function makeId(prefix) {
        return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    }

    function normalizeSnapshot(snapshot) {
        if (!snapshot || typeof snapshot !== 'object') return null;
        const intel = normalizeIntelPipelines(snapshot.intel || {});
        const stats = normalizeStatsPipelines(snapshot.stats || intel.stats || { sources: 0, citations: 0, products: 0 });
        if (!intel.stats || !Object.keys(intel.stats).length) intel.stats = stats;
        return {
            ...snapshot,
            stats,
            intel,
            projectId: snapshot.projectId || null,
            tags: Array.isArray(snapshot.tags) ? snapshot.tags : [],
            notes: snapshot.notes || '',
            updatedAt: snapshot.updatedAt || snapshot.scannedAt || new Date().toISOString(),
        };
    }

    function normalizeProject(project) {
        if (!project || typeof project !== 'object') return null;
        const now = new Date().toISOString();
        const name = String(project.name || '').trim();
        if (!name) return null;
        return {
            id: project.id || makeId('project'),
            name,
            description: project.description || '',
            createdAt: project.createdAt || now,
            updatedAt: project.updatedAt || project.createdAt || now,
        };
    }

    function normalizeTag(tag) {
        if (!tag || typeof tag !== 'object') return null;
        const now = new Date().toISOString();
        const name = String(tag.name || '').trim();
        if (!name) return null;
        return {
            id: tag.id || makeId('tag'),
            name,
            color: tag.color || '#2563eb',
            createdAt: tag.createdAt || now,
            updatedAt: tag.updatedAt || tag.createdAt || now,
        };
    }

    function storageGet(key, fallback) {
        return new Promise((resolve) => {
            if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
                resolve(fallback);
                return;
            }
            chrome.storage.local.get({ [key]: fallback }, (result) => resolve(result[key]));
        });
    }

    function storageSet(items) {
        return new Promise((resolve, reject) => {
            if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
                resolve();
                return;
            }
            chrome.storage.local.set(items, () => {
                const err = chrome.runtime && chrome.runtime.lastError;
                if (err) reject(new Error(err.message));
                else resolve();
            });
        });
    }

    async function loadSnapshots() {
        const snapshots = await storageGet(SNAPSHOT_KEY, []);
        return Array.isArray(snapshots) ? snapshots.map(normalizeSnapshot).filter(Boolean) : [];
    }

    async function saveSnapshot(intel, metadata = {}) {
        const snapshots = await loadSnapshots();
        const previous = snapshots.find((item) => item.conversationId === intel.id || item.id === `${intel.id}:${intel.scannedAt}`);
        const hasMeta = (key) => Object.prototype.hasOwnProperty.call(metadata, key);
        const summary = {
            id: `${intel.id}:${intel.scannedAt}`,
            conversationId: intel.id,
            title: intel.title,
            url: intel.url,
            scannedAt: intel.scannedAt,
            updatedAt: new Date().toISOString(),
            prompt: intel.prompt,
            stats: intel.stats,
            intel,
            projectId: hasMeta('projectId') ? metadata.projectId || null : (previous ? previous.projectId : null),
            tags: hasMeta('tags') && Array.isArray(metadata.tags) ? metadata.tags : (previous ? previous.tags : []),
            notes: hasMeta('notes') ? metadata.notes || '' : (previous ? previous.notes : ''),
        };
        const next = [summary, ...snapshots.filter((item) => item.id !== summary.id)].slice(0, 50);
        await storageSet({ [SNAPSHOT_KEY]: next });
        return summary;
    }

    async function updateSnapshot(snapshotId, updates) {
        const snapshots = await loadSnapshots();
        const next = snapshots.map((snapshot) => {
            if (snapshot.id !== snapshotId) return snapshot;
            return normalizeSnapshot({
                ...snapshot,
                ...updates,
                tags: Array.isArray(updates.tags) ? updates.tags : snapshot.tags,
                projectId: Object.prototype.hasOwnProperty.call(updates, 'projectId') ? updates.projectId || null : snapshot.projectId,
                updatedAt: new Date().toISOString(),
            });
        });
        await storageSet({ [SNAPSHOT_KEY]: next });
        return next.find((snapshot) => snapshot.id === snapshotId) || null;
    }

    async function deleteSnapshot(snapshotId) {
        const snapshots = await loadSnapshots();
        await storageSet({ [SNAPSHOT_KEY]: snapshots.filter((item) => item.id !== snapshotId) });
    }

    async function loadProjects() {
        const projects = await storageGet(PROJECTS_KEY, []);
        return Array.isArray(projects) ? projects.map(normalizeProject).filter(Boolean) : [];
    }

    async function saveProjects(projects) {
        const normalized = (projects || []).map(normalizeProject).filter(Boolean);
        await storageSet({ [PROJECTS_KEY]: normalized });
        return normalized;
    }

    async function createProject(name, description) {
        const projects = await loadProjects();
        const normalizedName = String(name || '').trim();
        if (!normalizedName) throw new Error('Project name is required.');
        if (projects.some((project) => project.name.toLowerCase() === normalizedName.toLowerCase())) {
            throw new Error('A project with this name already exists.');
        }
        const project = normalizeProject({ name: normalizedName, description: description || '' });
        await saveProjects([...projects, project]);
        return project;
    }

    async function updateProject(projectId, updates = {}) {
        const projects = await loadProjects();
        const current = projects.find((project) => project.id === projectId);
        if (!current) throw new Error('Project not found.');
        const nextName = Object.prototype.hasOwnProperty.call(updates, 'name') ? String(updates.name || '').trim() : current.name;
        if (!nextName) throw new Error('Project name is required.');
        if (projects.some((project) => project.id !== projectId && project.name.toLowerCase() === nextName.toLowerCase())) {
            throw new Error('A project with this name already exists.');
        }
        const next = projects.map((project) => project.id === projectId ? normalizeProject({
            ...project,
            ...updates,
            name: nextName,
            updatedAt: new Date().toISOString(),
        }) : project);
        await saveProjects(next);
        return next.find((project) => project.id === projectId);
    }

    async function deleteProject(projectId) {
        const projects = await loadProjects();
        await saveProjects(projects.filter((project) => project.id !== projectId));
        const snapshots = await loadSnapshots();
        await storageSet({ [SNAPSHOT_KEY]: snapshots.map((snapshot) => snapshot.projectId === projectId ? { ...snapshot, projectId: null, updatedAt: new Date().toISOString() } : snapshot) });
    }

    async function loadTags() {
        const tags = await storageGet(TAGS_KEY, []);
        return Array.isArray(tags) ? tags.map(normalizeTag).filter(Boolean) : [];
    }

    async function saveTags(tags) {
        const normalized = (tags || []).map(normalizeTag).filter(Boolean);
        await storageSet({ [TAGS_KEY]: normalized });
        return normalized;
    }

    async function createTag(name, color) {
        const tags = await loadTags();
        const normalizedName = String(name || '').trim();
        if (!normalizedName) throw new Error('Tag name is required.');
        if (tags.some((tag) => tag.name.toLowerCase() === normalizedName.toLowerCase())) {
            throw new Error('A tag with this name already exists.');
        }
        const tag = normalizeTag({ name: normalizedName, color: color || '#2563eb' });
        await saveTags([...tags, tag]);
        return tag;
    }

    async function updateTag(tagId, updates = {}) {
        const tags = await loadTags();
        const current = tags.find((tag) => tag.id === tagId);
        if (!current) throw new Error('Tag not found.');
        const nextName = Object.prototype.hasOwnProperty.call(updates, 'name') ? String(updates.name || '').trim() : current.name;
        if (!nextName) throw new Error('Tag name is required.');
        if (tags.some((tag) => tag.id !== tagId && tag.name.toLowerCase() === nextName.toLowerCase())) {
            throw new Error('A tag with this name already exists.');
        }
        const next = tags.map((tag) => tag.id === tagId ? normalizeTag({
            ...tag,
            ...updates,
            name: nextName,
            color: updates.color || tag.color,
            updatedAt: new Date().toISOString(),
        }) : tag);
        await saveTags(next);
        return next.find((tag) => tag.id === tagId);
    }

    async function deleteTag(tagId) {
        const tags = await loadTags();
        await saveTags(tags.filter((tag) => tag.id !== tagId));
        const snapshots = await loadSnapshots();
        await storageSet({ [SNAPSHOT_KEY]: snapshots.map((snapshot) => snapshot.tags.includes(tagId) ? { ...snapshot, tags: snapshot.tags.filter((id) => id !== tagId), updatedAt: new Date().toISOString() } : snapshot) });
    }

    async function loadLibrary() {
        const [snapshots, projects, tags] = await Promise.all([loadSnapshots(), loadProjects(), loadTags()]);
        return { snapshots, projects, tags };
    }

    async function importLibrary(payload) {
        if (!payload || typeof payload !== 'object') throw new Error('Invalid import file.');
        const data = payload.data && typeof payload.data === 'object' ? payload.data : payload;
        const snapshots = (data.snapshots || data.history || []).map((item) => normalizeSnapshot(item.intel ? item : {
            id: item.id || makeId('snapshot'),
            conversationId: item.conversationId || item.id || '',
            title: item.title || item.query || '(imported)',
            url: item.url || '',
            scannedAt: item.scannedAt || item.timestamp || item.date || new Date().toISOString(),
            prompt: item.prompt || item.query || '',
            stats: item.stats || { sources: 0, citations: 0, products: 0 },
            intel: item.intel || item.results || item.data || {},
            projectId: item.projectId || null,
            tags: item.tags || [],
            notes: item.notes || '',
        })).filter(Boolean);
        const projects = (data.projects || []).map(normalizeProject).filter(Boolean);
        const tags = (data.tags || []).map(normalizeTag).filter(Boolean);
        if (!snapshots.length && !projects.length && !tags.length) throw new Error('No saved scans, projects, or tags found in import file.');

        const current = await loadLibrary();
        const mergedProjects = [...current.projects];
        projects.forEach((project) => {
            if (!mergedProjects.some((item) => item.id === project.id)) mergedProjects.push(project);
        });
        const mergedTags = [...current.tags];
        tags.forEach((tag) => {
            if (!mergedTags.some((item) => item.id === tag.id)) mergedTags.push(tag);
        });
        const mergedSnapshots = [...snapshots, ...current.snapshots.filter((snapshot) => !snapshots.some((item) => item.id === snapshot.id))].slice(0, 50);
        await storageSet({ [SNAPSHOT_KEY]: mergedSnapshots, [PROJECTS_KEY]: mergedProjects, [TAGS_KEY]: mergedTags });
        return { snapshots: mergedSnapshots, projects: mergedProjects, tags: mergedTags };
    }

    function generateDeviceId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
            const rand = Math.random() * 16 | 0;
            return (char === 'x' ? rand : (rand & 0x3 | 0x8)).toString(16);
        });
    }

    function parseProductUpdate(text) {
        let product = null;
        text.split('\n').forEach((line) => {
            if (!line.startsWith('data:')) return;
            let data;
            try {
                data = JSON.parse(line.slice(line.indexOf(':') + 1).trim());
            } catch (_) {
                return;
            }
            if (data && data.type === 'product_entity' && data.product) product = data.product;
            else if (data && data.product && data.product.offers) product = data.product;
        });
        if (!product) return null;
        const mapped = [];
        addProduct(mapped, product, 0, 'live');
        return mapped[0] || null;
    }

    async function loadProductOffers(product, token) {
        if (!product || !product.lookupKey) {
            throw new Error('This product has no lookup key for live offers.');
        }
        const authToken = token || await getSessionToken();
        const doFetch = (bearer) => fetch('/backend-api/search/product_update', {
            method: 'POST',
            credentials: 'include',
            headers: {
                accept: 'text/event-stream',
                authorization: `Bearer ${bearer}`,
                'content-type': 'application/json',
                'oai-language': 'en-US',
                'oai-device-id': generateDeviceId(),
                'x-openai-target-path': '/backend-api/search/product_update',
                'x-openai-target-route': '/search/product_update',
            },
            body: JSON.stringify({ product_query: product.query || product.title, product_lookup_key: product.lookupKey }),
        });
        let response = await doFetch(authToken);
        if ((response.status === 401 || response.status === 403) && token) {
            // cached token likely expired mid-session — retry once with a fresh one
            response = await doFetch(await getSessionToken());
        }
        if (!response.ok) {
            throw new Error(`Offer API returned HTTP ${response.status}`);
        }
        return parseProductUpdate(await response.text());
    }

    window.CgptGeoResearchCore = {
        getConversationId,
        getPageStatus,
        getSessionToken,
        fetchConversation,
        scanCurrentConversation,
        scanConversationById,
        classifyQuery,
        classifyDomain,
        extractConversationIntel,
        loadSnapshots,
        saveSnapshot,
        updateSnapshot,
        deleteSnapshot,
        loadProjects,
        createProject,
        updateProject,
        deleteProject,
        loadTags,
        createTag,
        updateTag,
        deleteTag,
        loadLibrary,
        importLibrary,
        loadProductOffers,
        toCsv,
        cleanDomain,
    };
})();

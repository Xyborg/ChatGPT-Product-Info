// ChatGPT GEO/AEO Research - core extraction and storage helpers.
(function () {
    'use strict';

    const SNAPSHOT_KEY = 'cgptGeoResearchSnapshots';
    const PROJECTS_KEY = 'cgptGeoResearchProjects';
    const TAGS_KEY = 'cgptGeoResearchTags';
    const QUERY_JUNK = new Set(['deprecated', 'none', 'null', 'n/a', 'undefined']);

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

    async function scanCurrentConversation() {
        const status = getPageStatus();
        if (!status.ready) {
            throw new Error(status.message);
        }
        const token = await getSessionToken();
        const raw = await fetchConversation(status.conversationId, token);
        const intel = extractConversationIntel(raw, {
            id: status.conversationId,
            url: window.location.href,
        });
        return { intel, raw, token };
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
            pipeline: entry.result_source || '?',
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
        try {
            const lookupData = JSON.parse((product.product_lookup_key && product.product_lookup_key.data) || '{}');
            providerUrl = lookupData.provider_url || '';
            generatedQuery = lookupData.generated_product_query || lookupData.request_query || '';
        } catch (_) {
            providerUrl = '';
            generatedQuery = '';
        }

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
            shoppingUrl: googleShoppingUrl([product.title, generatedQuery, product.merchants]),
            query: generatedQuery,
            showcased: Boolean(showcase),
            position: index || 0,
            offers: mapOffers(product.offers),
            lookupKey: product.product_lookup_key || null,
            origin: origin || 'conversation',
        });
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

            if (meta.turn_use_case) useCases.push({ useCase: meta.turn_use_case, role });
            (meta.search_result_groups || []).forEach((group) => (group.entries || []).forEach((entry) => addSource(sources, entry)));
            if (meta.search_queries) [].concat(meta.search_queries).forEach((query) => pushQuery(queries, query, 'metadata.search_queries'));
            if (meta.search_model_queries && meta.search_model_queries.queries) {
                [].concat(meta.search_model_queries.queries).forEach((query) => pushQuery(queries, query, 'search_model_queries'));
            }
            if (typeof meta.command === 'string') parseWebCommand(meta.command, queries, browseActions);

            (meta.citations || []).forEach((citation) => {
                const citationMeta = citation.metadata || {};
                if (citationMeta.url) {
                    citations.push({ domain: cleanDomain(citationMeta.url), title: citationMeta.title || '', url: citationMeta.url, refType: citationMeta.type || '' });
                }
            });

            (meta.content_references || []).forEach((reference) => {
                if (reference.url) {
                    citations.push({ domain: cleanDomain(reference.url), title: reference.title || reference.alt || '', url: reference.url, refType: reference.type || '' });
                }
                (reference.items || reference.refs || reference.sources || []).forEach((item) => {
                    if (item && item.url) citations.push({ domain: cleanDomain(item.url), title: item.title || '', url: item.url, refType: reference.type || '' });
                });
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
                deepScan(value[key]);
            });
        })(conversation);

        const normalizedSources = dedupe(sources, (source) => `${source.url || source.domain}|${source.pipeline}`);
        const normalizedCitations = dedupe(citations, (citation) => citation.url);
        const normalizedProducts = dedupe(products, (product) => `${product.title}|${product.price}|${product.tag}`);
        const normalizedQueries = dedupe(queries, (query) => query.query.toLowerCase());
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
            stats: {
                queries: normalizedQueries.length,
                sources: normalizedSources.length,
                domains: new Set(normalizedSources.map((source) => source.domain).filter(Boolean)).size,
                citations: normalizedCitations.length,
                citedDomains: new Set(normalizedCitations.map((citation) => citation.domain).filter(Boolean)).size,
                products: normalizedProducts.length,
                browseActions: normalizedBrowseActions.length,
                memoryItems: memory.length,
            },
        };
    }

    function toCsv(rows) {
        if (!rows || !rows.length) return '';
        const keys = Object.keys(rows[0]);
        const escapeCell = (value) => `"${String(value == null ? '' : value).replace(/"/g, '""')}"`;
        return [keys.join(','), ...rows.map((row) => keys.map((key) => escapeCell(row[key])).join(','))].join('\n');
    }

    function makeId(prefix) {
        return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    }

    function normalizeSnapshot(snapshot) {
        if (!snapshot || typeof snapshot !== 'object') return null;
        return {
            ...snapshot,
            stats: snapshot.stats || { sources: 0, citations: 0, products: 0 },
            intel: snapshot.intel || {},
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
        const response = await fetch('/backend-api/search/product_update', {
            method: 'POST',
            credentials: 'include',
            headers: {
                accept: 'text/event-stream',
                authorization: `Bearer ${authToken}`,
                'content-type': 'application/json',
                'oai-language': 'en-US',
                'oai-device-id': generateDeviceId(),
                'x-openai-target-path': '/backend-api/search/product_update',
                'x-openai-target-route': '/search/product_update',
            },
            body: JSON.stringify({ product_query: product.query || product.title, product_lookup_key: product.lookupKey }),
        });
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

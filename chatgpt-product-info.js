// ChatGPT Product Info Search
// Paste this entire script into ChatGPT's browser console and it will open a modal

(function() {
    // Remove existing modal if present
    const existingModal = document.getElementById('chatgpt-product-search-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal HTML
    const modalHTML = `
        <div id="chatgpt-product-search-modal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
            <div style="
                background: white;
                width: 90%;
                height:85%;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            ">
                <div style="
                    background: #f8f9fa;
                    padding: 12px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #e9ecef;
                ">
                    <h1 style="
                        font-size: 18px;
                        font-weight: 600;
                        margin: 0;
                        color: #495057;
                    ">🔍 ChatGPT Product Info Search</h1>
                    <button id="close-modal-btn" style="
                        background: none;
                        border: none;
                        color: #6c757d;
                        font-size: 20px;
                        width: 30px;
                        height: 30px;
                        border-radius: 4px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">&times;</button>
                </div>
                
                <div style="
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                ">
                    <div style="
                        padding: 16px 20px;
                        border-bottom: 1px solid #e9ecef;
                        background: white;
                    ">
                        <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                            <input type="text" id="search-query" placeholder="Search query (e.g., iPhone 15, Nike shoes)" style="
                                flex: 1;
                                padding: 8px 12px;
                                border: 1px solid #dee2e6;
                                border-radius: 4px;
                                font-size: 14px;
                                box-sizing: border-box;
                            " />
                            <button id="search-btn" style="
                                background: #007bff;
                                color: white;
                                border: none;
                                padding: 8px 16px;
                                border-radius: 4px;
                                font-size: 14px;
                                font-weight: 500;
                                cursor: pointer;
                                white-space: nowrap;
                            ">Search</button>
                        </div>
                        
                        <!-- Hidden token field for status display -->
                        <input type="password" id="auth-token" placeholder="Token will be fetched automatically" readonly style="
                            display: none;
                            padding: 8px 12px;
                            border: 1px solid #dee2e6;
                            border-radius: 4px;
                            font-size: 14px;
                            box-sizing: border-box;
                            background-color: #f9f9f9;
                            cursor: not-allowed;
                        " />
                    </div>
                    
                    <div id="results-container" style="
                        flex: 1;
                        overflow-y: auto;
                        padding: 20px;
                    ">
                        <div id="welcome-state" style="
                            text-align: center; 
                            padding: 60px 40px; 
                            color: #6c757d;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            height: 100%;
                            min-height: 300px;
                        ">
                            <div style="
                                font-size: 48px;
                                margin-bottom: 20px;
                                opacity: 0.7;
                            ">🔍</div>
                            <h3 style="
                                margin: 0 0 12px 0;
                                font-size: 20px;
                                font-weight: 600;
                                color: #495057;
                            ">Product Search</h3>
                            <p style="
                                margin: 0 0 24px 0;
                                font-size: 16px;
                                line-height: 1.5;
                                max-width: 400px;
                            ">Search for product reviews, comparisons, and detailed information from across the web</p>
                            <div style="
                                padding: 16px 20px;
                                border-left: 4px solid #007bff;
                                max-width: 500px;
                                text-align: left;
                            ">
                                <div style="font-weight: 600; margin-bottom: 8px; color: #495057;">Try searching for:</div>
                                <div style="color: #6c757d; font-size: 14px; line-height: 1.4;">
                                    • "iPhone 17 Pro camera quality"<br>
                                    • "Nike Air Max running shoes"<br>
                                    • "MacBook Air M3 performance"<br>
                                    • "Tesla Model 3 reviews"
                                </div>
                            </div>
                            <div id="auth-status" style="
                                margin-top: 20px;
                                padding: 8px 16px;
                                border-radius: 20px;
                                font-size: 13px;
                                font-weight: 500;
                                background: #e3f2fd;
                                color: #1565c0;
                                border: 1px solid #bbdefb;
                            ">🔐 Checking authentication...</div>
                        </div>
                    </div>
                </div>
                
                <!-- Fixed Footer -->
                <div style="
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: #f8f9fa;
                    border-top: 1px solid #e9ecef;
                    padding: 8px 0;
                    text-align: center;
                    font-size: 14px;
                    z-index: 10001;
                ">
                    Created by <a href="https://www.martinaberastegue.com/" target="_blank" rel="noopener noreferrer">Martin Aberastegue (@Xyborg)</a> | Do you want to improve your AI Visibility? <strong><a href="https://www.finseo.ai/?ref=gptproductsearch" target="_blank" rel="noopener noreferrer">Try Finseo!</a></strong>
                </div>
            </div>
        </div>
    `;

    // Inject modal into page
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Get modal elements
    const modal = document.getElementById('chatgpt-product-search-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const searchBtn = document.getElementById('search-btn');
    const searchQuery = document.getElementById('search-query');
    const authToken = document.getElementById('auth-token');
    const resultsContainer = document.getElementById('results-container');

    // Close modal functionality
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal.remove();
        }
    });

    // Search functionality
    searchBtn.addEventListener('click', performSearch);

    // Enter key support
    searchQuery.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    async function performSearch() {
        const query = searchQuery.value.trim();
        
        if (!query) {
            alert('Please enter a search query');
            return;
        }
        
        // Get token automatically
        let token;
        try {
            token = await getAutomaticToken();
        } catch (error) {
            alert('Failed to get authentication token. Please make sure you\'re logged in to ChatGPT.');
            return;
        }
        
        // Show loading state
        searchBtn.disabled = true;
        searchBtn.textContent = 'Searching...';
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <div style="
                    display: inline-block;
                    width: 32px;
                    height: 32px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 10px;
                "></div>
                <p>Searching for "${query}"...</p>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        try {
            const result = await searchProduct(query, token);
            displayResults(result, query);
        } catch (error) {
            displayError(error.message);
        } finally {
            searchBtn.disabled = false;
            searchBtn.textContent = 'Search';
        }
    }

    async function getAutomaticToken() {
        try {
            const response = await fetch("/api/auth/session");
            if (!response.ok) {
                throw new Error(`Session API responded with: ${response.status} ${response.statusText}`);
            }
            const sessionData = await response.json();
            
            if (!sessionData.accessToken) {
                throw new Error("No access token found in session. Please make sure you're logged in to ChatGPT.");
            }
            
            // Update the token input field to show it's been fetched
            const tokenInput = document.getElementById('auth-token');
            if (tokenInput) {
                tokenInput.placeholder = "✅ Token fetched from session";
                tokenInput.style.backgroundColor = "#f0f8ff";
                tokenInput.style.borderColor = "#007bff";
            }
            
            return sessionData.accessToken;
        } catch (error) {
            // Update the token input field to show error
            const tokenInput = document.getElementById('auth-token');
            if (tokenInput) {
                tokenInput.placeholder = "❌ Failed to fetch token automatically";
                tokenInput.style.backgroundColor = "#fff5f5";
                tokenInput.style.borderColor = "#ef4444";
                tokenInput.readOnly = false;
                tokenInput.style.cursor = "text";
            }
            
            throw error;
        }
    }

    async function searchProduct(query, token) {
        const requestBody = {
            "conversation_id": "",
            "is_client_thread": true,
            "message_id": "",
            "product_query": query,
            "supported_encodings": ["v1"],
            "product_lookup_key": {
                "data": JSON.stringify({
                    "request_query": query,
                    "all_ids": {"p2": [""]},
                    "known_ids": {},
                    "metadata_sources": ["p1", "p3"],
                    "variant_sources": null,
                    "last_variant_group_types": null,
                    "merchant_hints": [],
                    "provider_title": query
                }),
                "version": "1",
                "variant_options_query": null
            }
        };

        const response = await fetch("https://chatgpt.com/backend-api/search/product_info", {
            "headers": {
                "accept": "text/event-stream",
                "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,es-AR;q=0.7,es;q=0.6,de;q=0.5,it;q=0.4,zh-CN;q=0.3,zh;q=0.2,id;q=0.1,pt-BR;q=0.1,pt;q=0.1,fr;q=0.1,tr;q=0.1,pl;q=0.1,sv;q=0.1,ru;q=0.1,ar;q=0.1,el;q=0.1",
                "authorization": "Bearer " + token,
                "content-type": "application/json",
                "oai-client-version": "prod-43c98f917bf2c3e3a36183e9548cd048e4e40615",
                "oai-device-id": generateDeviceId(),
                "oai-language": "en-US",
                "priority": "u=1, i",
                "sec-ch-ua": '"Opera";v="120", "Not-A.Brand";v="8", "Chromium";v="135"',
                "sec-ch-ua-arch": '"arm"',
                "sec-ch-ua-bitness": '"64"',
                "sec-ch-ua-full-version": '"120.0.5543.161"',
                "sec-ch-ua-full-version-list": '"Opera";v="120.0.5543.161", "Not-A.Brand";v="8.0.0.0", "Chromium";v="135.0.7049.115"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-model": '""',
                "sec-ch-ua-platform": '"macOS"',
                "sec-ch-ua-platform-version": '"15.5.0"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin"
            },
            "referrer": window.location.href,
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": JSON.stringify(requestBody),
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseText = await response.text();
        return parseProductInfo(responseText);
    }

    function parseProductInfo(content) {
        const products = [];
        const reviews = [];
        const productLinks = []; // Store product links from grouped_citation
        const rationaleObj = { text: '' }; // Track the current rationale being built (using object for reference)
        const citations = new Map(); // Store citations by cite key
        const summaryObj = { text: '' }; // Track the current summary being built (using object for reference)
        
        const lines = content.split('\n');
        let currentEvent = null;
        let currentData = [];
        let eventCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.startsWith('event: ')) {
                if (currentEvent && currentData.length > 0) {
                    processEvent(currentEvent, currentData.join('\n'), products, reviews, productLinks, rationaleObj, eventCount, citations, summaryObj);
                    eventCount++;
                }
                
                currentEvent = line.replace('event: ', '').trim();
                currentData = [];
            } else if (line.startsWith('data: ')) {
                currentData.push(line.replace('data: ', ''));
            } else if (line.trim() === '') {
                continue;
            } else {
                currentData.push(line);
            }
        }
        
        if (currentEvent && currentData.length > 0) {
            processEvent(currentEvent, currentData.join('\n'), products, reviews, productLinks, rationaleObj, eventCount, citations, summaryObj);
            eventCount++;
        }
        
        // Map citations to reviews
        for (const review of reviews) {
            if (review.cite && citations.has(review.cite)) {
                review.url = citations.get(review.cite).url;
            }
        }
        
        const uniqueMerchants = new Set();
        for (const product of products) {
            for (const offer of product.offers || []) {
                if (offer.merchant_name) {
                    uniqueMerchants.add(offer.merchant_name);
                }
            }
        }
        
        const reviewThemes = [...new Set(reviews.map(review => review.theme))];
        
        return {
            products: products,
            productLinks: productLinks, // Add detected product links
            reviews: reviews,
            rationale: rationaleObj.text || null,
            reviewSummary: summaryObj.text || null, // Add the built summary
            summary: {
                total_products: products.length,
                total_product_links: productLinks.length,
                total_reviews: reviews.length,
                unique_merchants: uniqueMerchants.size,
                review_themes: reviewThemes
            }
        };
    }

    function processEvent(eventType, dataStr, products, reviews, productLinks, rationaleObj, eventIndex, citations, summaryObj) {
        if (eventType !== 'delta' || !dataStr || dataStr === '""') {
            return;
        }
        
        try {
            const data = JSON.parse(dataStr);
            
            if (typeof data !== 'object' || data === null) {
                return;
            }
            
            // Track processed patches to avoid duplicates
            const processedPatches = new Set();
            
            // Handle direct patch objects (like your examples)
            if (data.p === '/grouped_citation' && data.o === 'replace' && data.v && data.v.url) {
                eventIndex++;
                const citeKey = `turn0search${eventIndex}`;
                citations.set(citeKey, {
                    url: data.v.url,
                    title: data.v.title || ''
                });
                
                // Capture ALL grouped_citation objects as product links
                const productLink = {
                    title: data.v.title || '',
                    url: data.v.url,
                    snippet: data.v.snippet || '',
                    source: extractDomainFromUrl(data.v.url)
                };
                productLinks.push(productLink);
            }
            
            // Handle direct rationale patches
            if (data.p === '/rationale' && data.o === 'append' && data.v) {
                rationaleObj.text += data.v;
            }
            
            // Handle direct summary patches
            if (data.p === '/summary' && data.o === 'append' && data.v) {
                summaryObj.text += data.v;
            }
            
            // Capture citations from cite_map and rationale patches
            if (data.v && Array.isArray(data.v)) {
                for (const patch of data.v) {
                    if (patch.p && patch.p.startsWith('/cite_map/') && patch.o === 'add' && patch.v && patch.v.url) {
                        const citeKey = patch.p.replace('/cite_map/', '');
                        citations.set(citeKey, {
                            url: patch.v.url,
                            title: patch.v.title || ''
                        });
                    }
                    
                    // Capture grouped_citation from data.v array (like your example!)
                    if (patch.p === '/grouped_citation' && patch.o === 'replace' && patch.v && patch.v.url) {
                        eventIndex++;
                        const citeKey = `turn0search${eventIndex}`;
                        citations.set(citeKey, {
                            url: patch.v.url,
                            title: patch.v.title || ''
                        });
                        
                        // Capture ALL grouped_citation objects as product links
                        const productLink = {
                            title: patch.v.title || '',
                            url: patch.v.url,
                            snippet: patch.v.snippet || '',
                            source: extractDomainFromUrl(patch.v.url)
                        };
                        productLinks.push(productLink);
                    }
                    
                    // Handle individual grouped_citation property updates (like URL changes)
                    if (patch.p && patch.p.startsWith('/grouped_citation/') && patch.o === 'replace' && patch.v) {
                        
                        // If this is a URL update, create/update the product link
                        if (patch.p === '/grouped_citation/url') {
                            // Find existing citations and update them, or create new one
                            const existingCite = Array.from(citations.entries()).find(([key, value]) => 
                                key.startsWith('turn0search')
                            );
                            
                            const citeKey = existingCite ? existingCite[0] : `turn0search${eventIndex++}`;
                            
                            // Update or create citation
                            const existingCitation = citations.get(citeKey) || {};
                            citations.set(citeKey, {
                                ...existingCitation,
                                url: patch.v
                            });
                            
                            // Add as product link (URL update often means better/final URL)
                            const productLink = {
                                title: existingCitation.title || 'Product Link',
                                url: patch.v,
                                snippet: '',
                                source: extractDomainFromUrl(patch.v)
                            };
                            productLinks.push(productLink);
                        }
                    }
                    
                    // Capture rationale patches from data.v array
                    if (patch.p === '/rationale' && patch.o === 'append' && patch.v) {
                        const patchKey = `/rationale-${patch.v}`;
                        if (!processedPatches.has(patchKey)) {
                            processedPatches.add(patchKey);
                            rationaleObj.text += patch.v;
                        }
                    }
                    
                    // Capture summary patches from data.v array
                    if (patch.p === '/summary' && patch.o === 'append' && patch.v) {
                        summaryObj.text += patch.v;
                    }
                }
            }
            
            // Also check patch operations for citations and rationale updates
            if (data.o === 'patch' && data.v && Array.isArray(data.v)) {
                for (const patch of data.v) {
                    if (patch.p && patch.p.startsWith('/cite_map/') && patch.o === 'add' && patch.v && patch.v.url) {
                        const citeKey = patch.p.replace('/cite_map/', '');
                        citations.set(citeKey, {
                            url: patch.v.url,
                            title: patch.v.title || ''
                        });
                    }
                    
                    if (patch.p === '/grouped_citation' && patch.o === 'replace' && patch.v && patch.v.url) {
                        // This is a citation being added/updated
                        citations.set(`turn0search${eventIndex}`, {
                            url: patch.v.url,
                            title: patch.v.title || ''
                        });
                        
                        // Capture ALL grouped_citation objects as product links
                        // Always add since grouped_citation can be updated with better URLs
                        const productLink = {
                            title: patch.v.title || '',
                            url: patch.v.url,
                            snippet: patch.v.snippet || '',
                            source: extractDomainFromUrl(patch.v.url)
                        };
                        productLinks.push(productLink);
                    }
                    
                    // Capture rationale patches
                    if (patch.p === '/rationale' && patch.o === 'append' && patch.v) {
                        const patchKey = `/rationale-${patch.v}`;
                        if (!processedPatches.has(patchKey)) {
                            processedPatches.add(patchKey);
                            rationaleObj.text += patch.v;
                        }
                    }
                    
                    // Capture summary patches
                    if (patch.p === '/summary' && patch.o === 'append' && patch.v) {
                        summaryObj.text += patch.v;
                    }
                }
            }
            
            if (data.v && typeof data.v === 'object' && !Array.isArray(data.v)) {
                const vData = data.v;
                
                if (vData.type === 'product_entity' && vData.product) {
                    const product = vData.product;
                    
                    const productInfo = {
                        title: product.title || '',
                        price: product.price || '',
                        url: product.url || '',
                        merchants: product.merchants || '',
                        description: product.description || null,
                        rating: product.rating || null,
                        num_reviews: product.num_reviews || null,
                        featured_tag: product.featured_tag || null,
                        image_urls: product.image_urls || [],
                        offers: []
                    };
                    
                    if (product.offers) {
                        for (const offerData of product.offers) {
                            const offer = {
                                merchant_name: offerData.merchant_name || '',
                                product_name: offerData.product_name || '',
                                url: offerData.url || '',
                                price: offerData.price || '',
                                details: offerData.details || null,
                                available: offerData.available !== false,
                                tag: offerData.tag?.text || null
                            };
                            productInfo.offers.push(offer);
                        }
                    }
                    
                    productInfo.variants = [];
                    if (product.variants) {
                        for (const variant of product.variants) {
                            const selectedOption = variant.options?.find(opt => opt.selected)?.label || null;
                            productInfo.variants.push({
                                type: variant.label || '',
                                selected: selectedOption
                            });
                        }
                    }
                    
                    products.push(productInfo);
                }
                
                else if (vData.type === 'product_reviews') {
                    // Initialize the current summary from the product_reviews object
                    if (vData.summary) {
                        summaryObj.text = vData.summary;
                    }
                    
                    const reviewList = vData.reviews || [];
                    for (const reviewData of reviewList) {
                        const review = {
                            source: reviewData.source || '',
                            theme: reviewData.theme || '',
                            summary: reviewData.summary || '',
                            sentiment: reviewData.sentiment || '',
                            rating: reviewData.rating || null,
                            num_reviews: reviewData.num_reviews || null,
                            cite: reviewData.cite || `turn0search${eventIndex}`,
                            url: null // Will be populated later from citations
                        };
                        reviews.push(review);
                    }
                }
                
                else if (vData.type === 'product_rationale') {
                    const rationale = vData.rationale || '';
                    if (rationale) {
                        // Initialize rationale - set the initial text
                        rationaleObj.text = rationale;
                    }
                }
            }
            
            else if (data.o === 'add' && data.v) {
                const vData = data.v;
                if (typeof vData === 'object' && vData.type === 'product_reviews') {
                    const reviewList = vData.reviews || [];
                    for (const reviewData of reviewList) {
                        if (typeof reviewData === 'object') {
                            const review = {
                                source: reviewData.source || '',
                                theme: reviewData.theme || '',
                                summary: reviewData.summary || '',
                                sentiment: reviewData.sentiment || '',
                                rating: reviewData.rating || null,
                                num_reviews: reviewData.num_reviews || null,
                                cite: reviewData.cite || `turn0search${eventIndex}`,
                                url: null // Will be populated later from citations
                            };
                            reviews.push(review);
                        }
                    }
                }
            }
            
            else if (data.o === 'patch' && data.v) {
                const vData = data.v;
                if (Array.isArray(vData)) {
                    for (const item of vData) {
                        if (typeof item === 'object' && item.p === '/reviews' && item.o === 'append') {
                            const reviewList = item.v || [];
                            if (Array.isArray(reviewList)) {
                                for (const reviewData of reviewList) {
                                    if (typeof reviewData === 'object') {
                                        const review = {
                                            source: reviewData.source || '',
                                            theme: reviewData.theme || '',
                                            summary: reviewData.summary || '',
                                            sentiment: reviewData.sentiment || '',
                                            rating: reviewData.rating || null,
                                            num_reviews: reviewData.num_reviews || null,
                                            cite: reviewData.cite || `turn0search${eventIndex}`,
                                            url: null // Will be populated later from citations
                                        };
                                        reviews.push(review);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            if (data.v && Array.isArray(data.v)) {
                for (const item of data.v) {
                    if (typeof item === 'object' && item.p === '/reviews' && item.o === 'append') {
                        const reviewList = item.v || [];
                        if (Array.isArray(reviewList)) {
                            for (const reviewData of reviewList) {
                                if (typeof reviewData === 'object') {
                                const review = {
                                    source: reviewData.source || '',
                                    theme: reviewData.theme || '',
                                    summary: reviewData.summary || '',
                                    sentiment: reviewData.sentiment || '',
                                    rating: reviewData.rating || null,
                                    num_reviews: reviewData.num_reviews || null,
                                    cite: reviewData.cite || `turn0search${eventIndex}`,
                                    url: null // Will be populated later from citations
                                };
                                reviews.push(review);
                                }
                            }
                        }
                    }
                }
            }
            
        } catch (jsonError) {
            return;
        }
    }

    function generateDeviceId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function extractDomainFromUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch (e) {
            return url.split('/')[2] || url;
        }
    }

    function displayResults(data, query) {
        if (!data || (!data.reviews.length && !data.products.length)) {
            resultsContainer.innerHTML = `
                <div style="
                    background: #fef2f2;
                    color: #991b1b;
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #ef4444;
                    margin: 20px 0;
                ">
                    <h3>No results found</h3>
                    <p>No products or reviews were found for "${query}". Try a different search term.</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <div style="
                padding: 12px;
                margin-bottom: 16px;
                border-bottom: 1px solid #e9ecef;
            ">
                <div style="
                    font-size: 16px;
                    font-weight: 600;
                    color: #495057;
                    margin-bottom: 8px;
                ">Results for "${query}"</div>
                <div style="display: flex; gap: 16px; font-size: 14px; color: #6c757d;">
                    <span>${data.summary.total_reviews} reviews</span>
                    <span>${data.summary.total_products} products, and ${data.summary.total_product_links} citation links</span>
                    <span>${data.summary.review_themes.length} themes</span>
                </div>
            </div>
        `;
        
        if (data.rationale && data.rationale.trim()) {
            html += `
                <div style="margin-bottom: 20px;">
                    <div style="
                        font-size: 14px;
                        font-weight: 600;
                        color: #495057;
                        margin-bottom: 8px;
                        padding: 0 12px;
                    ">Product Overview</div>
                    <div style="
                        background: #e2f1ff;
                        padding: 12px;
                        margin: 0 12px;
                        color: #000;
                        line-height: 1.4;
                        font-size: 13px;
                        border-left: 3px solid #3a6797;
                    ">${data.rationale}</div>
                </div>
            `;
        }

        if (data.reviewSummary && data.reviewSummary.trim()) {
            html += `
                <div style="margin-bottom: 20px;">
                    <div style="
                        font-size: 14px;
                        font-weight: 600;
                        color: #495057;
                        margin-bottom: 8px;
                        padding: 0 12px;
                    ">Review Summary</div>
                    <div style="
                        background: #f5fee8;
                        padding: 12px;
                        margin: 0 12px;
                        color: #000;
                        line-height: 1.4;
                        font-size: 13px;
                        border-left: 3px solid #93ac71;
                    ">${data.reviewSummary}</div>
                </div>
            `;
        }

        if (data.productLinks && data.productLinks.length > 0) {
            html += `
                <div style="margin-bottom: 20px;">
                    <div style="
                        font-size: 14px;
                        font-weight: 600;
                        color: #495057;
                        margin-bottom: 8px;
                        padding: 0 12px;
                    ">Citation Links</div>
                    ${data.productLinks.map(link => `
                        <div style="
                            border: 1px solid #e9ecef;
                            border-radius: 6px;
                            padding: 12px;
                            margin: 0 12px 8px 12px;
                            background: #f8f9fa;
                        ">
                            <div style="
                                display: flex;
                                align-items: center;
                                margin-bottom: 6px;
                                gap: 8px;
                            ">
                                <img src="https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(link.url)}&size=128" alt="${link.source}" style="
                                    width: 16px;
                                    height: 16px;
                                    border-radius: 2px;
                                    flex-shrink: 0;
                                " onerror="this.style.display='none'">
                                <span style="
                                    font-weight: 600;
                                    color: #007bff;
                                    font-size: 14px;
                                ">${link.title}</span>
                                <a href="${link.url}" target="_blank" style="
                                    color: #28a745;
                                    text-decoration: none;
                                    font-size: 14px;
                                    margin-left: auto;
                                    background: #d4edda;
                                    padding: 4px 8px;
                                    border-radius: 4px;
                                    border: 1px solid #c3e6cb;
                                " title="Visit citation page">↗</a>
                            </div>
                            ${link.snippet ? `<div style="
                                color: #6c757d;
                                font-size: 12px;
                                line-height: 1.3;
                                margin-top: 4px;
                            ">${link.snippet}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (data.reviews.length > 0) {
            // Calculate sentiment distribution
            const sentimentCounts = data.reviews.reduce((acc, review) => {
                acc[review.sentiment] = (acc[review.sentiment] || 0) + 1;
                return acc;
            }, {});
            
            const totalReviews = data.reviews.length;
            const positiveCount = sentimentCounts.positive || 0;
            const neutralCount = sentimentCounts.neutral || 0;
            const negativeCount = sentimentCounts.negative || 0;
            
            const positivePercent = Math.round((positiveCount / totalReviews) * 100);
            const neutralPercent = Math.round((neutralCount / totalReviews) * 100);
            const negativePercent = Math.round((negativeCount / totalReviews) * 100);
            
            html += `
                <div>
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 12px;
                        padding: 0 12px;
                    ">
                        <div style="
                            font-size: 14px;
                            font-weight: 600;
                            color: #495057;
                        ">Reviews</div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="
                                display: flex;
                                background: #f8f9fa;
                                border-radius: 8px;
                                overflow: hidden;
                                width: 100px;
                                height: 6px;
                                border: 1px solid #e9ecef;
                            ">
                                ${positiveCount > 0 ? `<div style="
                                    background: #28a745;
                                    width: ${positivePercent}%;
                                    height: 100%;
                                " title="${positiveCount} positive (${positivePercent}%)"></div>` : ''}
                                ${neutralCount > 0 ? `<div style="
                                    background: #ffc107;
                                    width: ${neutralPercent}%;
                                    height: 100%;
                                " title="${neutralCount} neutral (${neutralPercent}%)"></div>` : ''}
                                ${negativeCount > 0 ? `<div style="
                                    background: #dc3545;
                                    width: ${negativePercent}%;
                                    height: 100%;
                                " title="${negativeCount} negative (${negativePercent}%)"></div>` : ''}
                            </div>
                            <div style="
                                font-size: 12px;
                                color: #6c757d;
                                white-space: nowrap;
                            ">
                                <span style="color: #28a745;">●</span> ${positivePercent}%
                                ${neutralCount > 0 ? `<span style="color: #ffc107; margin-left: 6px;">●</span> ${neutralPercent}%` : ''}
                                ${negativeCount > 0 ? `<span style="color: #dc3545; margin-left: 6px;">●</span> ${negativePercent}%` : ''}
                            </div>
                        </div>
                    </div>
                    ${data.reviews.map(review => {
                        const sentimentColor = review.sentiment === 'positive' ? '#28a745' : 
                                             review.sentiment === 'negative' ? '#dc3545' : '#ffc107';
                        
                        
                        return `
                            <div style="
                                border-bottom: 1px solid #f8f9fa;
                                padding: 12px;
                                margin-bottom: 1px;
                            ">
                                <div style="
                                    display: flex;
                                    align-items: center;
                                    margin-bottom: 8px;
                                    gap: 8px;
                                ">
                                    <img src="https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(review.url || `https://${review.source.toLowerCase().replace(/\s+/g, '')}.com`)}&size=128" alt="${review.source}" style="
                                        width: 16px;
                                        height: 16px;
                                        border-radius: 2px;
                                        flex-shrink: 0;
                                    " onerror="this.style.display='none'">
                                    <span style="font-weight: 500; color: #495057; font-size: 14px;">${review.source}</span>
                                    ${review.url ? `<a href="${review.url}" target="_blank" style="
                                        color: #6c757d;
                                        text-decoration: none;
                                        font-size: 12px;
                                        margin-left: auto;
                                    " title="Open source">↗</a>` : ''}
                                    <span style="
                                        width: 8px;
                                        height: 8px;
                                        border-radius: 50%;
                                        background: ${sentimentColor};
                                        display: inline-block;
                                        margin-left: ${review.url ? '4px' : 'auto'};
                                    "></span>
                                </div>
                                <div style="
                                    font-size: 13px;
                                    font-weight: 600;
                                    color: #007bff;
                                    margin-bottom: 6px;
                                ">${review.theme}</div>
                                <div style="color: #6c757d; line-height: 1.4; font-size: 13px;">${review.summary}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        if (data.summary.review_themes.length > 0) {
            html += `
                <div style="margin-bottom: 20px;">
                    <div style="
                        font-size: 14px;
                        font-weight: 600;
                        color: #495057;
                        margin-bottom: 8px;
                        padding: 0 12px;
                    ">Themes</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 0 12px;">
                        ${data.summary.review_themes.map(theme => 
                            `<span style="
                                background: #e9ecef;
                                color: #495057;
                                padding: 4px 8px;
                                border-radius: 12px;
                                font-size: 12px;
                            ">${theme}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
        
        resultsContainer.innerHTML = html;
    }

    function displayError(message) {
        resultsContainer.innerHTML = `
            <div style="
                background: #fef2f2;
                color: #991b1b;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #ef4444;
                margin: 20px 0;
            ">
                <h3>Search Error</h3>
                <p>${message}</p>
                <p>Please check your token and try again.</p>
            </div>
        `;
    }

    // Initialize token status check
    async function initializeTokenStatus() {
        const tokenInput = document.getElementById('auth-token');
        const authStatus = document.getElementById('auth-status');
        
        try {
            const response = await fetch("/api/auth/session");
            if (response.ok) {
                const sessionData = await response.json();
                if (sessionData.accessToken) {
                    // Update hidden token field
                    if (tokenInput) {
                        tokenInput.placeholder = "✅ Token ready - session active";
                        tokenInput.style.backgroundColor = "#f0f8ff";
                        tokenInput.style.borderColor = "#007bff";
                    }
                    
                    // Update visible auth status
                    if (authStatus) {
                        authStatus.innerHTML = "✅ Ready to search";
                        authStatus.style.background = "#d4edda";
                        authStatus.style.color = "#155724";
                        authStatus.style.borderColor = "#c3e6cb";
                    }
                    
                } else {
                    throw new Error("No access token in session");
                }
            } else {
                throw new Error(`Session check failed: ${response.status}`);
            }
        } catch (error) {
            // Update hidden token field
            if (tokenInput) {
                tokenInput.placeholder = "❌ Please log in to ChatGPT first";
                tokenInput.style.backgroundColor = "#fff5f5";
                tokenInput.style.borderColor = "#ef4444";
            }
            
            // Update visible auth status
            if (authStatus) {
                authStatus.innerHTML = "❌ Please log in to ChatGPT first";
                authStatus.style.background = "#f8d7da";
                authStatus.style.color = "#721c24";
                authStatus.style.borderColor = "#f5c6cb";
            }
            
        }
    }

    // Initialize token status
    initializeTokenStatus();

})();

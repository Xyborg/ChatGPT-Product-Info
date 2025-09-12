// ChatGPT Product Info Search
// Paste this entire script into ChatGPT's browser console and it will create a floating button

(function() {
    // Remove existing modal and button if present
    const existingModal = document.getElementById('chatgpt-product-search-modal');
    const existingButton = document.getElementById('openProductSearchModalBtn');
    if (existingModal) {
        existingModal.remove();
    }
    if (existingButton) {
        existingButton.remove();
    }

    // Add floating button styles
    const floatingButtonCSS = `
        #openProductSearchModalBtn {
            position: fixed;
            right: 20px;
            top: 40%;
            transform: translateY(-50%);
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            font-size: 24px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            cursor: pointer;
            z-index: 9990;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        #openProductSearchModalBtn:hover {
            background-color: #0056b3;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
    `;

    // Create modal HTML
    const modalHTML = `
        <div id="chatgpt-product-search-modal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgb(230 237 248 / 80%);
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
                    <div id="search-area" style="
                        position: relative;
                        padding: 20px;
                        border-bottom: 1px solid #e9ecef;
                        background: white;
                        transition: all 0.3s ease;
                    ">
                        <!-- Collapse/Expand Button - positioned absolutely -->
                        <div id="collapse-toggle" style="
                            display: none;
                            position: absolute;
                            top: 8px;
                            right: 20px;
                            cursor: pointer;
                            color: #007bff;
                            font-size: 12px;
                            font-weight: 500;
                            transition: all 0.2s ease;
                            border-radius: 4px;
                            padding: 4px 8px;
                            background: rgba(0, 123, 255, 0.1);
                            border: 1px solid rgba(0, 123, 255, 0.2);
                            z-index: 10;
                        ">
                            <span id="collapse-text">▲ Hide</span>
                        </div>
                        
                        <div id="search-controls">
                        <!-- Multi-product toggle -->
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding: 8px 0;">
                            <label style="
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                font-size: 14px;
                                color: #495057;
                                font-weight: 500;
                                cursor: pointer;
                            ">
                                <div style="
                                    position: relative;
                                    width: 44px;
                                    height: 24px;
                                    background: #dee2e6;
                                    border-radius: 12px;
                                    transition: background 0.3s ease;
                                    cursor: pointer;
                                " id="toggle-background">
                                    <input type="checkbox" id="multi-product-toggle" style="
                                        position: absolute;
                                        opacity: 0;
                                        width: 100%;
                                        height: 100%;
                                        margin: 0;
                                        cursor: pointer;
                                    " />
                                    <div style="
                                        position: absolute;
                                        top: 2px;
                                        left: 2px;
                                        width: 20px;
                                        height: 20px;
                                        background: white;
                                        border-radius: 50%;
                                        transition: transform 0.3s ease;
                                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                                    " id="toggle-slider"></div>
                                </div>
                                Multi-product search
                            </label>
                            <div style="
                                font-size: 12px;
                                color: #6c757d;
                                font-style: italic;
                            ">Search multiple products at once</div>
                        </div>
                        
                        <!-- Single product input -->
                        <div id="single-product-input" style="display: flex; gap: 12px; margin-bottom: 12px;">
                            <input type="text" id="search-query" placeholder="Search query (e.g., iPhone 17, Nike shoes, Pets Deli Hundefutter)" style="
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
                        
                        <!-- Multi product input -->
                        <div id="multi-product-input" style="display: none; margin-bottom: 12px;">
                            <textarea id="multi-search-query" placeholder="Enter product names, one per line:&#10;iPhone 17 Pro&#10;Samsung Galaxy S25&#10;Google Pixel 9" style="
                                width: 100%;
                                min-height: 100px;
                                padding: 8px 12px;
                                border: 1px solid #dee2e6;
                                border-radius: 4px;
                                font-size: 14px;
                                box-sizing: border-box;
                                resize: vertical;
                                font-family: inherit;
                                margin-bottom: 8px;
                            "></textarea>
                            <div style="display: flex; gap: 12px;">
                                <button id="multi-search-btn" style="
                                    background: #007bff;
                                    color: white;
                                    border: none;
                                    padding: 8px 16px;
                                    border-radius: 4px;
                                    font-size: 14px;
                                    font-weight: 500;
                                    cursor: pointer;
                                    white-space: nowrap;
                                ">Search All Products</button>
                                <div style="
                                    font-size: 12px;
                                    color: #6c757d;
                                    align-self: center;
                                    font-style: italic;
                                ">Results will be shown in a table format</div>
                            </div>
                        </div>
                        </div> <!-- End search-controls -->
                        
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
                    Created by <a href="https://www.martinaberastegue.com/" target="_blank" rel="noopener noreferrer">Martin Aberastegue (@Xyborg)</a>
                </div>
            </div>
        </div>
    `;

    // Function to create and show modal
    function createModal() {
        // Remove existing modal if present
        const existingModal = document.getElementById('chatgpt-product-search-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Inject modal into page
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Get modal elements
        const modal = document.getElementById('chatgpt-product-search-modal');
        const closeBtn = document.getElementById('close-modal-btn');
        const searchBtn = document.getElementById('search-btn');
        const multiSearchBtn = document.getElementById('multi-search-btn');
        const searchQuery = document.getElementById('search-query');
        const multiSearchQuery = document.getElementById('multi-search-query');
        const authToken = document.getElementById('auth-token');
        const resultsContainer = document.getElementById('results-container');
        const multiProductToggle = document.getElementById('multi-product-toggle');
        const toggleBackground = document.getElementById('toggle-background');
        const toggleSlider = document.getElementById('toggle-slider');
        const singleProductInput = document.getElementById('single-product-input');
        const multiProductInput = document.getElementById('multi-product-input');
        const collapseToggle = document.getElementById('collapse-toggle');
        const collapseText = document.getElementById('collapse-text');
        const searchControls = document.getElementById('search-controls');

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

        // Toggle functionality
        multiProductToggle.addEventListener('change', () => {
            const isMultiMode = multiProductToggle.checked;
            
            if (isMultiMode) {
                // Switch to multi-product mode
                singleProductInput.style.display = 'none';
                multiProductInput.style.display = 'block';
                toggleBackground.style.background = '#007bff';
                toggleSlider.style.transform = 'translateX(20px)';
            } else {
                // Switch to single-product mode
                singleProductInput.style.display = 'flex';
                multiProductInput.style.display = 'none';
                toggleBackground.style.background = '#dee2e6';
                toggleSlider.style.transform = 'translateX(0px)';
            }
        });

        // Collapse/Expand functionality
        collapseToggle.addEventListener('click', () => {
            const isCollapsed = searchControls.style.display === 'none';
            
            if (isCollapsed) {
                // Expand
                searchControls.style.display = 'block';
                collapseText.textContent = '▲ Hide';
                collapseToggle.style.background = 'rgba(0, 123, 255, 0.1)';
                collapseToggle.style.border = '1px solid rgba(0, 123, 255, 0.2)';
                collapseToggle.style.color = '#007bff';
            } else {
                // Collapse
                searchControls.style.display = 'none';
                collapseText.textContent = '▼ Show';
                collapseToggle.style.background = 'rgba(40, 167, 69, 0.1)';
                collapseToggle.style.border = '1px solid rgba(40, 167, 69, 0.2)';
                collapseToggle.style.color = '#28a745';
            }
        });

        // Add hover effects to collapse toggle
        collapseToggle.addEventListener('mouseenter', () => {
            const isCollapsed = searchControls.style.display === 'none';
            if (isCollapsed) {
                collapseToggle.style.background = 'rgba(40, 167, 69, 0.2)';
                collapseToggle.style.transform = 'scale(1.05)';
            } else {
                collapseToggle.style.background = 'rgba(0, 123, 255, 0.2)';
                collapseToggle.style.transform = 'scale(1.05)';
            }
        });

        collapseToggle.addEventListener('mouseleave', () => {
            const isCollapsed = searchControls.style.display === 'none';
            if (isCollapsed) {
                collapseToggle.style.background = 'rgba(40, 167, 69, 0.1)';
            } else {
                collapseToggle.style.background = 'rgba(0, 123, 255, 0.1)';
            }
            collapseToggle.style.transform = 'scale(1)';
        });

        // Search functionality
        searchBtn.addEventListener('click', performSearch);
        multiSearchBtn.addEventListener('click', performMultiSearch);

        // Enter key support
        searchQuery.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        // Initialize token status
        initializeTokenStatus();
    }

    // Function to show the collapse toggle after results are displayed
    function showCollapseToggle() {
        const collapseToggle = document.getElementById('collapse-toggle');
        if (collapseToggle) {
            collapseToggle.style.display = 'block';
        }
    }

    async function performSearch() {
        const searchQuery = document.getElementById('search-query');
        const searchBtn = document.getElementById('search-btn');
        const resultsContainer = document.getElementById('results-container');
        
        if (!searchQuery || !searchBtn || !resultsContainer) {
            alert('Modal elements not found. Please try again.');
            return;
        }
        
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
            // Show collapse toggle after results are displayed
            showCollapseToggle();
        }
    }

    async function performMultiSearch() {
        const multiSearchQuery = document.getElementById('multi-search-query');
        const multiSearchBtn = document.getElementById('multi-search-btn');
        const resultsContainer = document.getElementById('results-container');
        
        if (!multiSearchQuery || !multiSearchBtn || !resultsContainer) {
            alert('Modal elements not found. Please try again.');
            return;
        }
        
        const queries = multiSearchQuery.value.trim().split('\n').filter(q => q.trim());
        
        if (queries.length === 0) {
            alert('Please enter at least one product name');
            return;
        }
        
        if (queries.length > 10) {
            alert('Maximum 10 products allowed at once to avoid rate limiting');
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
        multiSearchBtn.disabled = true;
        multiSearchBtn.textContent = 'Searching...';
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
                <p>Searching ${queries.length} products...</p>
                <div id="progress-status" style="font-size: 14px; color: #999; margin-top: 10px;">
                    Starting searches...
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        const results = [];
        const progressStatus = document.getElementById('progress-status');
        
        try {
            // Search products one by one
            for (let i = 0; i < queries.length; i++) {
                const query = queries[i].trim();
                if (progressStatus) {
                    progressStatus.textContent = `Searching "${query}" (${i + 1}/${queries.length})...`;
                }
                
                try {
                    const result = await searchProduct(query, token);
                    results.push({
                        query: query,
                        success: true,
                        data: result
                    });
                } catch (error) {
                    results.push({
                        query: query,
                        success: false,
                        error: error.message
                    });
                }
                
                // Add a small delay between requests to be respectful
                if (i < queries.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            displayMultiResults(results);
        } catch (error) {
            displayError(error.message);
        } finally {
            multiSearchBtn.disabled = false;
            multiSearchBtn.textContent = 'Search All Products';
            // Show collapse toggle after results are displayed
            showCollapseToggle();
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
                
                // Remove any existing product link with the same URL to avoid duplicates
                const existingLinkIndex = productLinks.findIndex(link => link.url === data.v.url);
                
                // Capture ALL grouped_citation objects as product links
                const productLink = {
                    title: data.v.title || '',
                    url: data.v.url,
                    snippet: data.v.snippet || '',
                    source: extractDomainFromUrl(data.v.url)
                };
                
                if (existingLinkIndex >= 0) {
                    // Update existing link with potentially better title
                    productLinks[existingLinkIndex] = productLink;
                } else {
                    // Add new link
                    productLinks.push(productLink);
                }
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
                        
                        // Remove any existing product link with the same URL to avoid duplicates
                        const existingLinkIndex = productLinks.findIndex(link => link.url === patch.v.url);
                        
                        // Capture ALL grouped_citation objects as product links
                        const productLink = {
                            title: patch.v.title || '',
                            url: patch.v.url,
                            snippet: patch.v.snippet || '',
                            source: extractDomainFromUrl(patch.v.url)
                        };
                        
                        if (existingLinkIndex >= 0) {
                            // Update existing link with potentially better title
                            productLinks[existingLinkIndex] = productLink;
                        } else {
                            // Add new link
                            productLinks.push(productLink);
                        }
                    }
                    
                    // Handle individual grouped_citation property updates (like URL and title changes)
                    if (patch.p && patch.p.startsWith('/grouped_citation/') && patch.o === 'replace' && patch.v) {
                        
                        // Find or create the latest citation entry
                        let latestCiteKey = null;
                        let maxCiteNum = -1;
                        
                        // Find the highest numbered citation
                        for (const [key, value] of citations.entries()) {
                            if (key.startsWith('turn0search')) {
                                const num = parseInt(key.replace('turn0search', ''));
                                if (num > maxCiteNum) {
                                    maxCiteNum = num;
                                    latestCiteKey = key;
                                }
                            }
                        }
                        
                        // If no citation exists yet, create one
                        if (!latestCiteKey) {
                            latestCiteKey = `turn0search${eventIndex}`;
                            citations.set(latestCiteKey, {});
                        }
                        
                        // Update the citation with the new property
                        const existingCitation = citations.get(latestCiteKey) || {};
                        
                        if (patch.p === '/grouped_citation/url') {
                            citations.set(latestCiteKey, {
                                ...existingCitation,
                                url: patch.v
                            });
                        } else if (patch.p === '/grouped_citation/title') {
                            citations.set(latestCiteKey, {
                                ...existingCitation,
                                title: patch.v
                            });
                        }
                        
                        // Update or add product link if we have both URL and title
                        const updatedCitation = citations.get(latestCiteKey);
                        if (updatedCitation.url) {
                            // Remove any existing product link with the same URL to avoid duplicates
                            const existingLinkIndex = productLinks.findIndex(link => link.url === updatedCitation.url);
                            
                            const productLink = {
                                title: updatedCitation.title || 'Product Link',
                                url: updatedCitation.url,
                                snippet: '',
                                source: extractDomainFromUrl(updatedCitation.url)
                            };
                            
                            if (existingLinkIndex >= 0) {
                                // Update existing link
                                productLinks[existingLinkIndex] = productLink;
                            } else {
                                // Add new link
                                productLinks.push(productLink);
                            }
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
                        
                        // Remove any existing product link with the same URL to avoid duplicates
                        const existingLinkIndex = productLinks.findIndex(link => link.url === patch.v.url);
                        
                        // Capture ALL grouped_citation objects as product links
                        const productLink = {
                            title: patch.v.title || '',
                            url: patch.v.url,
                            snippet: patch.v.snippet || '',
                            source: extractDomainFromUrl(patch.v.url)
                        };
                        
                        if (existingLinkIndex >= 0) {
                            // Update existing link with potentially better title
                            productLinks[existingLinkIndex] = productLink;
                        } else {
                            // Add new link
                            productLinks.push(productLink);
                        }
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
        const resultsContainer = document.getElementById('results-container');
        if (!resultsContainer) {
            console.error('Results container not found');
            return;
        }
        
        if (!data || (!data.reviews.length && !data.products.length && !data.productLinks.length)) {
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
                    <span>${data.summary.total_products} products</span>
                    <span>${data.summary.total_product_links} citation links</span>
                    <span>${data.summary.review_themes.length} themes</span>
                </div>
            </div>
        `;

        // Show message when we have links but no reviews or products
        if (data.productLinks.length > 0 && data.reviews.length === 0 && data.products.length === 0) {
            html += `
                <div style="margin-bottom: 20px;">
                    <div style="
                        background: #fff3cd;
                        border: 1px solid #ffeaa7;
                        border-radius: 6px;
                        padding: 12px;
                        margin: 0 12px;
                        color: #856404;
                        font-size: 13px;
                    ">
                        <div style="font-weight: 600; margin-bottom: 4px;">⚠️ Limited Information Available</div>
                        <div>ChatGPT found ${data.productLinks.length} relevant link(s) for this product, but no detailed reviews or product information were retrieved. You can check the citation links below for more information.</div>
                    </div>
                </div>
            `;
        }
        
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

    function displayMultiResults(results) {
        const resultsContainer = document.getElementById('results-container');
        if (!resultsContainer) {
            console.error('Results container not found');
            return;
        }
        
        const successfulResults = results.filter(r => r.success);
        const failedResults = results.filter(r => !r.success);
        
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
                ">Multi-Product Search Results</div>
                <div style="display: flex; gap: 16px; font-size: 14px; color: #6c757d;">
                    <span>${successfulResults.length}/${results.length} products found</span>
                    ${failedResults.length > 0 ? `<span style="color: #dc3545;">${failedResults.length} failed</span>` : ''}
                </div>
            </div>
        `;

        if (failedResults.length > 0) {
            html += `
                <div style="margin-bottom: 20px;">
                    <div style="
                        font-size: 14px;
                        font-weight: 600;
                        color: #dc3545;
                        margin-bottom: 8px;
                        padding: 0 12px;
                    ">Search Errors</div>
                    <div style="
                        background: #f8d7da;
                        border: 1px solid #f5c6cb;
                        border-radius: 4px;
                        padding: 12px;
                        margin: 0 12px;
                        color: #721c24;
                        font-size: 13px;
                    ">
                        ${failedResults.map(r => `<div><strong>${r.query}:</strong> ${r.error}</div>`).join('<br>')}
                    </div>
                </div>
            `;
        }

        if (successfulResults.length === 0) {
            html += `
                <div style="
                    text-align: center;
                    padding: 60px 40px;
                    color: #6c757d;
                ">
                    <div style="font-size: 48px; margin-bottom: 20px; opacity: 0.7;">❌</div>
                    <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #495057;">No Results Found</h3>
                    <p style="margin: 0; font-size: 16px; line-height: 1.5;">None of the products could be found. Please try different search terms.</p>
                </div>
            `;
            resultsContainer.innerHTML = html;
            return;
        }

        // Create comparison table
        html += `
            <div style="margin-bottom: 20px;">
                <div style="
                    font-size: 14px;
                    font-weight: 600;
                    color: #495057;
                    margin-bottom: 12px;
                    padding: 0 12px;
                ">Product Comparison Table</div>
                
                <div style="overflow-x: auto; margin: 0 12px;">
                    <table style="
                        width: 100%;
                        border-collapse: collapse;
                        background: white;
                        border: 1px solid #e9ecef;
                        border-radius: 6px;
                        overflow: hidden;
                        font-size: 13px;
                    ">
                        <thead>
                            <tr style="background: #f8f9fa; border-bottom: 2px solid #e9ecef;">
                                <th style="
                                    padding: 12px 8px;
                                    text-align: left;
                                    font-weight: 600;
                                    color: #495057;
                                    border-right: 1px solid #e9ecef;
                                    min-width: 150px;
                                ">Product</th>
                                <th style="
                                    padding: 12px 8px;
                                    text-align: center;
                                    font-weight: 600;
                                    color: #495057;
                                    border-right: 1px solid #e9ecef;
                                    min-width: 80px;
                                ">Reviews</th>
                                <th style="
                                    padding: 12px 8px;
                                    text-align: center;
                                    font-weight: 600;
                                    color: #495057;
                                    border-right: 1px solid #e9ecef;
                                    min-width: 120px;
                                ">Sentiment</th>
                                <th style="
                                    padding: 12px 8px;
                                    text-align: left;
                                    font-weight: 600;
                                    color: #495057;
                                    border-right: 1px solid #e9ecef;
                                    min-width: 200px;
                                ">Top Themes</th>
                                <th style="
                                    padding: 12px 8px;
                                    text-align: center;
                                    font-weight: 600;
                                    color: #495057;
                                    min-width: 80px;
                                ">Links</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        successfulResults.forEach((result, index) => {
            const data = result.data;
            
            // Calculate sentiment distribution
            const sentimentCounts = data.reviews.reduce((acc, review) => {
                acc[review.sentiment] = (acc[review.sentiment] || 0) + 1;
                return acc;
            }, {});
            
            const totalReviews = data.reviews.length;
            const positiveCount = sentimentCounts.positive || 0;
            const neutralCount = sentimentCounts.neutral || 0;
            const negativeCount = sentimentCounts.negative || 0;
            
            const positivePercent = totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0;
            const neutralPercent = totalReviews > 0 ? Math.round((neutralCount / totalReviews) * 100) : 0;
            const negativePercent = totalReviews > 0 ? Math.round((negativeCount / totalReviews) * 100) : 0;
            
            // Get top 3 themes
            const topThemes = data.summary.review_themes.slice(0, 3);
            
            html += `
                <tr style="
                    border-bottom: 1px solid #f8f9fa;
                    ${index % 2 === 0 ? 'background: #fdfdfd;' : 'background: white;'}
                ">
                    <td style="
                        padding: 12px 8px;
                        border-right: 1px solid #e9ecef;
                        vertical-align: top;
                    ">
                        <div style="
                            font-weight: 600;
                            color: #007bff;
                            margin-bottom: 4px;
                            cursor: pointer;
                        " data-product-index="${index}" class="product-name-link">${result.query}</div>
                        ${data.rationale ? `<div style="
                            color: #6c757d;
                            font-size: 11px;
                            line-height: 1.3;
                            max-height: 60px;
                            overflow: hidden;
                        ">${data.rationale.substring(0, 120)}${data.rationale.length > 120 ? '...' : ''}</div>` : ''}
                    </td>
                    <td style="
                        padding: 12px 8px;
                        text-align: center;
                        border-right: 1px solid #e9ecef;
                        vertical-align: top;
                    ">
                        <div style="font-weight: 600; color: #495057;">${totalReviews}</div>
                        <div style="font-size: 11px; color: #6c757d;">reviews</div>
                    </td>
                    <td style="
                        padding: 12px 8px;
                        text-align: center;
                        border-right: 1px solid #e9ecef;
                        vertical-align: top;
                    ">
                        ${totalReviews > 0 ? `
                            <div style="
                                display: flex;
                                background: #f8f9fa;
                                border-radius: 4px;
                                overflow: hidden;
                                width: 60px;
                                height: 6px;
                                margin: 0 auto 4px auto;
                                border: 1px solid #e9ecef;
                            ">
                                ${positiveCount > 0 ? `<div style="
                                    background: #28a745;
                                    width: ${positivePercent}%;
                                    height: 100%;
                                " title="${positiveCount} positive"></div>` : ''}
                                ${neutralCount > 0 ? `<div style="
                                    background: #ffc107;
                                    width: ${neutralPercent}%;
                                    height: 100%;
                                " title="${neutralCount} neutral"></div>` : ''}
                                ${negativeCount > 0 ? `<div style="
                                    background: #dc3545;
                                    width: ${negativePercent}%;
                                    height: 100%;
                                " title="${negativeCount} negative"></div>` : ''}
                            </div>
                            <div style="
                                font-size: 10px;
                                color: #6c757d;
                                line-height: 1.2;
                            ">
                                <span style="color: #28a745;">●</span>${positivePercent}%
                                ${neutralCount > 0 ? `<br><span style="color: #ffc107;">●</span>${neutralPercent}%` : ''}
                                ${negativeCount > 0 ? `<br><span style="color: #dc3545;">●</span>${negativePercent}%` : ''}
                            </div>
                        ` : '<span style="color: #6c757d; font-size: 11px;">No reviews</span>'}
                    </td>
                    <td style="
                        padding: 12px 8px;
                        border-right: 1px solid #e9ecef;
                        vertical-align: top;
                    ">
                        ${topThemes.length > 0 ? topThemes.map(theme => `
                            <span style="
                                display: inline-block;
                                background: #e9ecef;
                                color: #495057;
                                padding: 2px 6px;
                                border-radius: 8px;
                                font-size: 10px;
                                margin: 1px 2px 1px 0;
                            ">${theme}</span>
                        `).join('') : '<span style="color: #6c757d; font-size: 11px;">No themes</span>'}
                        ${data.summary.review_themes.length > 3 ? `<span style="color: #6c757d; font-size: 10px;">+${data.summary.review_themes.length - 3} more</span>` : ''}
                    </td>
                    <td style="
                        padding: 12px 8px;
                        text-align: center;
                        vertical-align: top;
                    ">
                        <div style="font-weight: 600; color: #495057;">${data.productLinks.length}</div>
                        <div style="font-size: 11px; color: #6c757d;">links</div>
                        ${(data.reviews.length > 0 || data.products.length > 0 || data.rationale || data.reviewSummary) ? `
                            <button data-product-index="${index}" class="view-details-btn" style="
                                background: #007bff;
                                color: white;
                                border: none;
                                padding: 2px 6px;
                                border-radius: 3px;
                                font-size: 10px;
                                cursor: pointer;
                                margin-top: 4px;
                            ">View</button>
                        ` : data.productLinks.length > 0 ? `
                            <button data-product-index="${index}" class="view-details-btn" style="
                                background: #ffc107;
                                color: #212529;
                                border: none;
                                padding: 2px 6px;
                                border-radius: 3px;
                                font-size: 10px;
                                cursor: pointer;
                                margin-top: 4px;
                            ">Links</button>
                        ` : ''}
                    </td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Add detailed results section (initially hidden)
        html += `
            <div id="detailed-results" style="display: none;">
                <div style="
                    font-size: 14px;
                    font-weight: 600;
                    color: #495057;
                    margin-bottom: 12px;
                    padding: 0 12px;
                ">Detailed Product Information</div>
                <div id="detailed-content"></div>
            </div>
        `;

        resultsContainer.innerHTML = html;

        // Store results for detailed view
        window.multiSearchResults = successfulResults;

        // Add event listeners for product details links
        const productNameLinks = document.querySelectorAll('.product-name-link');
        productNameLinks.forEach(link => {
            link.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-product-index'));
                showProductDetails(index);
            });
        });

        const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
        viewDetailsBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-product-index'));
                showProductDetails(index);
            });
        });
    }

    // Function to show detailed product information
    window.showProductDetails = function(index) {
        const detailedResults = document.getElementById('detailed-results');
        const detailedContent = document.getElementById('detailed-content');
        
        if (!window.multiSearchResults || !detailedResults || !detailedContent) {
            return;
        }

        const result = window.multiSearchResults[index];
        if (!result) {
            return;
        }

        const productName = result.query;

        // Display the single product result using existing function
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = '';
        
        // Use the existing displayResults function but capture its output
        const originalContainer = document.getElementById('results-container');
        const tempId = 'temp-results-container';
        tempContainer.id = tempId;
        document.body.appendChild(tempContainer);
        
        // Temporarily replace the results container
        const originalGetElementById = document.getElementById;
        document.getElementById = function(id) {
            if (id === 'results-container') {
                return tempContainer;
            }
            return originalGetElementById.call(document, id);
        };
        
        displayResults(result.data, result.query);
        
        // Restore original function
        document.getElementById = originalGetElementById;
        
        // Move the content to detailed view
        detailedContent.innerHTML = `
            <div style="
                background: #f8f9fa;
                padding: 12px;
                margin-bottom: 16px;
                border-radius: 6px;
                border-left: 4px solid #007bff;
            ">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h3 style="margin: 0; color: #495057;">Detailed view: ${productName}</h3>
                    <button class="close-details-btn" style="
                        background: #6c757d;
                        color: white;
                        border: none;
                        padding: 4px 8px;
                        border-radius: 3px;
                        font-size: 12px;
                        cursor: pointer;
                    ">Close</button>
                </div>
            </div>
            ${tempContainer.innerHTML}
        `;
        
        // Clean up
        document.body.removeChild(tempContainer);
        
        // Add event listener for close button
        const closeBtn = detailedContent.querySelector('.close-details-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                detailedResults.style.display = 'none';
            });
        }

        // Show detailed results
        detailedResults.style.display = 'block';
        detailedResults.scrollIntoView({ behavior: 'smooth' });
    };

    function displayError(message) {
        const resultsContainer = document.getElementById('results-container');
        if (!resultsContainer) {
            console.error('Results container not found');
            alert(`Search Error: ${message}`);
            return;
        }
        
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
        
        if (!tokenInput || !authStatus) {
            console.error('Token status elements not found');
            return;
        }
        
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

    // Function to create floating button
    function createFloatingButton() {
        const button = document.createElement('button');
        button.id = 'openProductSearchModalBtn';
        button.innerHTML = '🛍️';
        button.title = 'Open ChatGPT Product Info Search';
        document.body.appendChild(button);
        return button;
    }

    // Add styles to the page
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = floatingButtonCSS;
    document.head.appendChild(styleSheet);

    // Create floating button and add click handler
    const floatingButton = createFloatingButton();
    floatingButton.addEventListener('click', createModal);

})();
// ChatGPT Product Info Research - Chrome Extension Content Script
// Automatically injects the product search functionality into ChatGPT

(function() {
    'use strict';
    
    // Only run on ChatGPT pages
    if (!window.location.hostname.includes('chatgpt.com')) {
        return;
    }

    // Wait for page to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeExtension);
    } else {
        initializeExtension();
    }

    function initializeExtension() {
        // Remove existing modal and button if present
        const existingModal = document.getElementById('chatgpt-product-search-modal');
        const existingButton = document.getElementById('openProductSearchModalBtn');
        if (existingModal) {
            existingModal.remove();
        }
        if (existingButton) {
            existingButton.remove();
        }

        // Migrate existing search history data to new format (Phase 1)
        migrateSearchHistoryData();

        // Resolve extension assets
        const settingsIconUrl = (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function')
            ? chrome.runtime.getURL('assets/icons-ui/settings.svg')
            : 'assets/icons-ui/settings.svg';
        const searchIconUrl = (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function')
            ? chrome.runtime.getURL('assets/icons-ui/search.svg')
            : 'assets/icons-ui/search.svg';
        const historyIconUrl = (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function')
            ? chrome.runtime.getURL('assets/icons-ui/history.svg')
            : 'assets/icons-ui/history.svg';
        const analysisIconUrl = (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function')
            ? chrome.runtime.getURL('assets/icons-ui/analysis.svg')
            : 'assets/icons-ui/analysis.svg';
        const projectIconUrl = (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function')
            ? chrome.runtime.getURL('assets/icons-ui/project.svg')
            : 'assets/icons-ui/project.svg';
        const tagIconUrl = (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function')
            ? chrome.runtime.getURL('assets/icons-ui/tag.svg')
            : 'assets/icons-ui/tag.svg';
        const editIconUrl = (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function')
            ? chrome.runtime.getURL('assets/icons-ui/edit.svg')
            : 'assets/icons-ui/edit.svg';
        const positiveIconUrl = (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function')
            ? chrome.runtime.getURL('assets/icons-ui/positive.svg')
            : 'assets/icons-ui/positive.svg';
        const neutralIconUrl = (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function')
            ? chrome.runtime.getURL('assets/icons-ui/neutral.svg')
            : 'assets/icons-ui/neutral.svg';
        const negativeIconUrl = (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function')
            ? chrome.runtime.getURL('assets/icons-ui/negative.svg')
            : 'assets/icons-ui/negative.svg';
        const checkIconUrl = (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function')
            ? chrome.runtime.getURL('assets/icons-ui/check.svg')
            : 'assets/icons-ui/check.svg';
        const warningIconUrl = (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function')
            ? chrome.runtime.getURL('assets/icons-ui/warning.svg')
            : 'assets/icons-ui/warning.svg';
        const errorIconUrl = (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function')
            ? chrome.runtime.getURL('assets/icons-ui/error.svg')
            : 'assets/icons-ui/error.svg';
        const xIconUrl = (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function')
            ? chrome.runtime.getURL('assets/icons-ui/x.svg')
            : 'assets/icons-ui/x.svg';
        const linkedinIconUrl = (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function')
            ? chrome.runtime.getURL('assets/icons-ui/linkedin.svg')
            : 'assets/icons-ui/linkedin.svg';
        const githubIconUrl = (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function')
            ? chrome.runtime.getURL('assets/icons-ui/github.svg')
            : 'assets/icons-ui/github.svg';

        function formatStatusMessage(iconType, message, size = 'medium') {
            const sizeClass = size === 'large' ? 'status-icon--large' : 'status-icon--medium';
            return `<span class="status-icon ${sizeClass} status-icon--${iconType}" aria-hidden="true"></span><span>${message}</span>`;
        }

        function applyInputStatusStyles(input, { text, iconUrl, color, backgroundColor, borderColor }) {
            if (!input) {
                return;
            }

            input.placeholder = text;
            input.style.backgroundColor = backgroundColor;
            input.style.borderColor = borderColor;
            input.style.color = color;
            input.style.backgroundImage = iconUrl ? `url('${iconUrl}')` : '';
            input.style.backgroundRepeat = 'no-repeat';
            input.style.backgroundPosition = '12px center';
            input.style.backgroundSize = '16px';
            input.style.paddingLeft = iconUrl ? '36px' : '12px';
        }

        function applyStatusBanner(element, { iconType, text, color, backgroundColor, borderColor }) {
            if (!element) {
                return;
            }

            element.innerHTML = formatStatusMessage(iconType, text);
            element.style.display = 'inline-flex';
            element.style.alignItems = 'center';
            element.style.gap = '8px';
            element.style.background = backgroundColor;
            element.style.color = color;
            element.style.borderColor = borderColor;
        }

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
                <style>
                    .table-row-hover:hover {
                        background-color: #fffbf0 !important;
                    }
                    .sidebar-project {
                        padding: 6px 8px;
                        margin: 1px 0;
                        border-radius: 4px;
                        cursor: pointer;
                        transition: background-color 0.2s;
                        font-size: 13px;
                        color: #495057;
                        border: 1px solid transparent;
                    }
                    .sidebar-project:hover {
                        background-color: #e9ecef !important;
                    }
                    .sidebar-tag {
                        padding: 4px 8px;
                        margin: 1px 0;
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all 0.2s;
                        font-size: 12px;
                        color: #495057;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .sidebar-tag:hover {
                        filter: brightness(0.95);
                        transform: scale(1.02);
                    }
                    #toggle-filters:hover {
                        color: #0056b3 !important;
                        text-decoration: underline;
                    }
                    .analysis-tag-label:hover {
                        background-color: #f8f9fa !important;
                    }
                    .status-icon {
                        display: inline-flex;
                        background-color: currentColor;
                        -webkit-mask-size: contain;
                        -webkit-mask-repeat: no-repeat;
                        -webkit-mask-position: center;
                        mask-size: contain;
                        mask-repeat: no-repeat;
                        mask-position: center;
                        flex-shrink: 0;
                    }
                    .status-icon--medium {
                        width: 18px;
                        height: 18px;
                    }
                    .status-icon--large {
                        width: 48px;
                        height: 48px;
                    }
                    .status-icon--success {
                        -webkit-mask-image: url('${checkIconUrl}');
                        mask-image: url('${checkIconUrl}');
                    }
                    .status-icon--warning {
                        -webkit-mask-image: url('${warningIconUrl}');
                        mask-image: url('${warningIconUrl}');
                    }
                    .status-icon--error {
                        -webkit-mask-image: url('${errorIconUrl}');
                        mask-image: url('${errorIconUrl}');
                    }
                </style>
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
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        "><img src="${searchIconUrl}" alt="Search" style="width: 20px; height: 20px;" />ChatGPT Product Info Research</h1>
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
                        flex-direction: row;
                        overflow: hidden;
                    ">
                        <!-- Sidebar Navigation -->
                        <div id="sidebar" style="
                            width: 200px;
                            min-width: 200px;
                            background: #f8f9fa;
                            border-right: 1px solid #e9ecef;
                            display: flex;
                            flex-direction: column;
                            overflow: hidden;
                        ">
                            <div style="
                                padding: 12px 16px;
                                background: #ffffff;
                                border-bottom: 1px solid #e9ecef;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                            ">
                                <h3 style="
                                    margin: 0;
                                    font-size: 14px;
                                    font-weight: 600;
                                    color: #495057;
                                ">Organization</h3>
                                <button id="settings-btn" style="
                                    background: none;
                                    border: none;
                                    color: #6c757d;
                                    font-size: 16px;
                                    width: 24px;
                                    height: 24px;
                                    border-radius: 4px;
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    transition: all 0.2s ease;
                                " title="Settings"><img src="${settingsIconUrl}" alt="Settings" style="width: 18px; height: 18px;" /></button>
                            </div>
                            
                            <div style="
                                flex: 1;
                                overflow-y: auto;
                                padding: 8px;
                            ">
                                <!-- Projects Section -->
                                <div style="margin-bottom: 16px;">
                                    <div style="
                                        display: flex;
                                        justify-content: space-between;
                                        align-items: center;
                                        padding: 4px 8px;
                                        margin-bottom: 4px;
                                    ">
                                        <span style="
                                            font-size: 12px;
                                            font-weight: 600;
                                            color: #6c757d;
                                            text-transform: uppercase;
                                            letter-spacing: 0.5px;
                                        ">Projects</span>
                                        <button id="add-project-btn" style="
                                            background: none;
                                            border: none;
                                            color: #007bff;
                                            font-size: 12px;
                                            cursor: pointer;
                                            padding: 2px 4px;
                                            border-radius: 2px;
                                        " title="Add Project">+</button>
                                    </div>
                                    <div id="projects-list" style="
                                        display: flex;
                                        flex-direction: column;
                                        gap: 2px;
                                    ">
                                        <!-- Projects will be dynamically loaded here -->
                                    </div>
                                </div>
                                
                                <!-- Tags Section -->
                                <div>
                                    <div style="
                                        display: flex;
                                        justify-content: space-between;
                                        align-items: center;
                                        padding: 4px 8px;
                                        margin-bottom: 4px;
                                    ">
                                        <span style="
                                            font-size: 12px;
                                            font-weight: 600;
                                            color: #6c757d;
                                            text-transform: uppercase;
                                            letter-spacing: 0.5px;
                                        ">Tags</span>
                                        <button id="add-tag-btn" style="
                                            background: none;
                                            border: none;
                                            color: #007bff;
                                            font-size: 12px;
                                            cursor: pointer;
                                            padding: 2px 4px;
                                            border-radius: 2px;
                                        " title="Add Tag">+</button>
                                    </div>
                                    <div id="tags-list" style="
                                        display: flex;
                                        flex-direction: column;
                                        gap: 2px;
                                    ">
                                        <!-- Tags will be dynamically loaded here -->
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Main Content Area -->
                    <div style="
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                    ">
                        <!-- Tab Navigation -->
                        <div id="tab-navigation" style="
                            display: flex;
                            background: #f8f9fa;
                            border-bottom: 1px solid #e9ecef;
                        ">
                            <button id="search-tab" class="tab-button active-tab" style="
                                flex: 1;
                                padding: 12px 20px;
                                border: none;
                                background: white;
                                color: #495057;
                                font-size: 14px;
                                font-weight: 500;
                                cursor: pointer;
                                border-bottom: 2px solid #007bff;
                                transition: all 0.2s ease;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 8px;
                            "><img src="${searchIconUrl}" alt="Search" style="width: 20px; height: 20px;" />Search</button>
                            <button id="history-tab" class="tab-button" style="
                                flex: 1;
                                padding: 12px 20px;
                                border: none;
                                background: #f8f9fa;
                                color: #6c757d;
                                font-size: 14px;
                                font-weight: 500;
                                cursor: pointer;
                                border-bottom: 2px solid transparent;
                                transition: all 0.2s ease;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 8px;
                            "><img src="${historyIconUrl}" alt="History" style="width: 20px; height: 20px;" />History</button>
                            <button id="reports-tab" class="tab-button" style="
                                flex: 1;
                                padding: 12px 20px;
                                border: none;
                                background: #f8f9fa;
                                color: #6c757d;
                                font-size: 14px;
                                font-weight: 500;
                                cursor: pointer;
                                border-bottom: 2px solid transparent;
                                transition: all 0.2s ease;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 8px;
                            "><img src="${analysisIconUrl}" alt="Analysis" style="width: 20px; height: 20px;" />Analysis</button>
                        </div>
                        
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
                            <div id="single-product-input" style="display: flex; gap: 12px; margin-bottom: 12px; align-items: center;">
                                <div id="single-input-group" style="flex: 1; display: flex; gap: 12px; align-items: center;">
                                    <input type="text" id="search-query" placeholder="Search query (e.g., iPhone 17, Nike shoes, Pets Deli Hundefutter)" style="
                                        flex: 1;
                                        padding: 8px 12px;
                                        border: 1px solid #dee2e6;
                                        border-radius: 4px;
                                        font-size: 14px;
                                        box-sizing: border-box;
                                        height: 36px;
                                    " />
                                    <div id="market-select-container" style="
                                        display: flex;
                                        align-items: center;
                                        gap: 6px;
                                        border: 1px solid #dee2e6;
                                        border-radius: 4px;
                                        padding: 0 12px;
                                        background: white;
                                        position: relative;
                                        min-width: 120px;
                                        cursor: pointer;
                                        height: 36px;
                                    ">
                                        <img id="market-select-flag" src="" alt="Selected market flag" style="
                                            width: 20px;
                                            height: 14px;
                                            object-fit: cover;
                                            border-radius: 2px;
                                        " />
                                        <span id="market-select-code" style="font-size: 13px; font-weight: 600; color: #495057;">DE</span>
                                        <span style="margin-left: auto; color: #6c757d; font-size: 12px;">▾</span>
                                        <select id="market-select" aria-label="Select language and market" style="
                                            position: absolute;
                                            top: 0;
                                            left: 0;
                                            width: 100%;
                                            height: 100%;
                                            opacity: 0;
                                            cursor: pointer;
                                            border: none;
                                            background: transparent;
                                        "></select>
                                    </div>
                                </div>
                                <button id="search-btn" style="
                                    background: #007bff;
                                    color: white;
                                    border: none;
                                    padding: 0 16px;
                                    border-radius: 4px;
                                    font-size: 14px;
                                    font-weight: 500;
                                    cursor: pointer;
                                    white-space: nowrap;
                                    height: 36px;
                                    display: flex;
                                    align-items: center;
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
                                "></textarea>
                                <div id="multi-product-actions" style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    gap: 12px;
                                    margin-top: 12px;
                                ">
                                    <div style="
                                        font-size: 12px;
                                        color: #6c757d;
                                        font-style: italic;
                                    ">Results will be shown in a table format</div>
                                    <div id="multi-product-controls" style="display: flex; gap: 12px; align-items: center;">
                                        <div id="multi-market-select-mount" style="display: none; align-items: center; gap: 8px;"></div>
                                        <button id="multi-search-btn" style="
                                            background: #007bff;
                                            color: white;
                                            border: none;
                                            padding: 0 16px;
                                            border-radius: 4px;
                                            font-size: 14px;
                                            font-weight: 500;
                                            cursor: pointer;
                                            white-space: nowrap;
                                            height: 36px;
                                            display: flex;
                                            align-items: center;
                                        ">Search All Products</button>
                                    </div>
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
                                <img src="${searchIconUrl}" alt="Search" style="width: 48px; height: 48px; margin-bottom: 20px; opacity: 0.7;" />
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
                                    background: #fff3cd;
                                    color: #856404;
                                    border: 1px solid #ffeeba;
                                    display: inline-flex;
                                    align-items: center;
                                    gap: 8px;
                                "><span class="status-icon status-icon--medium status-icon--warning" aria-hidden="true"></span><span>Checking authentication...</span></div>
                            </div>
                        </div>
                        
                        <!-- History Container -->
                        <div id="history-container" style="
                            flex: 1;
                            overflow-y: auto;
                            padding: 20px;
                            display: none;
                        ">
                            <div id="history-welcome-state" style="
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
                                <img src="${historyIconUrl}" alt="History" style="width: 48px; height: 48px; margin-bottom: 20px; opacity: 0.7;" />
                                <h3 style="
                                    margin: 0 0 12px 0;
                                    font-size: 20px;
                                    font-weight: 600;
                                    color: #495057;
                                ">Search History</h3>
                                <p style="
                                    margin: 0 0 24px 0;
                                    font-size: 16px;
                                    line-height: 1.5;
                                    max-width: 400px;
                                ">Your search history will appear here. Start searching to build your history!</p>
                                <button id="clear-history-btn" style="
                                    background: #dc3545;
                                    color: white;
                                    border: none;
                                    padding: 8px 16px;
                                    border-radius: 4px;
                                    font-size: 14px;
                                    font-weight: 500;
                                    cursor: pointer;
                                    display: none;
                                ">Clear All History</button>
                            </div>
                            <div id="history-content" style="display: none;">
                                <div style="
                                    margin-bottom: 20px;
                                    border-bottom: 1px solid #e9ecef;
                                ">
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding-bottom: 10px;
                                ">
                                    <h3 style="margin: 0; font-size: 18px; color: #495057;">Search History</h3>
                                        <div style="display: flex; gap: 10px; align-items: center;">
                                            <button id="toggle-filters" style="
                                                background: none;
                                                color: #007bff;
                                                border: none;
                                                padding: 6px 8px;
                                            font-size: 13px;
                                                font-weight: 500;
                                                cursor: pointer;
                                                display: flex;
                                                align-items: center;
                                                gap: 6px;
                                                text-decoration: none;
                                            ">
                                                <svg width="16" height="16" viewBox="0 0 90 90" style="fill: currentColor;">
                                                    <path d="M 85.813 59.576 H 55.575 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 30.237 c 1.657 0 3 1.343 3 3 S 87.47 59.576 85.813 59.576 z"/>
                                                    <path d="M 48.302 66.849 c -5.664 0 -10.272 -4.608 -10.272 -10.272 c 0 -5.665 4.608 -10.273 10.272 -10.273 c 5.665 0 10.273 4.608 10.273 10.273 C 58.575 62.24 53.967 66.849 48.302 66.849 z M 48.302 52.303 c -2.356 0 -4.272 1.917 -4.272 4.273 c 0 2.355 1.917 4.272 4.272 4.272 c 2.356 0 4.273 -1.917 4.273 -4.272 C 52.575 54.22 50.658 52.303 48.302 52.303 z"/>
                                                    <path d="M 41.029 59.576 H 4.188 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 36.842 c 1.657 0 3 1.343 3 3 S 42.686 59.576 41.029 59.576 z"/>
                                                    <path d="M 85.813 36.424 h -57.79 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 57.79 c 1.657 0 3 1.343 3 3 S 87.47 36.424 85.813 36.424 z"/>
                                                    <path d="M 20.75 43.697 c -5.665 0 -10.273 -4.608 -10.273 -10.273 s 4.608 -10.273 10.273 -10.273 s 10.273 4.608 10.273 10.273 S 26.414 43.697 20.75 43.697 z M 20.75 29.151 c -2.356 0 -4.273 1.917 -4.273 4.273 s 1.917 4.273 4.273 4.273 s 4.273 -1.917 4.273 -4.273 S 23.105 29.151 20.75 29.151 z"/>
                                                    <path d="M 13.477 36.424 H 4.188 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 9.289 c 1.657 0 3 1.343 3 3 S 15.133 36.424 13.477 36.424 z"/>
                                                    <path d="M 57.637 13.273 H 4.188 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 53.449 c 1.657 0 3 1.343 3 3 S 59.294 13.273 57.637 13.273 z"/>
                                                    <path d="M 64.909 20.546 c -5.664 0 -10.272 -4.608 -10.272 -10.273 S 59.245 0 64.909 0 c 5.665 0 10.273 4.608 10.273 10.273 S 70.574 20.546 64.909 20.546 z M 64.909 6 c -2.355 0 -4.272 1.917 -4.272 4.273 s 1.917 4.273 4.272 4.273 c 2.356 0 4.273 -1.917 4.273 -4.273 S 67.266 6 64.909 6 z"/>
                                                    <path d="M 85.813 13.273 h -13.63 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 13.63 c 1.657 0 3 1.343 3 3 S 87.47 13.273 85.813 13.273 z"/>
                                                    <path d="M 85.813 82.728 h -57.79 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 57.79 c 1.657 0 3 1.343 3 3 S 87.47 82.728 85.813 82.728 z"/>
                                                    <path d="M 20.75 90 c -5.665 0 -10.273 -4.608 -10.273 -10.272 c 0 -5.665 4.608 -10.273 10.273 -10.273 s 10.273 4.608 10.273 10.273 C 31.022 85.392 26.414 90 20.75 90 z M 20.75 75.454 c -2.356 0 -4.273 1.917 -4.273 4.273 c 0 2.355 1.917 4.272 4.273 4.272 s 4.273 -1.917 4.273 -4.272 C 25.022 77.371 23.105 75.454 20.75 75.454 z"/>
                                                    <path d="M 13.477 82.728 H 4.188 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 9.289 c 1.657 0 3 1.343 3 3 S 15.133 82.728 13.477 82.728 z"/>
                                                </svg>
                                                <span id="filter-toggle-text">Filters</span>
                                            </button>
                                        <button id="clear-history-btn-header" style="
                                            background: #dc3545;
                                            color: white;
                                            border: none;
                                            padding: 6px 12px;
                                            border-radius: 4px;
                                            font-size: 13px;
                                            font-weight: 500;
                                            cursor: pointer;
                                            ">Clear History</button>
                                        </div>
                                    </div>
                                    
                                    <!-- Advanced Filter Panel -->
                                    <div id="filter-panel" style="
                                        display: none;
                                        background: #f8f9fa;
                                        border: 1px solid #e9ecef;
                                        border-radius: 8px;
                                        padding: 16px;
                                        margin-bottom: 16px;
                                    ">
                                        <div style="
                                            display: grid;
                                            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                                            gap: 16px;
                                            margin-bottom: 12px;
                                        ">
                                            <div>
                                                <label style="
                                                    display: block;
                                                    font-size: 12px;
                                                    font-weight: 600;
                                                    color: #6c757d;
                                                    margin-bottom: 6px;
                                                ">Search Text</label>
                                                <input type="text" id="filter-text" placeholder="Search in queries and results..." style="
                                                    width: 100%;
                                                    padding: 8px 12px;
                                                    border: 1px solid #dee2e6;
                                                    border-radius: 4px;
                                                    font-size: 13px;
                                                    box-sizing: border-box;
                                                " />
                                            </div>
                                            
                                            <div>
                                                <label style="
                                                    display: block;
                                                    font-size: 12px;
                                                    font-weight: 600;
                                                    color: #6c757d;
                                                    margin-bottom: 6px;
                                                ">Project</label>
                                                <select id="filter-project" style="
                                                    width: 100%;
                                                    padding: 8px 12px;
                                                    border: 1px solid #dee2e6;
                                                    border-radius: 4px;
                                                    font-size: 13px;
                                                    background: white;
                                                    box-sizing: border-box;
                                                ">
                                                    <option value="">All Projects</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label style="
                                                    display: block;
                                                    font-size: 12px;
                                                    font-weight: 600;
                                                    color: #6c757d;
                                                    margin-bottom: 6px;
                                                ">Market</label>
                                                <select id="filter-market" style="
                                                    width: 100%;
                                                    padding: 8px 12px;
                                                    border: 1px solid #dee2e6;
                                                    border-radius: 4px;
                                                    font-size: 13px;
                                                    background: white;
                                                    box-sizing: border-box;
                                                ">
                                                    <option value="all">All Markets</option>
                                                </select>
                                            </div>
                                        </div>
                                        
                                        <div style="margin-bottom: 12px;">
                                            <label style="
                                                display: block;
                                                font-size: 12px;
                                                font-weight: 600;
                                                color: #6c757d;
                                                margin-bottom: 6px;
                                            ">Tags</label>
                                            <div id="filter-tags" style="
                                                min-height: 32px;
                                                max-height: 80px;
                                                overflow-y: auto;
                                                border: 1px solid #dee2e6;
                                                border-radius: 4px;
                                                padding: 8px;
                                                background: white;
                                                display: flex;
                                                flex-wrap: wrap;
                                                gap: 6px;
                                                align-items: flex-start;
                                            ">
                                                <!-- Tag checkboxes will be populated here -->
                                            </div>
                                        </div>
                                        
                                        <div style="
                                            display: flex;
                                            justify-content: space-between;
                                            align-items: center;
                                            padding-top: 8px;
                                            border-top: 1px solid #e9ecef;
                                        ">
                                            <div id="filter-summary" style="
                                                font-size: 12px;
                                                color: #6c757d;
                                            ">
                                                No filters applied
                                            </div>
                                            <div style="display: flex; gap: 8px;">
                                                <button id="clear-filters" style="
                                                    background: #6c757d;
                                                    color: white;
                                                    border: none;
                                                    padding: 6px 12px;
                                                    border-radius: 4px;
                                                    font-size: 12px;
                                                    cursor: pointer;
                                                ">Clear Filters</button>
                                                <button id="apply-filters" style="
                                                    background: #28a745;
                                                    color: white;
                                                    border: none;
                                                    padding: 6px 12px;
                                                    border-radius: 4px;
                                                    font-size: 12px;
                                                    cursor: pointer;
                                                ">Apply</button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Active Filters Display -->
                                    <div id="active-filters" style="
                                        display: none;
                                        margin-bottom: 12px;
                                        padding: 8px 0;
                                    ">
                                        <div style="
                                            font-size: 12px;
                                            font-weight: 600;
                                            color: #6c757d;
                                            margin-bottom: 6px;
                                        ">Active Filters:</div>
                                        <div id="filter-chips" style="
                                            display: flex;
                                            flex-wrap: wrap;
                                            gap: 6px;
                                        ">
                                            <!-- Filter chips will be populated here -->
                                        </div>
                                    </div>
                                </div>
                                <div id="history-list"></div>
                            </div>
                        </div>
                        
                        <!-- Reports Container -->
                        <div id="reports-container" style="
                            flex: 1;
                            overflow-y: auto;
                            padding: 20px;
                            display: none;
                        ">
                            <div id="reports-welcome-state" style="
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
                                <img src="${analysisIconUrl}" alt="Analysis" style="width: 20px; height: 20px; margin-bottom: 20px; opacity: 0.7;" />
                                <h3 style="
                                    margin: 0 0 12px 0;
                                    font-size: 20px;
                                    font-weight: 600;
                                    color: #495057;
                                ">Cross-Search Analysis</h3>
                                <p style="
                                    margin: 0 0 24px 0;
                                    font-size: 16px;
                                    line-height: 1.5;
                                    max-width: 400px;
                                ">No search history available. Start searching to see analysis results here.</p>
                            </div>
                            <div id="analysis-content" style="display: none;">
                                <div style="
                                    margin-bottom: 20px;
                                    border-bottom: 1px solid #e9ecef;
                                ">
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding-bottom: 10px;
                                ">
                                    <h4 style="margin: 0; font-size: 16px; color: #495057;">Analysis Results</h4>
                                    <div style="display: flex; gap: 8px;">
                                        <button id="toggle-analysis-filters" style="
                                            background: none;
                                            color: #007bff;
                                            border: none;
                                            padding: 6px 12px;
                                            border-radius: 4px;
                                            font-size: 13px;
                                            font-weight: 500;
                                            cursor: pointer;
                                            transition: background-color 0.2s;
                                            display: flex;
                                            align-items: center;
                                            gap: 6px;
                                        ">
                                            <svg width="16" height="16" viewBox="0 0 90 90" style="fill: currentColor;">
                                                <path d="M 85.813 59.576 H 55.575 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 30.237 c 1.657 0 3 1.343 3 3 S 87.47 59.576 85.813 59.576 z"/>
                                                <path d="M 48.302 66.849 c -5.664 0 -10.272 -4.608 -10.272 -10.272 c 0 -5.665 4.608 -10.273 10.272 -10.273 c 5.665 0 10.273 4.608 10.273 10.273 C 58.575 62.24 53.967 66.849 48.302 66.849 z M 48.302 52.303 c -2.356 0 -4.272 1.917 -4.272 4.273 c 0 2.355 1.917 4.272 4.272 4.272 c 2.356 0 4.273 -1.917 4.273 -4.272 C 52.575 54.22 50.658 52.303 48.302 52.303 z"/>
                                                <path d="M 41.029 59.576 H 4.188 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 36.842 c 1.657 0 3 1.343 3 3 S 42.686 59.576 41.029 59.576 z"/>
                                                <path d="M 85.813 36.424 h -57.79 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 57.79 c 1.657 0 3 1.343 3 3 S 87.47 36.424 85.813 36.424 z"/>
                                                <path d="M 20.75 43.697 c -5.665 0 -10.273 -4.608 -10.273 -10.273 s 4.608 -10.273 10.273 -10.273 s 10.273 4.608 10.273 10.273 S 26.414 43.697 20.75 43.697 z M 20.75 29.151 c -2.356 0 -4.273 1.917 -4.273 4.273 s 1.917 4.273 4.273 4.273 s 4.273 -1.917 4.273 -4.273 S 23.105 29.151 20.75 29.151 z"/>
                                                <path d="M 13.477 36.424 H 4.188 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 9.289 c 1.657 0 3 1.343 3 3 S 15.133 36.424 13.477 36.424 z"/>
                                                <path d="M 57.637 13.273 H 4.188 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 53.449 c 1.657 0 3 1.343 3 3 S 59.294 13.273 57.637 13.273 z"/>
                                                <path d="M 64.909 20.546 c -5.664 0 -10.272 -4.608 -10.272 -10.273 S 59.245 0 64.909 0 c 5.665 0 10.273 4.608 10.273 10.273 S 70.574 20.546 64.909 20.546 z M 64.909 6 c -2.355 0 -4.272 1.917 -4.272 4.273 s 1.917 4.273 4.272 4.273 c 2.356 0 4.273 -1.917 4.273 -4.273 S 67.266 6 64.909 6 z"/>
                                                <path d="M 85.813 13.273 h -13.63 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 13.63 c 1.657 0 3 1.343 3 3 S 87.47 13.273 85.813 13.273 z"/>
                                                <path d="M 85.813 82.728 h -57.79 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 57.79 c 1.657 0 3 1.343 3 3 S 87.47 82.728 85.813 82.728 z"/>
                                                <path d="M 20.75 90 c -5.665 0 -10.273 -4.608 -10.273 -10.272 c 0 -5.665 4.608 -10.273 10.273 -10.273 s 10.273 4.608 10.273 10.273 C 31.022 85.392 26.414 90 20.75 90 z M 20.75 75.454 c -2.356 0 -4.273 1.917 -4.273 4.273 c 0 2.355 1.917 4.272 4.273 4.272 s 4.273 -1.917 4.273 -4.272 C 25.022 77.371 23.105 75.454 20.75 75.454 z"/>
                                                <path d="M 13.477 82.728 H 4.188 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 9.289 c 1.657 0 3 1.343 3 3 S 15.133 82.728 13.477 82.728 z"/>
                                            </svg>
                                            <span id="analysis-filter-toggle-text">Filters</span>
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Advanced Filter Panel -->
                                <div id="analysis-filter-panel" style="
                                    display: none;
                                    background: #f8f9fa;
                                    border: 1px solid #e9ecef;
                                    border-radius: 8px;
                                    padding: 16px;
                                    margin-bottom: 16px;
                                ">
                                    <div style="
                                        display: grid;
                                        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                                        gap: 16px;
                                        margin-bottom: 12px;
                                    ">
                                        <div>
                                            <label style="
                                                display: block;
                                                font-size: 12px;
                                                font-weight: 600;
                                                color: #6c757d;
                                                margin-bottom: 4px;
                                            ">Filter by Project</label>
                                            <select id="analysis-project-filter" style="
                                                width: 100%;
                                                padding: 8px 12px;
                                                border: 1px solid #dee2e6;
                                                border-radius: 4px;
                                                font-size: 14px;
                                                background: white;
                                            ">
                                                <option value="">All Projects</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style="
                                                display: block;
                                                font-size: 12px;
                                                font-weight: 600;
                                                color: #6c757d;
                                                margin-bottom: 4px;
                                            ">Filter by Market</label>
                                            <select id="analysis-market-filter" style="
                                                width: 100%;
                                                padding: 8px 12px;
                                                border: 1px solid #dee2e6;
                                                border-radius: 4px;
                                                font-size: 14px;
                                                background: white;
                                            ">
                                                <option value="all">All Markets</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style="
                                                display: block;
                                                font-size: 12px;
                                                font-weight: 600;
                                                color: #6c757d;
                                                margin-bottom: 4px;
                                            ">Filter by Tags</label>
                                            <div id="analysis-tags-filter" style="
                                                min-height: 32px;
                                                max-height: 80px;
                                                overflow-y: auto;
                                                border: 1px solid #dee2e6;
                                                border-radius: 4px;
                                                padding: 8px;
                                                background: white;
                                                display: flex;
                                                flex-wrap: wrap;
                                                gap: 6px;
                                                align-items: center;
                                            ">
                                                <!-- Tags populated dynamically -->
                                            </div>
                                        </div>
                                    </div>
                                    <div style="
                                        display: flex;
                                        justify-content: space-between;
                                        align-items: center;
                                    ">
                                        <div id="analysis-filter-summary" style="
                                            font-size: 13px;
                                            color: #6c757d;
                                        ">No filters applied</div>
                                        <div style="display: flex; gap: 8px;">
                                            <button id="clear-analysis-filters" style="
                                                background: #6c757d;
                                                color: white;
                                                border: none;
                                                border-radius: 4px;
                                                padding: 6px 12px;
                                                font-size: 12px;
                                                cursor: pointer;
                                            ">Clear</button>
                                            <button id="apply-analysis-filters" style="
                                                background: #28a745;
                                                color: white;
                                                border: none;
                                                border-radius: 4px;
                                                padding: 6px 12px;
                                                font-size: 12px;
                                                cursor: pointer;
                                            ">Apply</button>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Active Filters Display -->
                                <div id="analysis-active-filters" style="
                                    display: none;
                                    margin-bottom: 12px;
                                    padding: 8px 0;
                                ">
                                    <div style="
                                        font-size: 12px;
                                        font-weight: 600;
                                        color: #6c757d;
                                        margin-bottom: 6px;
                                    ">Active Filters:</div>
                                    <div id="analysis-filter-chips" style="
                                        display: flex;
                                        flex-wrap: wrap;
                                        gap: 6px;
                                    ">
                                        <!-- Filter chips will be populated here -->
                                    </div>
                                </div>
                            </div>

                                <!-- Analysis Results -->
                                <div id="analysis-results">
                                <div style="
                                    display: grid;
                                    grid-template-columns: 1fr 1fr;
                                    gap: 32px;
                                        margin-bottom: 32px;
                                    max-width: 1200px;
                                        margin: 0 auto 32px auto;
                                    justify-content: center;
                                ">
                                    <div id="citation-sources-table"></div>
                                    <div id="review-sources-table"></div>
                                    </div>
                                    
                                    <!-- Sentiment Analysis Section -->
                                    <div id="sentiment-analysis-section" style="
                                        max-width: 600px;
                                        margin: 0 auto;
                                        background: white;
                                        border: 1px solid #e9ecef;
                                        border-radius: 8px;
                                        padding: 20px;
                                    ">
                                        <h3 style="
                                            margin: 0 0 16px 0;
                                            font-size: 16px;
                                            font-weight: 600;
                                            color: #495057;
                                        ">Sentiment Analysis</h3>
                                        <div id="sentiment-content">
                                            <!-- Populated by analysis -->
                                        </div>
                                    </div>
                                </div>
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
                        font-size: 14px;
                        z-index: 10001;
                        display: flex;
                        justify-content: center;
                    ">
                        <div style="display: inline-flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap;">
                            <span>Created by <a href="https://www.martinaberastegue.com/" target="_blank" rel="noopener noreferrer"><strong>Martin Aberastegue</strong></a></span>
                            <span style="display: inline-flex; align-items: center; gap: 10px;">
                                <a href="https://www.linkedin.com/in/aberastegue/" target="_blank" rel="noopener noreferrer" aria-label="Martin Aberastegue on LinkedIn">
                                    <img src="${linkedinIconUrl}" alt="LinkedIn logo" style="width: 18px; height: 18px; display: block;" />
                                </a>
                                <a href="https://github.com/Xyborg" target="_blank" rel="noopener noreferrer" aria-label="Martin Aberastegue on GitHub">
                                    <img src="${githubIconUrl}" alt="GitHub logo" style="width: 18px; height: 18px; display: block;" />
                                </a>
                                <a href="https://x.com/Xyborg" target="_blank" rel="noopener noreferrer" aria-label="Martin Aberastegue on X">
                                    <img src="${xIconUrl}" alt="X logo" style="width: 18px; height: 18px; display: block;" />
                                </a>
                            </span>
                        </div>
                    </div>
                        </div> <!-- End Main Content Area -->
                    </div> <!-- End Sidebar + Content Container -->
                </div>
            </div>
        `;

        const ACCEPT_LANGUAGE_FALLBACK = 'en;q=0.8, es-AR;q=0.7, es;q=0.6, it;q=0.4, zh-CN;q=0.3, zh;q=0.2, id;q=0.1, pt-BR;q=0.1, pt;q=0.1, fr;q=0.1, tr;q=0.1, pl;q=0.1, sv;q=0.1, ru;q=0.1, ar;q=0.1, el;q=0.1';
        const MARKET_OPTIONS = [
            { value: 'de-DE', label: 'German/Germany', code: 'DE', acceptLanguagePrefix: 'de-DE, de;q=0.9', oaiLanguage: 'de-DE', icon: 'assets/flags/de.svg' },
            { value: 'de-CH', label: 'German/Switzerland', code: 'CH', acceptLanguagePrefix: 'de-CH, de;q=0.9', oaiLanguage: 'de-CH', icon: 'assets/flags/ch.svg' },
            { value: 'de-AT', label: 'German/Austria', code: 'AT', acceptLanguagePrefix: 'de-AT, de;q=0.9', oaiLanguage: 'de-AT', icon: 'assets/flags/at.svg' },
            { value: 'en-US', label: 'English/US', code: 'US', acceptLanguagePrefix: 'en-US, en;q=0.9', oaiLanguage: 'en-US', icon: 'assets/flags/us.svg' },
            { value: 'en-GB', label: 'English/UK', code: 'UK', acceptLanguagePrefix: 'en-GB, en;q=0.9', oaiLanguage: 'en-GB', icon: 'assets/flags/gb.svg' },
            { value: 'nl-NL', label: 'Dutch/Netherlands', code: 'NL', acceptLanguagePrefix: 'nl-NL, nl;q=0.9', oaiLanguage: 'nl-NL', icon: 'assets/flags/nl.svg' },
            { value: 'nl-BE', label: 'Dutch/BE', code: 'BE/NL', acceptLanguagePrefix: 'nl-BE, nl;q=0.9', oaiLanguage: 'nl-BE', icon: 'assets/flags/be.svg' },
            { value: 'fr-BE', label: 'French/BE', code: 'BE/FR', acceptLanguagePrefix: 'fr-BE, fr;q=0.9', oaiLanguage: 'fr-BE', icon: 'assets/flags/be.svg' },
            { value: 'de-BE', label: 'German/BE', code: 'BE/DE', acceptLanguagePrefix: 'de-BE, de;q=0.9', oaiLanguage: 'de-BE', icon: 'assets/flags/be.svg' },
            { value: 'es-ES', label: 'Spanish/ES', code: 'ES', acceptLanguagePrefix: 'es-ES, es;q=0.9', oaiLanguage: 'es-ES', icon: 'assets/flags/es.svg' }
        ];

        function getMarketOption(value) {
            const match = MARKET_OPTIONS.find(option => option.value === value);
            return match || MARKET_OPTIONS[0];
        }

        function buildAcceptLanguage(option) {
            const prefixParts = option.acceptLanguagePrefix.split(',').map(part => part.trim().toLowerCase());
            const fallbackParts = ACCEPT_LANGUAGE_FALLBACK.split(',').map(part => part.trim());
            const filteredFallback = fallbackParts.filter(part => !prefixParts.includes(part.toLowerCase()));
            return [option.acceptLanguagePrefix, filteredFallback.join(', ')].filter(Boolean).join(', ');
        }

        function updateMarketSelectorDisplay(value) {
            const option = getMarketOption(value);
            const flagEl = document.getElementById('market-select-flag');
            const codeEl = document.getElementById('market-select-code');
            const container = document.getElementById('market-select-container');
            if (flagEl) {
                flagEl.src = chrome.runtime.getURL(option.icon);
                flagEl.alt = `${option.label} flag`;
            }
            if (codeEl) {
                codeEl.textContent = option.code;
            }
            if (container) {
                container.title = option.label;
            }

            updateAnalysisFilterSummary();
            updateAnalysisFilterChips();
        }

        function setMarketSelection(value) {
            const option = getMarketOption(value);
            const marketSelect = document.getElementById('market-select');
            if (marketSelect) {
                marketSelect.value = option.value;
            }
            localStorage.setItem('chatgpt-product-search-market', option.value);
            updateMarketSelectorDisplay(option.value);
            return option;
        }

        function getSelectedMarketSettings() {
            const marketSelect = document.getElementById('market-select');
            const storedValue = localStorage.getItem('chatgpt-product-search-market');
            const selectedValue = marketSelect ? marketSelect.value : storedValue;
            const option = getMarketOption(selectedValue);
            return {
                ...option,
                acceptLanguage: buildAcceptLanguage(option)
            };
        }

        function moveMarketSelector(isMultiMode) {
            const marketSelectContainer = document.getElementById('market-select-container');
            const singleInputGroup = document.getElementById('single-input-group');
            const multiMarketMount = document.getElementById('multi-market-select-mount');
            if (!marketSelectContainer) {
                return;
            }

            if (isMultiMode) {
                if (multiMarketMount) {
                    multiMarketMount.style.display = 'flex';
                    multiMarketMount.appendChild(marketSelectContainer);
                }
            } else {
                if (singleInputGroup) {
                    singleInputGroup.appendChild(marketSelectContainer);
                }
                if (multiMarketMount) {
                    multiMarketMount.style.display = 'none';
                }
            }
        }

        function renderMarketBadge(marketValue, marketCode, marketLabel) {
            if (!marketValue) {
                return '';
            }
            const option = getMarketOption(marketValue);
            if (!option) {
                return '';
            }
            const codeText = marketCode || option.code;
            const labelText = marketLabel || option.label;
            const flagUrl = chrome.runtime.getURL(option.icon);
            return '<span style="display:inline-flex;align-items:center;gap:4px;"><img src="' + flagUrl + '" alt="' + labelText + ' flag" style="width:16px;height:12px;object-fit:cover;border-radius:2px;" /><span>' + codeText + '</span></span>';
        }

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
            const marketSelect = document.getElementById('market-select');
            const marketSelectContainer = document.getElementById('market-select-container');
            const multiMarketMount = document.getElementById('multi-market-select-mount');
            const singleInputGroup = document.getElementById('single-input-group');
            const collapseToggle = document.getElementById('collapse-toggle');
            const collapseText = document.getElementById('collapse-text');
            const searchControls = document.getElementById('search-controls');

            if (marketSelect) {
                marketSelect.innerHTML = '';
                MARKET_OPTIONS.forEach(option => {
                    const optionEl = document.createElement('option');
                    optionEl.value = option.value;
                    optionEl.textContent = `${option.label}`;
                    marketSelect.appendChild(optionEl);
                });
                const savedValue = localStorage.getItem('chatgpt-product-search-market') || MARKET_OPTIONS[0].value;
                setMarketSelection(savedValue);
                marketSelect.addEventListener('change', () => {
                    setMarketSelection(marketSelect.value);
                });
            } else {
                const savedValue = localStorage.getItem('chatgpt-product-search-market') || MARKET_OPTIONS[0].value;
                setMarketSelection(savedValue);
            }

            if (marketSelectContainer) {
                marketSelectContainer.style.height = '36px';
            }

            moveMarketSelector(multiProductToggle ? multiProductToggle.checked : false);

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

                moveMarketSelector(isMultiMode);
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

            // Tab switching functionality
            const searchTab = document.getElementById('search-tab');
            const historyTab = document.getElementById('history-tab');
            const reportsTab = document.getElementById('reports-tab');
            const searchArea = document.getElementById('search-area');
            const resultsContainerTab = document.getElementById('results-container');
            const historyContainer = document.getElementById('history-container');
            const reportsContainer = document.getElementById('reports-container');

            searchTab.addEventListener('click', () => {
                switchTab('search');
                // Hide reports container and reset reports tab
                const reportsContainer = document.getElementById('reports-container');
                if (reportsContainer) reportsContainer.style.display = 'none';
                if (reportsTab) {
                    reportsTab.style.background = '#f8f9fa';
                    reportsTab.style.color = '#6c757d';
                    reportsTab.style.borderBottom = '2px solid transparent';
                    reportsTab.classList.remove('active-tab');
                }
            });

            historyTab.addEventListener('click', () => {
                switchTab('history');
                syncHistoryFiltersWithAnalysisFilters();
                loadHistory();
                // Hide reports container and reset reports tab
                const reportsContainer = document.getElementById('reports-container');
                if (reportsContainer) reportsContainer.style.display = 'none';
                if (reportsTab) {
                    reportsTab.style.background = '#f8f9fa';
                    reportsTab.style.color = '#6c757d';
                    reportsTab.style.borderBottom = '2px solid transparent';
                    reportsTab.classList.remove('active-tab');
                }
            });

            reportsTab.addEventListener('click', () => {
                // Reset all tabs first
                [searchTab, historyTab, reportsTab].forEach(t => {
                    if (t) {
                        t.style.background = '#f8f9fa';
                        t.style.color = '#6c757d';
                        t.style.borderBottom = '2px solid transparent';
                        t.classList.remove('active-tab');
                    }
                });
                
                // Set reports tab as active
                reportsTab.style.background = 'white';
                reportsTab.style.color = '#495057';
                reportsTab.style.borderBottom = '2px solid #007bff';
                reportsTab.classList.add('active-tab');
                
                // Hide all containers
                const searchArea = document.getElementById('search-area');
                const resultsContainer = document.getElementById('results-container');
                const historyContainer = document.getElementById('history-container');
                const reportsContainer = document.getElementById('reports-container');
                
                if (searchArea) searchArea.style.display = 'none';
                if (resultsContainer) resultsContainer.style.display = 'none';
                if (historyContainer) historyContainer.style.display = 'none';
                
                // Show reports container
                if (reportsContainer) {
                    reportsContainer.style.display = 'block';
                } else {
                }
                
                // Initialize the Analysis Dashboard
                initializeAnalysisDashboard();
            });

            // History functionality
            const clearHistoryBtn = document.getElementById('clear-history-btn');
            const clearHistoryBtnHeader = document.getElementById('clear-history-btn-header');
            const historySearch = document.getElementById('history-search');

            if (clearHistoryBtn) {
                clearHistoryBtn.addEventListener('click', clearAllHistory);
            }
            if (clearHistoryBtnHeader) {
                clearHistoryBtnHeader.addEventListener('click', clearAllHistory);
            }
            if (historySearch) {
                historySearch.addEventListener('input', filterHistory);
            }

            // Initialize token status
            initializeTokenStatus();
            
            // Initialize sidebar (Phase 2)
            initializeSidebar();
            
            // Recalculate counts to ensure consistency
            recalculateAllCounts();
        }

        // Helper to read active tab id: 'search' | 'history' | 'reports'
        function getActiveTab() {
            const active = document.querySelector('#tab-navigation .active-tab');
            return active?.id?.replace('-tab', '') || 'search';
        }

        function switchTab(tab) {
            const searchTab = document.getElementById('search-tab');
            const historyTab = document.getElementById('history-tab');
            const reportsTab = document.getElementById('reports-tab');
            const searchArea = document.getElementById('search-area');
            const resultsContainer = document.getElementById('results-container');
            const historyContainer = document.getElementById('history-container');
            const reportsContainer = document.getElementById('reports-container');

            // Reset all tabs
            [searchTab, historyTab, reportsTab].forEach(t => {
                if (t) {
                    t.style.background = '#f8f9fa';
                    t.style.color = '#6c757d';
                    t.style.borderBottom = '2px solid transparent';
                    t.classList.remove('active-tab');
                }
            });

            // Hide all containers explicitly and aggressively
            
            // Hide all containers cleanly
            if (searchArea) {
                searchArea.style.display = 'none';
            }
            if (resultsContainer) {
                resultsContainer.style.display = 'none';
            }
            if (historyContainer) {
                historyContainer.style.display = 'none';
            }
            if (reportsContainer) {
                reportsContainer.style.display = 'none';
            }
            
            // Reset all internal content states
            const analysisContent = document.getElementById('analysis-content');
            const reportsWelcomeState = document.getElementById('reports-welcome-state');
            const historyContent = document.getElementById('history-content');
            const historyWelcomeState = document.getElementById('history-welcome-state');
            
            if (analysisContent) {
                analysisContent.style.display = 'none';
            }
            if (reportsWelcomeState) {
                reportsWelcomeState.style.display = 'none';
            }
            if (historyContent) {
                historyContent.style.display = 'none';
            }
            if (historyWelcomeState) {
                historyWelcomeState.style.display = 'none';
            }
            
            // Clean up any organization interfaces when switching tabs
            const postSearchInterface = document.getElementById('post-search-tagging');
            const editInterface = document.getElementById('edit-organization-interface');
            if (postSearchInterface) {
                postSearchInterface.remove();
            }
            if (editInterface) {
                editInterface.remove();
            }

            if (tab === 'search') {
                searchTab.style.background = 'white';
                searchTab.style.color = '#495057';
                searchTab.style.borderBottom = '2px solid #007bff';
                searchTab.classList.add('active-tab');

                if (searchArea) searchArea.style.display = 'block';
                if (resultsContainer) {
                    resultsContainer.style.display = 'none';
                    resultsContainer.innerHTML = '';
                }
                if (typeof resetToCleanSearchState === 'function') {
                    resetToCleanSearchState();
                }
            } else if (tab === 'history') {
                historyTab.style.background = 'white';
                historyTab.style.color = '#495057';
                historyTab.style.borderBottom = '2px solid #007bff';
                historyTab.classList.add('active-tab');
                
                // CRITICAL: Completely hide and clear analysis content when switching to history
                if (reportsContainer) {
                    reportsContainer.style.display = 'none';
                    
                    // Clear all analysis content from the DOM
                    const analysisContent = reportsContainer.querySelector('#analysis-content');
                    if (analysisContent) {
                        analysisContent.style.display = 'none';
                    }
                }

                // Also ensure no analysis content exists anywhere else
                const globalAnalysisContent = document.getElementById('analysis-content');
                const globalAnalysisResults = document.getElementById('analysis-results');
                const globalCitationTable = document.getElementById('citation-sources-table');
                const globalReviewTable = document.getElementById('review-sources-table');

                if (globalAnalysisContent) {
                    globalAnalysisContent.style.display = 'none';
                }
                if (globalAnalysisResults) {
                    globalAnalysisResults.style.display = 'none';
                }
                if (globalCitationTable) {
                    globalCitationTable.style.display = 'none';
                }
                if (globalReviewTable) {
                    globalReviewTable.style.display = 'none';
                }
                
                if (historyContainer) {
                    historyContainer.style.display = 'block';
                    historyContainer.style.visibility = 'visible';

                    // Restore visibility that reports tab may have hidden
                    ['history-content', 'history-welcome-state', 'history-list'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) {
                            el.style.visibility = 'visible';
                        }
                    });
                }
            } else if (tab === 'reports') {
                reportsTab.style.background = 'white';
                reportsTab.style.color = '#495057';
                reportsTab.style.borderBottom = '2px solid #007bff';
                reportsTab.classList.add('active-tab');
                
                // CRITICAL: Completely hide and clear history content when switching to reports
                if (historyContainer) {
                    historyContainer.style.display = 'none';
                    
                    // Clear all history content from the DOM
                    const historyContent = historyContainer.querySelector('#history-content');
                    const historyList = historyContainer.querySelector('#history-list');
                    if (historyContent) {
                        historyContent.style.display = 'none';
                    }
                    if (historyList) {
                        historyList.style.display = 'none';
                    }
                }
                
                if (reportsContainer) {
                    reportsContainer.style.display = 'block';
                    reportsContainer.style.visibility = 'visible';
                    reportsContainer.style.removeProperty('visibility');

                    // Restore visibility for analysis sections that may have been hidden
                    ['analysis-content', 'analysis-results', 'citation-sources-table', 'review-sources-table']
                        .forEach(id => {
                            const el = document.getElementById(id);
                            if (el) {
                                if (el.style.display === 'none') {
                                    el.style.display = 'block';
                                }
                                el.style.visibility = 'visible';
                                el.style.removeProperty('visibility');
                            }
                        });

                    // Ensure scrollable analysis containers remain scrollable after tab switches
                    const scrollTargets = [
                        reportsContainer,
                        document.getElementById('analysis-results'),
                        document.getElementById('analysis-content'),
                        document.querySelector('#analysis-content .analysis-scroll-area')
                    ];
                    scrollTargets.forEach(target => {
                        if (target) {
                            target.style.overflowY = 'auto';
                        }
                    });

                    // Initialize analysis dashboard when switching to reports
                    initializeAnalysisDashboard();
                } else {
                }
            }
        }

        // ===== ANALYSIS DASHBOARD FUNCTIONALITY - Phase 6 =====
        
        function initializeAnalysisDashboard() {
            
            // Allow analysis dashboard to initialize when called
            
            const history = loadSearchHistory();
            const reportsWelcomeState = document.getElementById('reports-welcome-state');
            const analysisContent = document.getElementById('analysis-content');

            if (history.length === 0) {
                if (reportsWelcomeState) reportsWelcomeState.style.display = 'flex';
                if (analysisContent) analysisContent.style.display = 'none';
                return;
            }

            // Show analysis content immediately and setup interface
            if (reportsWelcomeState) {
                reportsWelcomeState.style.display = 'none';
                reportsWelcomeState.style.visibility = 'hidden';
            }
            if (analysisContent) {
                analysisContent.style.display = 'block';
                analysisContent.style.visibility = 'visible';
                analysisContent.style.removeProperty('visibility');
                
                // Also ensure analysis results are visible
                const analysisResults = document.getElementById('analysis-results');
                const citationTable = document.getElementById('citation-sources-table');
                const reviewTable = document.getElementById('review-sources-table');
                
                if (analysisResults) {
                    analysisResults.style.display = 'block';
                    analysisResults.style.visibility = 'visible';
                    analysisResults.style.removeProperty('visibility');
                }
                if (citationTable) {
                    citationTable.style.display = 'block';
                    citationTable.style.visibility = 'visible';
                    citationTable.style.removeProperty('visibility');
                }
                if (reviewTable) {
                    reviewTable.style.display = 'block';
                    reviewTable.style.visibility = 'visible';
                    reviewTable.style.removeProperty('visibility');
                }
            }
            
            // Clean up any existing event listeners and reset state
            cleanupAnalysisInterface();
            resetAnalysisFilterPanelState();
            
            // Setup analysis interface and generate initial analysis
            setupAnalysisInterface();
            initializeAnalysisFilters();
            syncAnalysisFiltersWithHistoryFilters();
            if (typeof applyAnalysisFilters === 'function') {
                applyAnalysisFilters();
            } else {
                generateAnalysisReports();
            }
        }
        
        function cleanupAnalysisInterface() {
            // Remove existing event listeners to prevent duplicates
            const toggleFiltersBtn = document.getElementById('toggle-analysis-filters');
            const clearFiltersBtn = document.getElementById('clear-analysis-filters');
            const applyFiltersBtn = document.getElementById('apply-analysis-filters');
            
            if (toggleFiltersBtn) {
                // Clone the element to remove all event listeners
                const newToggleBtn = toggleFiltersBtn.cloneNode(true);
                toggleFiltersBtn.parentNode.replaceChild(newToggleBtn, toggleFiltersBtn);
            }
            
            if (clearFiltersBtn) {
                const newClearBtn = clearFiltersBtn.cloneNode(true);
                clearFiltersBtn.parentNode.replaceChild(newClearBtn, clearFiltersBtn);
            }
            
            if (applyFiltersBtn) {
                const newApplyBtn = applyFiltersBtn.cloneNode(true);
                applyFiltersBtn.parentNode.replaceChild(newApplyBtn, applyFiltersBtn);
            }
            
            // Clear any dynamic content that might have old event listeners
            const tagsFilter = document.getElementById('analysis-tags-filter');
            if (tagsFilter) {
                tagsFilter.innerHTML = '';
            }
            
        }
        
        function resetAnalysisFilterPanelState() {
            // Reset filter panel to hidden state
            const filterPanel = document.getElementById('analysis-filter-panel');
            const toggleText = document.getElementById('analysis-filter-toggle-text');
            const activeFiltersDiv = document.getElementById('analysis-active-filters');
            
            if (filterPanel) {
                filterPanel.style.display = 'none';
            }
            
            if (toggleText) {
                toggleText.textContent = 'Filters';
            }
            
            // Hide active filters section
            if (activeFiltersDiv) {
                activeFiltersDiv.style.display = 'none';
            }
            
        }
        
        function setupAnalysisInterface() {
            const toggleFiltersBtn = document.getElementById('toggle-analysis-filters');
            const clearFiltersBtn = document.getElementById('clear-analysis-filters');
            const applyFiltersBtn = document.getElementById('apply-analysis-filters');
            
            // Toggle filters panel with hover effects
            if (toggleFiltersBtn) {
                toggleFiltersBtn.addEventListener('click', () => {
                    const filterPanel = document.getElementById('analysis-filter-panel');
                    const toggleText = document.getElementById('analysis-filter-toggle-text');
                    if (filterPanel && toggleText) {
                        const isHidden = filterPanel.style.display === 'none';
                        filterPanel.style.display = isHidden ? 'block' : 'none';
                        toggleText.textContent = isHidden ? 'Hide Filters' : 'Filters';
                    }
                });
                
                // Add hover effects
                toggleFiltersBtn.addEventListener('mouseenter', () => {
                    toggleFiltersBtn.style.backgroundColor = '#f8f9fa';
                });
                toggleFiltersBtn.addEventListener('mouseleave', () => {
                    toggleFiltersBtn.style.backgroundColor = 'transparent';
                });
            }
            
            // Clear filters
            if (clearFiltersBtn) {
                clearFiltersBtn.addEventListener('click', clearAnalysisFilters);
            }
            
            // Apply filters
            if (applyFiltersBtn) {
                applyFiltersBtn.addEventListener('click', applyAnalysisFilters);
            }
            
        }
        
        function initializeAnalysisFilters() {
            const projectFilter = document.getElementById('analysis-project-filter');
            const marketFilter = document.getElementById('analysis-market-filter');
            const tagsFilter = document.getElementById('analysis-tags-filter');
            const projects = loadProjects();
            const tags = loadTags();
            
            // Populate project filter
            if (projectFilter) {
                projectFilter.innerHTML = '<option value="">All Projects</option>' +
                    projects.map(project => `<option value="${project.id}">${project.name}</option>`).join('');

                projectFilter.addEventListener('change', updateAnalysisFilterSummary);
            }

            if (marketFilter) {
                marketFilter.innerHTML = '<option value="all">All Markets</option>' +
                    MARKET_OPTIONS.map(option => `<option value="${option.value}">${option.label}</option>`).join('');
                marketFilter.addEventListener('change', updateAnalysisFilterSummary);
            }

            // Populate tags filter
            if (tagsFilter) {
                tagsFilter.innerHTML = '';
                
                if (tags.length === 0) {
                    tagsFilter.innerHTML = `
                        <div style="
                            color: #6c757d;
                            font-size: 12px;
                            font-style: italic;
                            padding: 8px;
                        ">No tags available</div>
                    `;
                } else {
                    tags.forEach(tag => {
                        const tagCheckbox = document.createElement('label');
                        tagCheckbox.className = 'analysis-tag-label';
                        tagCheckbox.style.cssText = `
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            padding: 4px 8px;
                            border-radius: 12px;
                            background: ${tag.color}15;
                            border: 1px solid ${tag.color}30;
                            cursor: pointer;
                            font-size: 12px;
                            color: ${tag.color};
                            margin: 0;
                        `;
                        
                        tagCheckbox.innerHTML = `
                            <input type="checkbox" 
                                   class="analysis-tag-checkbox" 
                                   value="${tag.id}" 
                                   style="margin: 0; width: 12px; height: 12px;">
                            <img src="${tagIconUrl}" alt="Tag" style="width: 14px; height: 14px;" />
                            <span>${tag.name}</span>
                        `;
                        
                        const checkbox = tagCheckbox.querySelector('input');
                        checkbox.addEventListener('change', updateAnalysisFilterSummary);
                        
                        tagsFilter.appendChild(tagCheckbox);
                    });
                }
            }
        }

        function syncAnalysisFiltersWithHistoryFilters() {
            if (!currentFilters) {
                return;
            }

            const projectFilter = document.getElementById('analysis-project-filter');
            const marketFilter = document.getElementById('analysis-market-filter');
            if (projectFilter) {
                projectFilter.value = currentFilters.project || '';
            }

            if (marketFilter) {
                const targetMarket = currentFilters.market || 'all';
                marketFilter.value = marketFilter.querySelector(`option[value="${targetMarket}"]`) ? targetMarket : 'all';
            }

            const tagCheckboxes = document.querySelectorAll('.analysis-tag-checkbox');
            if (tagCheckboxes.length > 0) {
                const activeTags = new Set(currentFilters.tags || []);
                tagCheckboxes.forEach(cb => {
                    cb.checked = activeTags.has(cb.value);
                });
            }

            if (typeof updateAnalysisFilterSummary === 'function') {
                updateAnalysisFilterSummary();
            }
            if (typeof updateAnalysisFilterChips === 'function') {
                updateAnalysisFilterChips();
            }
        }
        
        function syncHistoryFiltersWithAnalysisFilters() {
            if (!currentFilters) {
                return;
            }

            // Sync filters from Analysis to History
            const filterTextInput = document.getElementById('filter-text');
            const projectFilterSelect = document.getElementById('filter-project');
            const marketFilterSelect = document.getElementById('filter-market');
            
            if (filterTextInput) {
                filterTextInput.value = currentFilters.rawText || '';
            }
            
            if (projectFilterSelect) {
                projectFilterSelect.value = currentFilters.project || '';
            }
            
            if (marketFilterSelect) {
                const targetMarket = currentFilters.market || 'all';
                marketFilterSelect.value = marketFilterSelect.querySelector(`option[value="${targetMarket}"]`) ? targetMarket : 'all';
            }
            
            // Sync tag checkboxes
            const tagCheckboxes = document.querySelectorAll('.tag-checkbox');
            if (tagCheckboxes.length > 0) {
                const activeTags = new Set(currentFilters.tags || []);
                tagCheckboxes.forEach(cb => {
                    cb.checked = activeTags.has(cb.value);
                });
            }
            
            // Update filter display elements
            if (typeof updateFilterSummary === 'function') {
                updateFilterSummary();
            }
            if (typeof updateFilterChips === 'function') {
                updateFilterChips();
            }
        }
        
        function syncAllFilterDisplays() {
            // Update both History and Analysis filter displays to match global state
            if (typeof syncAnalysisFiltersWithHistoryFilters === 'function') {
                syncAnalysisFiltersWithHistoryFilters();
            }
            if (typeof syncHistoryFiltersWithAnalysisFilters === 'function') {
                syncHistoryFiltersWithAnalysisFilters();
            }
        }
        
        function updateAnalysisFilterSummary() {
            const projectFilter = document.getElementById('analysis-project-filter');
            const marketFilter = document.getElementById('analysis-market-filter');
            const tagCheckboxes = document.querySelectorAll('.analysis-tag-checkbox:checked');
            const summary = document.getElementById('analysis-filter-summary');
            
            if (!summary) return;
            
            let filterCount = 0;
            if (projectFilter && projectFilter.value) filterCount++;
            if (marketFilter && marketFilter.value && marketFilter.value !== 'all') filterCount++;
            if (tagCheckboxes.length > 0) filterCount++;
            
            if (filterCount === 0) {
                summary.textContent = 'No filters applied';
            } else if (filterCount === 1) {
                if (projectFilter && projectFilter.value) {
                    const projects = loadProjects();
                    const project = projects.find(p => p.id === projectFilter.value);
                    summary.textContent = `Filtered by: ${project?.name || 'Unknown Project'}`;
                } else if (marketFilter && marketFilter.value && marketFilter.value !== 'all') {
                    const marketOption = getMarketOption(marketFilter.value);
                    summary.textContent = `Filtered by: ${marketOption.label}`;
                } else {
                    summary.textContent = `Filtered by: ${tagCheckboxes.length} tag${tagCheckboxes.length > 1 ? 's' : ''}`;
                }
            } else {
                summary.textContent = `${filterCount} filters applied`;
            }
        }
        
        function applyAnalysisFilters() {
            const projectFilter = document.getElementById('analysis-project-filter');
            const marketFilter = document.getElementById('analysis-market-filter');
            const checkedTagCheckboxes = document.querySelectorAll('.analysis-tag-checkbox:checked');

            const selectedProject = projectFilter ? projectFilter.value : '';
            const selectedMarket = marketFilter ? marketFilter.value : 'all';
            const selectedTags = Array.from(checkedTagCheckboxes).map(cb => cb.value);

            // Keep shared filter state in sync so History reflects analysis selections
            const previousFilters = currentFilters || { text: '', rawText: '', project: '', tags: [], market: 'all', isActive: false };
            currentFilters = {
                text: previousFilters.text || '',
                rawText: previousFilters.rawText || '',
                project: selectedProject,
                tags: selectedTags,
                market: selectedMarket,
                isActive: Boolean(
                    (previousFilters.text && previousFilters.text.length) ||
                    selectedProject ||
                    selectedTags.length ||
                    (selectedMarket && selectedMarket !== 'all')
                )
            };

            _applyToHistory({ projectId: selectedProject, tags: selectedTags, market: selectedMarket, shouldSwitch: false });

            // Hide filter panel
            const panel = document.getElementById('analysis-filter-panel');
            const toggleText = document.getElementById('analysis-filter-toggle-text');
            if (panel) panel.style.display = 'none';
            if (toggleText) toggleText.textContent = 'Filters';
            
            // Update filter chips display
            updateAnalysisFilterChips();
            updateAnalysisFilterSummary();
            
            // Generate filtered analysis
            generateAnalysisReports();
        }
        
        function clearAnalysisFilters() {
            const projectFilter = document.getElementById('analysis-project-filter');
            const marketFilter = document.getElementById('analysis-market-filter');
            const tagCheckboxes = document.querySelectorAll('.analysis-tag-checkbox');
            
            if (projectFilter) projectFilter.value = '';
            if (marketFilter) marketFilter.value = 'all';
            tagCheckboxes.forEach(checkbox => checkbox.checked = false);
            
            updateAnalysisFilterSummary();
            updateAnalysisFilterChips();

            const previousFilters = currentFilters || { text: '', rawText: '', project: '', tags: [], market: 'all', isActive: false };
            currentFilters = {
                text: previousFilters.text || '',
                rawText: previousFilters.rawText || '',
                project: '',
                tags: [],
                market: 'all',
                isActive: Boolean(previousFilters.text && previousFilters.text.length)
            };
            _applyToHistory({ projectId: '', tags: [], market: 'all', shouldSwitch: false });
        }
        
        function updateAnalysisFilterChips() {
            const activeFiltersDiv = document.getElementById('analysis-active-filters');
            const filterChips = document.getElementById('analysis-filter-chips');
            
            if (!activeFiltersDiv || !filterChips) return;
            
            // Clear existing chips
            filterChips.innerHTML = '';
            
            let hasActiveFilters = false;
            const projectFilter = document.getElementById('analysis-project-filter');
            const marketFilter = document.getElementById('analysis-market-filter');
            const tagCheckboxes = document.querySelectorAll('.analysis-tag-checkbox:checked');
            
            // Project filter chip
            if (projectFilter && projectFilter.value) {
                hasActiveFilters = true;
                const projects = loadProjects();
                const project = projects.find(p => p.id === projectFilter.value);
                const chip = createFilterChip('project', `<span style="display:flex; align-items:center; gap:4px;"><img src="${projectIconUrl}" alt="Project" style="width: 14px; height: 14px;" />${project?.name || 'Unknown Project'}</span>`, () => {
                    projectFilter.value = '';
                    applyAnalysisFilters();
                });
                filterChips.appendChild(chip);
            }

            if (marketFilter && marketFilter.value && marketFilter.value !== 'all') {
                hasActiveFilters = true;
                const option = getMarketOption(marketFilter.value);
                const chip = createFilterChip('market', `🌍 ${option.label}`, () => {
                    marketFilter.value = 'all';
                    applyAnalysisFilters();
                });
                filterChips.appendChild(chip);
            }
            
            // Tag filter chips
            if (tagCheckboxes.length > 0) {
                hasActiveFilters = true;
                const tags = loadTags();
                Array.from(tagCheckboxes).forEach(checkbox => {
                    const tag = tags.find(t => t.id === checkbox.value);
                    if (tag) {
                        const chip = createFilterChip('tag', tag.name, () => {
                            checkbox.checked = false;
                            applyAnalysisFilters();
                        });
                        filterChips.appendChild(chip);
                    }
                });
            }
            
            // Show/hide active filters section
            activeFiltersDiv.style.display = hasActiveFilters ? 'block' : 'none';
        }
        
        function getFilteredSearchHistory() {
            const history = loadSearchHistory();
            const projectFilter = document.getElementById('analysis-project-filter');
            const marketFilter = document.getElementById('analysis-market-filter');
            const selectedTags = Array.from(document.querySelectorAll('.analysis-tag-checkbox:checked'))
                .map(cb => cb.value);
            
            return history.filter(item => {
                // Filter by project
                if (projectFilter && projectFilter.value && item.projectId !== projectFilter.value) {
                    return false;
                }

                if (marketFilter && marketFilter.value && marketFilter.value !== 'all') {
                    if ((item.market || null) !== marketFilter.value) {
                        return false;
                    }
                }

                // Filter by tags (AND logic)
                if (selectedTags.length > 0) {
                    const itemTags = item.tags || [];
                    const hasAllTags = selectedTags.every(tagId => itemTags.includes(tagId));
                    if (!hasAllTags) return false;
                }
                
                return true;
            });
        }
        
        function generateAnalysisReports() {
            const filteredHistory = getFilteredSearchHistory();
            
            if (filteredHistory.length === 0) {
                // Show empty state
                const citationTable = document.getElementById('citation-sources-table');
                const reviewTable = document.getElementById('review-sources-table');
                const sentimentContent = document.getElementById('sentiment-content');
                
                if (citationTable) citationTable.innerHTML = '<div style="text-align: center; padding: 40px; color: #6c757d;">No citation sources found</div>';
                if (reviewTable) reviewTable.innerHTML = '<div style="text-align: center; padding: 40px; color: #6c757d;">No review sources found</div>';
                if (sentimentContent) sentimentContent.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">No sentiment data available</div>';
                return;
            }
            
            // Generate simplified analysis reports
            const citationSources = generateSimpleCitationSources(filteredHistory);
            const reviewSources = generateSimpleReviewSources(filteredHistory);
            
            // Display tables  
            const citationTable = document.getElementById('citation-sources-table');
            const reviewTable = document.getElementById('review-sources-table');
            
            if (citationTable) {
                citationTable.innerHTML = generateSimpleSourcesHTML(citationSources.slice(0, 10), 'citations');
            }
            
            if (reviewTable) {
                reviewTable.innerHTML = generateSimpleSourcesHTML(reviewSources.slice(0, 10), 'reviews');
            }
            
            // Generate sentiment analysis
            generateSimpleSentimentAnalysis(filteredHistory);
        }
        
        // Simplified helper functions for analysis dashboard
        function generateSimpleCitationSources(history) {
            const domainCounts = new Map();
            
            history.forEach(item => {
                if (item.results?.citations) {
                    item.results.citations.forEach(citation => {
                        if (citation.url) {
                            const domain = extractDomainFromUrl(citation.url);
                            if (domain && domain !== 'unknown') {
                                domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
                            }
                        }
                    });
                }
                if (item.results?.productLinks) {
                    item.results.productLinks.forEach(link => {
                        if (link.url) {
                            const domain = extractDomainFromUrl(link.url);
                            if (domain && domain !== 'unknown') {
                                domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
                            }
                        }
                    });
                }
            });
            
            return Array.from(domainCounts.entries())
                .map(([domain, count]) => ({ domain, count }))
                .sort((a, b) => b.count - a.count);
        }
        
        function generateSimpleReviewSources(history) {
            const domainCounts = new Map();
            
            history.forEach(item => {
                if (item.results?.reviews) {
                    item.results.reviews.forEach(review => {
                        if (review.url) {
                            const domain = extractDomainFromUrl(review.url);
                            if (domain && domain !== 'unknown') {
                                domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
                            }
                        }
                    });
                }
            });
            
            return Array.from(domainCounts.entries())
                .map(([domain, count]) => ({ domain, count }))
                .sort((a, b) => b.count - a.count);
        }
        
        function generateSimpleSourcesHTML(sources, type) {
            const headerLabel = type === 'reviews' ? 'Review Sources' : 'Citation Sources';
            const emptyMessage = type === 'reviews'
                ? 'No review sources found'
                : 'No citation sources found';

            if (sources.length === 0) {
                return `<div style="text-align: center; padding: 40px; color: #6c757d;">${emptyMessage}</div>`;
            }

            return `
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e9ecef;">${headerLabel}</th>
                            <th style="padding: 8px; text-align: right; border-bottom: 1px solid #e9ecef;">Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sources.map(source => `
                            <tr style="border-bottom: 1px solid #f8f9fa;">
                                <td style="padding: 8px;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <img src="${getFaviconUrl(`https://${source.domain}`)}" alt="${source.domain} favicon" style="width: 16px; height: 16px;" onerror="this.style.display='none'">
                                        ${source.domain}
                                    </div>
                                </td>
                                <td style="padding: 8px; text-align: right; font-weight: bold;">${source.count}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
        
        function generateSimpleSentimentAnalysis(history) {
            const sentimentContent = document.getElementById('sentiment-content');
            if (!sentimentContent) return;
            
            let totalReviews = 0;
            let positiveCount = 0;
            let negativeCount = 0;
            let neutralCount = 0;
            
            history.forEach(search => {
                if (search.results && search.results.reviews) {
                    search.results.reviews.forEach(review => {
                        totalReviews++;
                        
                        // Use the existing sentiment property from the review data
                        const sentiment = review.sentiment ? review.sentiment.toLowerCase() : 'neutral';
                        
                        if (sentiment === 'positive') {
                            positiveCount++;
                        } else if (sentiment === 'negative') {
                            negativeCount++;
                        } else {
                            neutralCount++;
                        }
                    });
                }
            });
            
            const positivePercent = totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0;
            const negativePercent = totalReviews > 0 ? Math.round((negativeCount / totalReviews) * 100) : 0;
            const neutralPercent = totalReviews > 0 ? Math.round((neutralCount / totalReviews) * 100) : 0;
            
            sentimentContent.innerHTML = `
                <div style="margin-bottom: 16px; font-size: 12px; color: #6c757d;">
                    Based on ${totalReviews} review${totalReviews !== 1 ? 's' : ''} across ${history.length} search${history.length !== 1 ? 'es' : ''}
                </div>
                
                <table style="
                    width: 100%;
                    border-collapse: collapse;
                    border: 1px solid #e9ecef;
                ">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 8px 12px; text-align: left; border-bottom: 1px solid #e9ecef;">Sentiment</th>
                            <th style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #e9ecef;">Count</th>
                            <th style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #e9ecef;">Percentage</th>
                            <th style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #e9ecef;">Visual</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid #f8f9fa;">
                            <td style="padding: 8px 12px; color: #28a745; font-weight: 600;">
                                <span style="display: inline-flex; align-items: center; gap: 8px;">
                                    <span style="
                                        width: 20px;
                                        height: 20px;
                                        display: inline-block;
                                        background-color: currentColor;
                                        mask: url(${positiveIconUrl}) no-repeat center / contain;
                                        -webkit-mask: url(${positiveIconUrl}) no-repeat center / contain;
                                    " aria-hidden="true"></span>
                                    Positive
                                </span>
                            </td>
                            <td style="padding: 8px 12px; text-align: center; font-weight: bold;">${positiveCount}</td>
                            <td style="padding: 8px 12px; text-align: center; font-weight: bold;">${positivePercent}%</td>
                            <td style="padding: 8px 12px;">
                                <div style="background: #e9ecef; border-radius: 4px; height: 8px; width: 100%; position: relative;">
                                    <div style="background: #28a745; height: 100%; border-radius: 4px; width: ${positivePercent}%; transition: width 0.3s ease;"></div>
                                </div>
                            </td>
                        </tr>
                        <tr style="border-bottom: 1px solid #f8f9fa;">
                            <td style="padding: 8px 12px; color: #d39e00; font-weight: 600;">
                                <span style="display: inline-flex; align-items: center; gap: 8px;">
                                    <span style="
                                        width: 20px;
                                        height: 20px;
                                        display: inline-block;
                                        background-color: currentColor;
                                        mask: url(${neutralIconUrl}) no-repeat center / contain;
                                        -webkit-mask: url(${neutralIconUrl}) no-repeat center / contain;
                                    " aria-hidden="true"></span>
                                    Neutral
                                </span>
                            </td>
                            <td style="padding: 8px 12px; text-align: center; font-weight: bold;">${neutralCount}</td>
                            <td style="padding: 8px 12px; text-align: center; font-weight: bold;">${neutralPercent}%</td>
                            <td style="padding: 8px 12px;">
                                <div style="background: #e9ecef; border-radius: 4px; height: 8px; width: 100%; position: relative;">
                                    <div style="background: #ffc107; height: 100%; border-radius: 4px; width: ${neutralPercent}%; transition: width 0.3s ease;"></div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 12px; color: #dc3545; font-weight: 600;">
                                <span style="display: inline-flex; align-items: center; gap: 8px;">
                                    <span style="
                                        width: 20px;
                                        height: 20px;
                                        display: inline-block;
                                        background-color: currentColor;
                                        mask: url(${negativeIconUrl}) no-repeat center / contain;
                                        -webkit-mask: url(${negativeIconUrl}) no-repeat center / contain;
                                    " aria-hidden="true"></span>
                                    Negative
                                </span>
                            </td>
                            <td style="padding: 8px 12px; text-align: center; font-weight: bold;">${negativeCount}</td>
                            <td style="padding: 8px 12px; text-align: center; font-weight: bold;">${negativePercent}%</td>
                            <td style="padding: 8px 12px;">
                                <div style="background: #e9ecef; border-radius: 4px; height: 8px; width: 100%; position: relative;">
                                    <div style="background: #dc3545; height: 100%; border-radius: 4px; width: ${negativePercent}%; transition: width 0.3s ease;"></div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            `;
        }
        
        
        // Legacy function for backward compatibility

        // Function to show the collapse toggle after results are displayed
        function showCollapseToggle() {
            const collapseToggle = document.getElementById('collapse-toggle');
            if (collapseToggle) {
                collapseToggle.style.display = 'block';
            }
        }

        // Search functionality functions
        // History Management Functions
        function sanitizeForStorage(data) {
            try {
                const seen = new WeakSet();
                const json = JSON.stringify(data, (_, value) => {
                    if (typeof value === 'bigint') {
                        return value.toString();
                    }
                    if (typeof value === 'function' || typeof value === 'symbol') {
                        return undefined;
                    }
                    if (value && typeof value === 'object') {
                        if (seen.has(value)) {
                            return undefined;
                        }
                        seen.add(value);
                    }
                    return value;
                });
                return JSON.parse(json);
            } catch (error) {
                console.error('ChatGPT Product Info: Failed to sanitize search results for history storage.', error);
                return {
                    summary: data?.summary || null,
                    rationale: data?.rationale || null,
                    reviewSummary: data?.reviewSummary || null,
                    products: data?.products || [],
                    productLinks: data?.productLinks || [],
                    reviews: data?.reviews || [],
                    multiResults: data?.multiResults || null,
                    fallback: true
                };
            }
        }

        function saveSearchToHistory(query, results, searchType = 'single', tags = [], projectId = null, marketValue = null) {
            try {
                const history = JSON.parse(localStorage.getItem('chatgpt-product-search-history') || '[]');
                const sanitizedResults = sanitizeForStorage(results);
                const marketOption = marketValue ? getMarketOption(marketValue) : getSelectedMarketSettings();
                const historyItem = {
                    id: Date.now() + Math.random().toString(36).substr(2, 9),
                    query: query,
                    results: sanitizedResults,
                    searchType: searchType,
                    timestamp: Date.now(),
                    date: new Date().toLocaleString(),
                    tags: Array.isArray(tags) ? tags : [],
                    projectId: projectId,
                    version: 2,
                    market: marketOption.value,
                    marketLabel: marketOption.label,
                    marketCode: marketOption.code
                };
                
                if (tags && Array.isArray(tags)) {
                    tags.forEach(tagId => {
                        if (tagId) updateTagUsage(tagId);
                    });
                }
                
                if (projectId) {
                    updateProjectSearchCount(projectId);
                }
                
                history.unshift(historyItem);
                
                if (history.length > 50) {
                    history.splice(50);
                }
                
                localStorage.setItem('chatgpt-product-search-history', JSON.stringify(history));
                return historyItem.id;
            } catch (error) {
                console.error('ChatGPT Product Info: Failed to save search history.', error);
                alert('Unable to save this search to history. Check the console for details.');
                return null;
            }
        }

        function updateHistoryEntry(historyId, updates = {}) {
            try {
                const history = JSON.parse(localStorage.getItem('chatgpt-product-search-history') || '[]');
                const index = history.findIndex(item => item.id === historyId);
                if (index === -1) {
                    return false;
                }

                const existingItem = history[index];
                const updatedItem = { ...existingItem };

                if (Object.prototype.hasOwnProperty.call(updates, 'results')) {
                    updatedItem.results = sanitizeForStorage(updates.results);
                }
                if (Object.prototype.hasOwnProperty.call(updates, 'query')) {
                    updatedItem.query = updates.query;
                }
                if (Object.prototype.hasOwnProperty.call(updates, 'searchType')) {
                    updatedItem.searchType = updates.searchType;
                }
                if (Object.prototype.hasOwnProperty.call(updates, 'tags')) {
                    updatedItem.tags = Array.isArray(updates.tags) ? updates.tags : [];
                }
                if (Object.prototype.hasOwnProperty.call(updates, 'projectId')) {
                    updatedItem.projectId = updates.projectId;
                }
                if (Object.prototype.hasOwnProperty.call(updates, 'market')) {
                    updatedItem.market = updates.market;
                }
                if (Object.prototype.hasOwnProperty.call(updates, 'marketLabel')) {
                    updatedItem.marketLabel = updates.marketLabel;
                }
                if (Object.prototype.hasOwnProperty.call(updates, 'marketCode')) {
                    updatedItem.marketCode = updates.marketCode;
                }

                updatedItem.updatedAt = Date.now();

                history[index] = updatedItem;
                localStorage.setItem('chatgpt-product-search-history', JSON.stringify(history));
                return true;
            } catch (error) {
                console.error('ChatGPT Product Info: Failed to update search history.', error);
                alert('Unable to update this search in history. Check the console for details.');
                return false;
            }
        }

        function loadSearchHistory() {
            try {
                return JSON.parse(localStorage.getItem('chatgpt-product-search-history') || '[]');
            } catch (error) {
                return [];
            }
        }

        function clearAllHistory() {
            if (confirm('Are you sure you want to clear all search history? This action cannot be undone.')) {
                localStorage.removeItem('chatgpt-product-search-history');
                
                // Reset all project search counts to 0
                const projects = loadProjects();
                projects.forEach(project => {
                    project.searchCount = 0;
                });
                saveProjects(projects);
                
                // Reset all tag usage counts to 0
                const tags = loadTags();
                tags.forEach(tag => {
                    tag.usageCount = 0;
                });
                saveTags(tags);
                
                loadHistory();
                
                // Update sidebar to reflect reset counts
                populateProjectsList();
                populateTagsList();
            }
        }

        // ===== ENHANCED DATA MANAGEMENT FUNCTIONS =====
        // Tags and Projects Management - Phase 1 Implementation
        
        function loadTags() {
            try {
                return JSON.parse(localStorage.getItem('chatgpt-product-search-tags') || '[]');
            } catch (error) {
                return [];
            }
        }
        
        function saveTags(tags) {
            try {
                localStorage.setItem('chatgpt-product-search-tags', JSON.stringify(tags));
                return true;
            } catch (error) {
                return false;
            }
        }
        
        function loadProjects() {
            try {
                return JSON.parse(localStorage.getItem('chatgpt-product-search-projects') || '[]');
            } catch (error) {
                return [];
            }
        }
        
        function saveProjects(projects) {
            try {
                localStorage.setItem('chatgpt-product-search-projects', JSON.stringify(projects));
                return true;
            } catch (error) {
                return false;
            }
        }
        
        function createTag(name, color = '#007bff') {
            const tags = loadTags();
            
            // Check for duplicate names
            if (tags.find(tag => tag.name.toLowerCase() === name.toLowerCase())) {
                throw new Error('A tag with this name already exists');
            }
            
            const newTag = {
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                name: name.trim(),
                color: color,
                created: Date.now(),
                usageCount: 0
            };
            
            tags.push(newTag);
            saveTags(tags);
            return newTag;
        }
        
        function createProject(name, description = '') {
            const projects = loadProjects();
            
            // Check for duplicate names
            if (projects.find(project => project.name.toLowerCase() === name.toLowerCase())) {
                throw new Error('A project with this name already exists');
            }
            
            const newProject = {
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                name: name.trim(),
                description: description.trim(),
                created: Date.now(),
                searchCount: 0
            };
            
            projects.push(newProject);
            saveProjects(projects);
            return newProject;
        }
        
        function deleteTag(tagId) {
            const tags = loadTags();
            const filteredTags = tags.filter(tag => tag.id !== tagId);
            
            if (filteredTags.length === tags.length) {
                throw new Error('Tag not found');
            }
            
            // Remove tag from all searches
            const history = loadSearchHistory();
            const updatedHistory = history.map(search => ({
                ...search,
                tags: (search.tags || []).filter(id => id !== tagId)
            }));
            
            localStorage.setItem('chatgpt-product-search-history', JSON.stringify(updatedHistory));
            saveTags(filteredTags);
            return true;
        }
        
        function deleteProject(projectId) {
            const projects = loadProjects();
            const filteredProjects = projects.filter(project => project.id !== projectId);
            
            if (filteredProjects.length === projects.length) {
                throw new Error('Project not found');
            }
            
            // Remove project from all searches
            const history = loadSearchHistory();
            const updatedHistory = history.map(search => ({
                ...search,
                projectId: search.projectId === projectId ? null : search.projectId
            }));
            
            localStorage.setItem('chatgpt-product-search-history', JSON.stringify(updatedHistory));
            saveProjects(filteredProjects);
            return true;
        }
        
        function updateTagUsage(tagId) {
            const tags = loadTags();
            const tag = tags.find(t => t.id === tagId);
            if (tag) {
                tag.usageCount = (tag.usageCount || 0) + 1;
                saveTags(tags);
            }
        }
        
        function updateProjectSearchCount(projectId) {
            const projects = loadProjects();
            const project = projects.find(p => p.id === projectId);
            if (project) {
                project.searchCount = (project.searchCount || 0) + 1;
                saveProjects(projects);
            }
        }
        
        function decrementTagUsage(tagId) {
            const tags = loadTags();
            const tag = tags.find(t => t.id === tagId);
            if (tag) {
                tag.usageCount = Math.max((tag.usageCount || 0) - 1, 0);
                saveTags(tags);
            }
        }
        
        function decrementProjectSearchCount(projectId) {
            const projects = loadProjects();
            const project = projects.find(p => p.id === projectId);
            if (project) {
                project.searchCount = Math.max((project.searchCount || 0) - 1, 0);
                saveProjects(projects);
            }
        }
        
        function recalculateAllCounts() {
            // Recalculate project and tag counts from actual search history
            const history = loadSearchHistory();
            const projects = loadProjects();
            const tags = loadTags();
            
            // Reset all counts
            projects.forEach(project => project.searchCount = 0);
            tags.forEach(tag => tag.usageCount = 0);
            
            // Count actual usage from history
            history.forEach(item => {
                if (item.projectId) {
                    const project = projects.find(p => p.id === item.projectId);
                    if (project) {
                        project.searchCount = (project.searchCount || 0) + 1;
                    }
                }
                
                if (item.tags && Array.isArray(item.tags)) {
                    item.tags.forEach(tagId => {
                        const tag = tags.find(t => t.id === tagId);
                        if (tag) {
                            tag.usageCount = (tag.usageCount || 0) + 1;
                        }
                    });
                }
            });
            
            // Save updated counts
            saveProjects(projects);
            saveTags(tags);
            
            // Update sidebar display
            populateProjectsList();
            populateTagsList();
        }
        
        // Migration function for existing data
        function migrateSearchHistoryData() {
            try {
                const history = loadSearchHistory();
                let migrationNeeded = false;
                
                const migratedHistory = history.map(search => {
                    // Check if this search needs migration (version 2 format)
                    if (!search.version || search.version < 2) {
                        migrationNeeded = true;
                        return {
                            ...search,
                            tags: search.tags || [],
                            projectId: search.projectId || null,
                            version: 2
                        };
                    }
                    return search;
                });
                
                if (migrationNeeded) {
                    localStorage.setItem('chatgpt-product-search-history', JSON.stringify(migratedHistory));
                }
                
                return true;
            } catch (error) {
                return false;
            }
        }
        
        // ===== END ENHANCED DATA MANAGEMENT FUNCTIONS =====

        // ===== SIDEBAR FUNCTIONALITY - Phase 2 =====
        
        function initializeSidebar() {
            // Populate sidebar with existing data
            populateProjectsList();
            populateTagsList();
            
            // Add event listeners for sidebar buttons
            const settingsBtn = document.getElementById('settings-btn');
            const addProjectBtn = document.getElementById('add-project-btn');
            const addTagBtn = document.getElementById('add-tag-btn');
            
            if (settingsBtn) {
                settingsBtn.addEventListener('click', openSettingsModal);
            }
            
            if (addProjectBtn) {
                addProjectBtn.addEventListener('click', quickAddProject);
            }
            
            if (addTagBtn) {
                addTagBtn.addEventListener('click', quickAddTag);
            }
        }
        
        function populateProjectsList() {
            const projectsList = document.getElementById('projects-list');
            if (!projectsList) return;
            
            const projects = loadProjects();
            
            if (projects.length === 0) {
                projectsList.innerHTML = `
                    <div style="
                        padding: 8px;
                        text-align: center;
                        color: #6c757d;
                        font-size: 12px;
                        font-style: italic;
                    ">No projects yet</div>
                `;
                return;
            }
            
            projectsList.innerHTML = projects.map(project => `
                <div class="sidebar-project" data-project-id="${project.id}">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <span style="font-weight: 500; display: flex; align-items: center; gap: 6px;"><img src="${projectIconUrl}" alt="Project" style="width: 16px; height: 16px;" />${project.name}</span>
                        <span style="
                            font-size: 11px;
                            color: #6c757d;
                            background: #f8f9fa;
                            padding: 1px 4px;
                            border-radius: 8px;
                        ">${project.searchCount || 0}</span>
                    </div>
                    ${project.description ? `
                        <div style="
                            font-size: 11px;
                            color: #6c757d;
                            margin-top: 2px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        ">${project.description}</div>
                    ` : ''}
                </div>
            `).join('');
            
            // Add click handlers for project filtering
            document.querySelectorAll('.sidebar-project').forEach(element => {
                element.addEventListener('click', () => {
                    const projectId = element.getAttribute('data-project-id');
                    filterByProject(projectId);
                });
            });
        }
        
        function populateTagsList() {
            const tagsList = document.getElementById('tags-list');
            if (!tagsList) return;
            
            const tags = loadTags();
            
            if (tags.length === 0) {
                tagsList.innerHTML = `
                    <div style="
                        padding: 8px;
                        text-align: center;
                        color: #6c757d;
                        font-size: 12px;
                        font-style: italic;
                    ">No tags yet</div>
                `;
                return;
            }
            
            tagsList.innerHTML = tags.map(tag => `
                <div class="sidebar-tag" data-tag-id="${tag.id}" style="
                    border: 1px solid ${tag.color}20;
                    background: ${tag.color}10;
                ">
                    <span style="
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    ">
                        <img src="${tagIconUrl}" alt="Tag" style="width: 14px; height: 14px;" />${tag.name}
                    </span>
                    <span style="
                        font-size: 10px;
                        color: #6c757d;
                        background: #f8f9fa;
                        padding: 1px 4px;
                        border-radius: 6px;
                    ">${tag.usageCount || 0}</span>
                </div>
            `).join('');
            
            // Add click handlers for tag filtering
            document.querySelectorAll('.sidebar-tag').forEach(element => {
                element.addEventListener('click', () => {
                    const tagId = element.getAttribute('data-tag-id');
                    filterByTag(tagId);
                });
            });
        }
        
        function quickAddProject() {
            const name = prompt('Enter project name:');
            if (!name || !name.trim()) return;
            
            try {
                const project = createProject(name.trim());
                populateProjectsList();
                alert(`Project "${project.name}" created successfully!`);
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
        
        function quickAddTag() {
            const name = prompt('Enter tag name:');
            if (!name || !name.trim()) return;
            
            try {
                const tag = createTag(name.trim());
                populateTagsList();
                alert(`Tag "${tag.name}" created successfully!`);
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
        
        // filterByProject function removed - duplicate implementation exists below
        
        // filterByTag function removed - duplicate implementation exists below
        
        function openSettingsModal() {
            // Remove existing settings modal if present
            const existingModal = document.getElementById('settings-modal');
            if (existingModal) {
                existingModal.remove();
            }
            
            const settingsModalHTML = `
                <div id="settings-modal" style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10002;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                ">
                    <div style="
                        background: white;
                        width: 600px;
                        max-width: 90vw;
                        height: 500px;
                        max-height: 90vh;
                        border-radius: 8px;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    ">
                        <!-- Modal Header -->
                        <div style="
                            background: #f8f9fa;
                            padding: 16px 20px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            border-bottom: 1px solid #e9ecef;
                        ">
                            <h2 style="
                                font-size: 18px;
                                font-weight: 600;
                                margin: 0;
                                color: #495057; display: flex; align-items: center;"><img src="${settingsIconUrl}" alt="Settings" style="width: 20px;height: 20px;margin-right: 5px;" />Settings</h2>
                            <button id="close-settings-modal" style="
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
                        
                        <!-- Settings Tabs -->
                        <div style="
                            display: flex;
                            background: #f8f9fa;
                            border-bottom: 1px solid #e9ecef;
                        ">
                            <button id="tags-settings-tab" class="settings-tab-button active-settings-tab" style="
                                flex: 1;
                                padding: 12px 20px;
                                border: none;
                                background: white;
                                color: #495057;
                                font-size: 14px;
                                font-weight: 500;
                                cursor: pointer;
                                border-bottom: 2px solid #007bff;
                                transition: all 0.2s ease;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 8px;
                            "><img src="${tagIconUrl}" alt="Tags" style="width: 20px; height: 20px;" />Tags</button>
                            <button id="projects-settings-tab" class="settings-tab-button" style="
                                flex: 1;
                                padding: 12px 20px;
                                border: none;
                                background: #f8f9fa;
                                color: #6c757d;
                                font-size: 14px;
                                font-weight: 500;
                                cursor: pointer;
                                border-bottom: 2px solid transparent;
                                transition: all 0.2s ease;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 8px;
                            "><img src="${projectIconUrl}" alt="Projects" style="width: 20px; height: 20px;" />Projects</button>
                        </div>
                        
                        <!-- Settings Content -->
                        <div style="
                            flex: 1;
                            overflow: hidden;
                            display: flex;
                            flex-direction: column;
                        ">
                            <!-- Tags Settings -->
                            <div id="tags-settings-content" style="
                                flex: 1;
                                padding: 20px;
                                overflow-y: auto;
                                display: block;
                            ">
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    margin-bottom: 20px;
                                ">
                                    <h3 style="margin: 0; color: #495057;">Manage Tags</h3>
                                    <button id="create-tag-btn" style="
                                        background: #007bff;
                                        color: white;
                                        border: none;
                                        padding: 8px 16px;
                                        border-radius: 4px;
                                        font-size: 14px;
                                        cursor: pointer;
                                    ">+ New Tag</button>
                                </div>
                                <div id="tags-management-list">
                                    <!-- Tags list will be populated here -->
                                </div>
                            </div>
                            
                            <!-- Projects Settings -->
                            <div id="projects-settings-content" style="
                                flex: 1;
                                padding: 20px;
                                overflow-y: auto;
                                display: none;
                            ">
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    margin-bottom: 20px;
                                ">
                                    <h3 style="margin: 0; color: #495057;">Manage Projects</h3>
                                    <button id="create-project-btn" style="
                                        background: #007bff;
                                        color: white;
                                        border: none;
                                        padding: 8px 16px;
                                        border-radius: 4px;
                                        font-size: 14px;
                                        cursor: pointer;
                                    ">+ New Project</button>
                                </div>
                                <div id="projects-management-list">
                                    <!-- Projects list will be populated here -->
                                </div>
                            </div>
                        </div>
                        
                        <!-- Modal Footer -->
                        <div style="
                            background: #f8f9fa;
                            padding: 16px 20px;
                            border-top: 1px solid #e9ecef;
                            display: flex;
                            justify-content: flex-end;
                            gap: 12px;
                        ">
                            <button id="cancel-settings" style="
                                background: #6c757d;
                                color: white;
                                border: none;
                                padding: 8px 16px;
                                border-radius: 4px;
                                font-size: 14px;
                                cursor: pointer;
                            ">Cancel</button>
                            <button id="save-settings" style="
                                background: #28a745;
                                color: white;
                                border: none;
                                padding: 8px 16px;
                                border-radius: 4px;
                                font-size: 14px;
                                cursor: pointer;
                            ">Save Changes</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Create and append modal
            const modalDiv = document.createElement('div');
            modalDiv.innerHTML = settingsModalHTML;
            const modal = modalDiv.firstElementChild;
            document.body.appendChild(modal);
            
            // Initialize settings modal
            initializeSettingsModal();
        }
        
        function initializeSettingsModal() {
            // Add event listeners for modal controls
            const closeBtn = document.getElementById('close-settings-modal');
            const cancelBtn = document.getElementById('cancel-settings');
            const saveBtn = document.getElementById('save-settings');
            const tagsTab = document.getElementById('tags-settings-tab');
            const projectsTab = document.getElementById('projects-settings-tab');
            const createTagBtn = document.getElementById('create-tag-btn');
            const createProjectBtn = document.getElementById('create-project-btn');
            
            // Close modal handlers
            if (closeBtn) {
                closeBtn.addEventListener('click', closeSettingsModal);
            }
            if (cancelBtn) {
                cancelBtn.addEventListener('click', closeSettingsModal);
            }
            if (saveBtn) {
                saveBtn.addEventListener('click', saveSettingsAndClose);
            }
            
            // Tab switching
            if (tagsTab) {
                tagsTab.addEventListener('click', () => switchSettingsTab('tags'));
            }
            if (projectsTab) {
                projectsTab.addEventListener('click', () => switchSettingsTab('projects'));
            }
            
            // Create buttons
            if (createTagBtn) {
                createTagBtn.addEventListener('click', showCreateTagForm);
            }
            if (createProjectBtn) {
                createProjectBtn.addEventListener('click', showCreateProjectForm);
            }
            
            // Close on outside click
            const modal = document.getElementById('settings-modal');
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        closeSettingsModal();
                    }
                });
            }
            
            // Populate initial content
            populateTagsManagement();
            populateProjectsManagement();
        }
        
        function switchSettingsTab(tab) {
            const tagsTab = document.getElementById('tags-settings-tab');
            const projectsTab = document.getElementById('projects-settings-tab');
            const tagsContent = document.getElementById('tags-settings-content');
            const projectsContent = document.getElementById('projects-settings-content');
            
            if (tab === 'tags') {
                tagsTab.style.background = 'white';
                tagsTab.style.color = '#495057';
                tagsTab.style.borderBottom = '2px solid #007bff';
                projectsTab.style.background = '#f8f9fa';
                projectsTab.style.color = '#6c757d';
                projectsTab.style.borderBottom = '2px solid transparent';
                
                tagsContent.style.display = 'block';
                projectsContent.style.display = 'none';
            } else {
                projectsTab.style.background = 'white';
                projectsTab.style.color = '#495057';
                projectsTab.style.borderBottom = '2px solid #007bff';
                tagsTab.style.background = '#f8f9fa';
                tagsTab.style.color = '#6c757d';
                tagsTab.style.borderBottom = '2px solid transparent';
                
                tagsContent.style.display = 'none';
                projectsContent.style.display = 'block';
            }
        }
        
        function populateTagsManagement() {
            const tagsManagementList = document.getElementById('tags-management-list');
            if (!tagsManagementList) return;
            
            const tags = loadTags();
            
            if (tags.length === 0) {
                tagsManagementList.innerHTML = `
                    <div style="
                        text-align: center;
                        padding: 40px;
                        color: #6c757d;
                        font-style: italic;
                    ">
                        No tags created yet. Click "New Tag" to create your first tag.
                    </div>
                `;
                return;
            }
            
            tagsManagementList.innerHTML = tags.map(tag => `
                <div class="tag-management-item" data-tag-id="${tag.id}" style="
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 12px;
                    background: white;
                ">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                    ">
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        ">
                            <input type="color" value="${tag.color}" class="tag-color-input" style="
                                width: 30px;
                                height: 30px;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;
                            ">
                            <input type="text" value="${tag.name}" class="tag-name-input" style="
                                border: 1px solid #e9ecef;
                                border-radius: 4px;
                                padding: 6px 8px;
                                font-size: 14px;
                                flex: 1;
                                min-width: 200px;
                            ">
                        </div>
                        <div style="
                            display: flex;
                            gap: 8px;
                            align-items: center;
                        ">
                            <span style="
                                background: #f8f9fa;
                                padding: 4px 8px;
                                border-radius: 12px;
                                font-size: 12px;
                                color: #6c757d;
                            ">${tag.usageCount || 0} uses</span>
                            <button class="delete-tag-btn" data-tag-id="${tag.id}" style="
                                background: #dc3545;
                                color: white;
                                border: none;
                                padding: 6px 12px;
                                border-radius: 4px;
                                font-size: 12px;
                                cursor: pointer;
                            ">Delete</button>
                        </div>
                    </div>
                    <div style="
                        font-size: 12px;
                        color: #6c757d;
                    ">Created: ${new Date(tag.created).toLocaleDateString()}</div>
                </div>
            `).join('');
            
            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-tag-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const tagId = btn.getAttribute('data-tag-id');
                    deleteTagFromSettings(tagId);
                });
            });
        }
        
        function populateProjectsManagement() {
            const projectsManagementList = document.getElementById('projects-management-list');
            if (!projectsManagementList) return;
            
            const projects = loadProjects();
            
            if (projects.length === 0) {
                projectsManagementList.innerHTML = `
                    <div style="
                        text-align: center;
                        padding: 40px;
                        color: #6c757d;
                        font-style: italic;
                    ">
                        No projects created yet. Click "New Project" to create your first project.
                    </div>
                `;
                return;
            }
            
            projectsManagementList.innerHTML = projects.map(project => `
                <div class="project-management-item" data-project-id="${project.id}" style="
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 12px;
                    background: white;
                ">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 8px;
                    ">
                        <div style="flex: 1; margin-right: 16px;">
                            <input type="text" value="${project.name}" class="project-name-input" style="
                                border: 1px solid #e9ecef;
                                border-radius: 4px;
                                padding: 6px 8px;
                                font-size: 14px;
                                width: 100%;
                                margin-bottom: 8px;
                                font-weight: 500;
                            ">
                            <textarea class="project-description-input" placeholder="Project description (optional)" style="
                                border: 1px solid #e9ecef;
                                border-radius: 4px;
                                padding: 6px 8px;
                                font-size: 13px;
                                width: 100%;
                                min-height: 60px;
                                resize: vertical;
                                font-family: inherit;
                            ">${project.description || ''}</textarea>
                        </div>
                        <div style="
                            display: flex;
                            flex-direction: column;
                            gap: 8px;
                            align-items: flex-end;
                        ">
                            <span style="
                                background: #f8f9fa;
                                padding: 4px 8px;
                                border-radius: 12px;
                                font-size: 12px;
                                color: #6c757d;
                            ">${project.searchCount || 0} searches</span>
                            <button class="delete-project-btn" data-project-id="${project.id}" style="
                                background: #dc3545;
                                color: white;
                                border: none;
                                padding: 6px 12px;
                                border-radius: 4px;
                                font-size: 12px;
                                cursor: pointer;
                            ">Delete</button>
                        </div>
                    </div>
                    <div style="
                        font-size: 12px;
                        color: #6c757d;
                    ">Created: ${new Date(project.created).toLocaleDateString()}</div>
                </div>
            `).join('');
            
            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-project-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const projectId = btn.getAttribute('data-project-id');
                    deleteProjectFromSettings(projectId);
                });
            });
        }
        
        function showCreateTagForm() {
            const name = prompt('Enter tag name:');
            if (!name || !name.trim()) return;
            
            const color = prompt('Enter tag color (hex):', '#007bff');
            if (!color) return;
            
            try {
                createTag(name.trim(), color);
                populateTagsManagement();
                alert(`Tag "${name}" created successfully!`);
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
        
        function showCreateProjectForm() {
            const name = prompt('Enter project name:');
            if (!name || !name.trim()) return;
            
            const description = prompt('Enter project description (optional):') || '';
            
            try {
                createProject(name.trim(), description.trim());
                populateProjectsManagement();
                alert(`Project "${name}" created successfully!`);
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
        
        function deleteTagFromSettings(tagId) {
            const tag = loadTags().find(t => t.id === tagId);
            if (!tag) return;
            
            if (confirm(`Are you sure you want to delete the tag "${tag.name}"? This will remove it from all searches.`)) {
                try {
                    deleteTag(tagId);
                    populateTagsManagement();
                    alert('Tag deleted successfully!');
                } catch (error) {
                    alert(`Error: ${error.message}`);
                }
            }
        }
        
        function deleteProjectFromSettings(projectId) {
            const project = loadProjects().find(p => p.id === projectId);
            if (!project) return;
            
            if (confirm(`Are you sure you want to delete the project "${project.name}"? This will remove it from all searches.`)) {
                try {
                    deleteProject(projectId);
                    populateProjectsManagement();
                    alert('Project deleted successfully!');
                } catch (error) {
                    alert(`Error: ${error.message}`);
                }
            }
        }
        
        function saveSettingsAndClose() {
            // Save all changes from the forms
            try {
                // Save tag changes
                const tagItems = document.querySelectorAll('.tag-management-item');
                tagItems.forEach(item => {
                    const tagId = item.getAttribute('data-tag-id');
                    const nameInput = item.querySelector('.tag-name-input');
                    const colorInput = item.querySelector('.tag-color-input');
                    
                    if (nameInput && colorInput) {
                        const tags = loadTags();
                        const tag = tags.find(t => t.id === tagId);
                        if (tag) {
                            tag.name = nameInput.value.trim();
                            tag.color = colorInput.value;
                        }
                        saveTags(tags);
                    }
                });
                
                // Save project changes
                const projectItems = document.querySelectorAll('.project-management-item');
                projectItems.forEach(item => {
                    const projectId = item.getAttribute('data-project-id');
                    const nameInput = item.querySelector('.project-name-input');
                    const descInput = item.querySelector('.project-description-input');
                    
                    if (nameInput && descInput) {
                        const projects = loadProjects();
                        const project = projects.find(p => p.id === projectId);
                        if (project) {
                            project.name = nameInput.value.trim();
                            project.description = descInput.value.trim();
                        }
                        saveProjects(projects);
                    }
                });
                
                // Refresh sidebar
                populateProjectsList();
                populateTagsList();
                
                // Close modal
                closeSettingsModal();
                
                alert('Settings saved successfully!');
            } catch (error) {
                alert(`Error saving settings: ${error.message}`);
            }
        }
        
        function closeSettingsModal() {
            const modal = document.getElementById('settings-modal');
            if (modal) {
                modal.remove();
            }
        }
        
        // ===== POST-SEARCH TAGGING FUNCTIONALITY - Phase 4 =====
        
        function showPostSearchTagging(query, results, searchType, historyItemId = null) {
            // Remove any existing tagging or edit interfaces
            const existingInterface = document.getElementById('post-search-tagging');
            const existingToggle = document.getElementById('post-search-toggle');
            const editInterface = document.getElementById('edit-organization-interface');
            const editToggle = document.getElementById('edit-organization-toggle');
            
            if (existingInterface) {
                existingInterface.remove();
            }
            if (existingToggle) {
                existingToggle.remove();
            }
            if (editInterface) {
                editInterface.remove();
            }
            if (editToggle) {
                editToggle.remove();
            }
            
            // Add toggle button for post-search tagging
            addPostSearchTaggingToggle(query, results, searchType, historyItemId);
        }

        function addPostSearchTaggingToggle(query, results, searchType, historyItemId) {
            const toggleHTML = `
                <div id="post-search-toggle" style="
                    background: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    padding: 12px 16px;
                    margin: 16px 0;
                    border-left: 4px solid #28a745;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    ">
                        <img src="${tagIconUrl}" alt="Tags" style="width: 16px; height: 16px;" />
                        <span style="
                            font-weight: 600;
                            color: #155724;
                            font-size: 14px;
                        ">Organize Search</span>
                        <span style="
                            font-size: 12px;
                            color: #6c757d;
                        ">Add tags and assign to project</span>
                    </div>
                    <span id="post-search-arrow" style="
                        font-size: 14px;
                        color: #155724;
                        transition: transform 0.2s ease;
                    ">▼</span>
                </div>
                <div id="post-search-content" style="display: none;">
                </div>
            `;
            
            // Insert the toggle at the top of results container
            const resultsContainer = document.getElementById('results-container');
            if (resultsContainer) {
                resultsContainer.insertAdjacentHTML('afterbegin', toggleHTML);
                
                // Add click handler for toggle
                const toggle = document.getElementById('post-search-toggle');
                const content = document.getElementById('post-search-content');
                const arrow = document.getElementById('post-search-arrow');
                if (toggle) {
                    if (historyItemId) {
                        toggle.dataset.historyId = historyItemId;
                    } else {
                        delete toggle.dataset.historyId;
                    }
                }

                toggle.addEventListener('click', () => {
                    const isHidden = content.style.display === 'none';
                    content.style.display = isHidden ? 'block' : 'none';
                    arrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
                    arrow.textContent = isHidden ? '▲' : '▼';
                    
                    if (isHidden) {
                        // Show the tagging interface
                        const currentHistoryId = toggle?.dataset?.historyId || historyItemId;
                        showActualPostSearchTagging(query, results, searchType, currentHistoryId || null);
                    } else {
                        // Clear the content
                        content.innerHTML = '';
                    }
                });
            }
        }

        function showActualPostSearchTagging(query, results, searchType, historyItemId) {
            const tags = loadTags();
            const projects = loadProjects();
            
            // Create tagging interface
            const taggingHTML = `
                <div id="post-search-tagging" style="
                    background: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    padding: 16px;
                    margin: 16px 0;
                    border-left: 4px solid #28a745;
                ">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 12px;
                    ">
                        <h4 style="
                            margin: 0;
                            color: #495057;
                            font-size: 14px;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        "><img src="${tagIconUrl}" alt="Tags" style="width: 16px; height: 16px;" />Organize This Search</h4>
                        <div style="
                            font-size: 12px;
                            color: #6c757d;
                        ">Optional - help organize your research</div>
                    </div>
                    
                    <div style="
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 12px;
                        margin-bottom: 12px;
                    ">
                        <div>
                            <label style="
                                display: block;
                                font-size: 12px;
                                font-weight: 600;
                                color: #6c757d;
                                margin-bottom: 4px;
                            ">Project</label>
                            <select id="tagging-project" style="
                                width: 100%;
                                padding: 6px 8px;
                                border: 1px solid #dee2e6;
                                border-radius: 4px;
                                font-size: 13px;
                                background: white;
                            ">
                                <option value="">No project</option>
                                ${projects.map(project => `
                                    <option value="${project.id}">${project.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div>
                            <label style="
                                display: block;
                                font-size: 12px;
                                font-weight: 600;
                                color: #6c757d;
                                margin-bottom: 4px;
                            ">Tags</label>
                            <div id="tagging-tags" style="
                                min-height: 32px;
                                border: 1px solid #dee2e6;
                                border-radius: 4px;
                                padding: 4px;
                                background: white;
                                display: flex;
                                flex-wrap: wrap;
                                gap: 4px;
                                align-items: center;
                            ">
                                <button id="add-tag-to-search" style="
                                    background: none;
                                    border: 1px dashed #007bff;
                                    color: #007bff;
                                    padding: 2px 6px;
                                    border-radius: 12px;
                                    font-size: 11px;
                                    cursor: pointer;
                                ">+ Add Tag</button>
                            </div>
                        </div>
                    </div>
                    
                    <div style="
                        display: flex;
                        justify-content: flex-end;
                        gap: 8px;
                        padding-top: 8px;
                        border-top: 1px solid #e9ecef;
                    ">
                        <button id="skip-tagging" style="
                            background: #6c757d;
                            color: white;
                            border: none;
                            padding: 6px 12px;
                            border-radius: 4px;
                            font-size: 12px;
                            cursor: pointer;
                        ">Skip</button>
                        <button id="save-with-tags" style="
                            background: #28a745;
                            color: white;
                            border: none;
                            padding: 6px 12px;
                            border-radius: 4px;
                            font-size: 12px;
                            cursor: pointer;
                        ">Save to History</button>
                    </div>
                </div>
            `;
            
            // Insert the interface in the content area
            const content = document.getElementById('post-search-content');
            if (content) {
                content.innerHTML = taggingHTML;
                
                // Initialize the interface
                initializePostSearchTagging(query, results, searchType, historyItemId);
                
                // No auto-hide since it's now manually controlled
            }
        }
        
        function initializePostSearchTagging(query, results, searchType, historyItemId) {
            const selectedTags = new Set();
            let currentHistoryId = historyItemId || null;
            const toggleElement = document.getElementById('post-search-toggle');

            const setToggleHistoryId = (id) => {
                if (!toggleElement) {
                    return;
                }
                if (id) {
                    toggleElement.dataset.historyId = id;
                } else {
                    delete toggleElement.dataset.historyId;
                }
            };

            setToggleHistoryId(currentHistoryId);
            
            // Add tag button functionality
            const addTagBtn = document.getElementById('add-tag-to-search');
            if (addTagBtn) {
                addTagBtn.addEventListener('click', () => {
                    showTagSelector(selectedTags);
                });
            }
            
            // Skip button
            const skipBtn = document.getElementById('skip-tagging');
            if (skipBtn) {
                skipBtn.addEventListener('click', () => {
                    if (!currentHistoryId) {
                        currentHistoryId = saveSearchWithSelectedTags(null, query, results, searchType, selectedTags) || currentHistoryId;
                        setToggleHistoryId(currentHistoryId);
                    }
                    const taggingInterface = document.getElementById('post-search-tagging');
                    if (taggingInterface) {
                        taggingInterface.remove();
                    }
                });
            }
            
            // Save button
            const saveBtn = document.getElementById('save-with-tags');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    currentHistoryId = saveSearchWithSelectedTags(currentHistoryId, query, results, searchType, selectedTags) || currentHistoryId;
                    setToggleHistoryId(currentHistoryId);
                    const taggingInterface = document.getElementById('post-search-tagging');
                    if (taggingInterface) {
                        taggingInterface.remove();
                    }
                });
            }
        }
        
        function showTagSelector(selectedTags) {
            const tags = loadTags();
            const tagsContainer = document.getElementById('tagging-tags');
            if (!tagsContainer) return;
            
            // Create dropdown for tag selection
            const dropdown = document.createElement('select');
            dropdown.style.cssText = `
                width: 100%;
                padding: 6px 8px;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                background: white;
                font-size: 12px;
                margin: 2px 0;
            `;
            
            dropdown.innerHTML = `
                <option value="">Select a tag...</option>
                ${tags.filter(tag => !selectedTags.has(tag.id)).map(tag => `
                    <option value="${tag.id}">${tag.name}</option>
                `).join('')}
            `;
            
            dropdown.addEventListener('change', (e) => {
                if (e.target.value) {
                    selectedTags.add(e.target.value);
                    updateTagsDisplay(selectedTags);
                    dropdown.remove();
                }
            });
            
            dropdown.addEventListener('blur', () => {
                setTimeout(() => dropdown.remove(), 100);
            });
            
            // Remove any existing dropdowns first
            const existingDropdown = tagsContainer.querySelector('select');
            if (existingDropdown) {
                existingDropdown.remove();
            }
            
            // Insert dropdown in a clean way
            tagsContainer.insertBefore(dropdown, tagsContainer.firstChild);
            dropdown.focus();
        }
        
        function updateTagsDisplay(selectedTags) {
            const tagsContainer = document.getElementById('tagging-tags');
            if (!tagsContainer) return;
            
            const tags = loadTags();
            
            // Clear existing tags display and any dropdowns
            tagsContainer.innerHTML = '';
            
            // Add selected tags
            selectedTags.forEach(tagId => {
                const tag = tags.find(t => t.id === tagId);
                if (tag) {
                    const tagElement = document.createElement('span');
                    tagElement.style.cssText = `
                        background: ${tag.color}20;
                        color: ${tag.color};
                        border: 1px solid ${tag.color}40;
                        padding: 2px 6px;
                        border-radius: 12px;
                        font-size: 11px;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    `;
                    tagElement.innerHTML = `
                        ${tag.name}
                        <button class="remove-tag-btn" data-tag-id="${tagId}" style="
                            background: none;
                            border: none;
                            color: ${tag.color};
                            cursor: pointer;
                            padding: 0;
                            width: 14px;
                            height: 14px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 10px;
                        ">×</button>
                    `;
                    
                    // Add event listener for remove button
                    const removeBtn = tagElement.querySelector('.remove-tag-btn');
                    removeBtn.addEventListener('click', () => {
                        selectedTags.delete(tagId);
                        updateTagsDisplay(selectedTags);
                    });
                    tagsContainer.appendChild(tagElement);
                }
            });
            
            // Re-add the add button
            const addButton = document.createElement('button');
            addButton.id = 'add-tag-to-search';
            addButton.style.cssText = `
                background: none;
                border: 1px dashed #007bff;
                color: #007bff;
                padding: 2px 6px;
                border-radius: 12px;
                font-size: 11px;
                cursor: pointer;
            `;
            addButton.textContent = '+ Add Tag';
            addButton.addEventListener('click', () => showTagSelector(selectedTags));
            tagsContainer.appendChild(addButton);
        }
        
        function saveSearchWithSelectedTags(historyId, query, results, searchType, selectedTags = new Set()) {
            const projectSelect = document.getElementById('tagging-project');
            const selectedProject = projectSelect ? projectSelect.value || null : null;
            const normalizedTags = selectedTags instanceof Set ? Array.from(selectedTags) : Array.from(new Set(selectedTags || []));
            let effectiveHistoryId = historyId || null;

            if (effectiveHistoryId) {
                const history = loadSearchHistory();
                const existingItem = history.find(item => item.id === effectiveHistoryId);
                const previousTags = existingItem ? existingItem.tags || [] : [];
                const previousProject = existingItem ? existingItem.projectId || null : null;

                const newTags = normalizedTags.filter(tag => !previousTags.includes(tag));
                if (newTags.length > 0) {
                    newTags.forEach(tagId => {
                        if (tagId) updateTagUsage(tagId);
                    });
                }

                if (selectedProject && selectedProject !== previousProject) {
                    updateProjectSearchCount(selectedProject);
                }

                const updated = updateHistoryEntry(effectiveHistoryId, {
                    results,
                    query,
                    searchType,
                    tags: normalizedTags,
                    projectId: selectedProject
                });

                if (!updated) {
                    effectiveHistoryId = saveSearchToHistory(query, results, searchType, normalizedTags, selectedProject);
                }
            } else {
                effectiveHistoryId = saveSearchToHistory(query, results, searchType, normalizedTags, selectedProject);
            }

            // Update sidebar to reflect new usage
            populateProjectsList();
            populateTagsList();

            return effectiveHistoryId;
        }
        
        // ===== EDIT EXISTING SEARCH ORGANIZATION - Phase 4.6 =====
        
        function showEditOrganizationInterface(historyItem) {
            // Remove any existing edit interface or post-search tagging
            const existingInterface = document.getElementById('edit-organization-interface');
            const existingToggle = document.getElementById('edit-organization-toggle');
            const postSearchInterface = document.getElementById('post-search-tagging');
            const postSearchToggle = document.getElementById('post-search-toggle');
            
            if (existingInterface) {
                existingInterface.remove();
            }
            if (existingToggle) {
                existingToggle.remove();
            }
            if (postSearchInterface) {
                postSearchInterface.remove();
            }
            if (postSearchToggle) {
                postSearchToggle.remove();
            }
            
            // Add toggle button for edit organization
            addEditOrganizationToggle(historyItem);
        }
        
        function addEditOrganizationToggle(historyItem) {
            const toggleHTML = `
                <div id="edit-organization-toggle" style="
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    padding: 12px 16px;
                    margin: 16px 0;
                    border-left: 4px solid #f39c12;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    ">
                        <img src="${tagIconUrl}" alt="Tags" style="width: 16px; height: 16px;" />
                        <span style="
                            font-weight: 600;
                            color: #856404;
                            font-size: 14px;
                        ">Edit Organization</span>
                        <span style="
                            font-size: 12px;
                            color: #6c757d;
                        ">Modify tags and project assignment</span>
                    </div>
                    <span id="edit-organization-arrow" style="
                        font-size: 14px;
                        color: #856404;
                        transition: transform 0.2s ease;
                    ">▼</span>
                </div>
                <div id="edit-organization-content" style="display: none;">
                </div>
            `;
            
            // Insert the toggle at the top of results container
            const resultsContainer = document.getElementById('results-container');
            if (resultsContainer) {
                resultsContainer.insertAdjacentHTML('afterbegin', toggleHTML);
                
                // Add click handler for toggle
                const toggle = document.getElementById('edit-organization-toggle');
                const content = document.getElementById('edit-organization-content');
                const arrow = document.getElementById('edit-organization-arrow');
                
                toggle.addEventListener('click', () => {
                    const isHidden = content.style.display === 'none';
                    content.style.display = isHidden ? 'block' : 'none';
                    arrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
                    arrow.textContent = isHidden ? '▲' : '▼';
                    
                    if (isHidden) {
                        // Show the edit interface
                        showActualEditOrganizationInterface(historyItem);
                    } else {
                        // Clear the content
                        content.innerHTML = '';
                    }
                });
            }
        }
        
        function showActualEditOrganizationInterface(historyItem) {
            const tags = loadTags();
            const projects = loadProjects();
            const currentTags = historyItem.tags || [];
            const currentProject = historyItem.projectId || '';
            
            // Create edit interface
            const editHTML = `
                <div id="edit-organization-interface" style="
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    padding: 16px;
                    margin: 16px 0;
                    border-left: 4px solid #f39c12;
                ">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 12px;
                    ">
                        <h4 style="
                            margin: 0;
                            color: #856404;
                            font-size: 14px;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        "><img src="${editIconUrl}" alt="Edit" style="width: 16px; height: 16px;" />Edit Organization</h4>
                        <div style="
                            font-size: 12px;
                            color: #856404;
                        ">Reopened from history • ${historyItem.date}</div>
                    </div>
                    
                    <div style="
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 12px;
                        margin-bottom: 12px;
                    ">
                        <div>
                            <label style="
                                display: block;
                                font-size: 12px;
                                font-weight: 600;
                                color: #856404;
                                margin-bottom: 4px;
                            ">Project</label>
                            <select id="edit-project" style="
                                width: 100%;
                                padding: 6px 8px;
                                border: 1px solid #f1c40f;
                                border-radius: 4px;
                                font-size: 13px;
                                background: white;
                            ">
                                <option value="">No project</option>
                                ${projects.map(project => `
                                    <option value="${project.id}" ${project.id === currentProject ? 'selected' : ''}>${project.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div>
                            <label style="
                                display: block;
                                font-size: 12px;
                                font-weight: 600;
                                color: #856404;
                                margin-bottom: 4px;
                            ">Tags</label>
                            <div id="edit-tags" style="
                                min-height: 32px;
                                border: 1px solid #f1c40f;
                                border-radius: 4px;
                                padding: 4px;
                                background: white;
                                display: flex;
                                flex-wrap: wrap;
                                gap: 4px;
                                align-items: center;
                            ">
                                <button id="add-tag-to-edit" style="
                                    background: none;
                                    border: 1px dashed #f39c12;
                                    color: #f39c12;
                                    padding: 2px 6px;
                                    border-radius: 12px;
                                    font-size: 11px;
                                    cursor: pointer;
                                ">+ Add Tag</button>
                            </div>
                        </div>
                    </div>
                    
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding-top: 8px;
                        border-top: 1px solid #f1c40f;
                    ">
                        <div style="
                            font-size: 12px;
                            color: #856404;
                        ">Changes will update this search in your history</div>
                        <div style="display: flex; gap: 8px;">
                            <button id="cancel-edit" style="
                                background: #6c757d;
                                color: white;
                                border: none;
                                padding: 6px 12px;
                                border-radius: 4px;
                                font-size: 12px;
                                cursor: pointer;
                            ">Cancel</button>
                            <button id="save-edit" style="
                                background: #f39c12;
                                color: white;
                                border: none;
                                padding: 6px 12px;
                                border-radius: 4px;
                                font-size: 12px;
                                cursor: pointer;
                            ">Save Changes</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Insert the interface in the content area
            const content = document.getElementById('edit-organization-content');
            if (content) {
                content.innerHTML = editHTML;
                
                // Initialize the interface with current tags/project
                initializeEditOrganizationInterface(historyItem, currentTags);
            }
        }
        
        function initializeEditOrganizationInterface(historyItem, selectedTags) {
            const selectedTagsSet = new Set(selectedTags);
            
            // Display current tags
            updateEditTagsDisplay(selectedTagsSet);
            
            // Add tag button functionality
            const addTagBtn = document.getElementById('add-tag-to-edit');
            if (addTagBtn) {
                addTagBtn.addEventListener('click', () => {
                    showEditTagSelector(selectedTagsSet);
                });
            }
            
            // Cancel button
            const cancelBtn = document.getElementById('cancel-edit');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    const editInterface = document.getElementById('edit-organization-interface');
                    if (editInterface) {
                        editInterface.remove();
                    }
                });
            }
            
            // Save button
            const saveBtn = document.getElementById('save-edit');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    saveEditedOrganization(historyItem, selectedTagsSet);
                });
            }
        }
        
        function showEditTagSelector(selectedTags) {
            const tags = loadTags();
            const tagsContainer = document.getElementById('edit-tags');
            if (!tagsContainer) return;
            
            // Create dropdown for tag selection
            const dropdown = document.createElement('select');
            dropdown.style.cssText = `
                width: 100%;
                padding: 6px 8px;
                border: 1px solid #f1c40f;
                border-radius: 4px;
                background: white;
                font-size: 12px;
                margin: 2px 0;
            `;
            
            dropdown.innerHTML = `
                <option value="">Select a tag...</option>
                ${tags.filter(tag => !selectedTags.has(tag.id)).map(tag => `
                    <option value="${tag.id}">${tag.name}</option>
                `).join('')}
            `;
            
            dropdown.addEventListener('change', (e) => {
                if (e.target.value) {
                    selectedTags.add(e.target.value);
                    updateEditTagsDisplay(selectedTags);
                    dropdown.remove();
                }
            });
            
            dropdown.addEventListener('blur', () => {
                setTimeout(() => dropdown.remove(), 100);
            });
            
            // Remove any existing dropdowns first
            const existingDropdown = tagsContainer.querySelector('select');
            if (existingDropdown) {
                existingDropdown.remove();
            }
            
            // Insert dropdown in a clean way
            tagsContainer.insertBefore(dropdown, tagsContainer.firstChild);
            dropdown.focus();
        }
        
        function updateEditTagsDisplay(selectedTags) {
            const tagsContainer = document.getElementById('edit-tags');
            if (!tagsContainer) return;
            
            const tags = loadTags();
            
            // Clear existing tags display and any dropdowns
            tagsContainer.innerHTML = '';
            
            // Add selected tags
            selectedTags.forEach(tagId => {
                const tag = tags.find(t => t.id === tagId);
                if (tag) {
                    const tagElement = document.createElement('span');
                    tagElement.style.cssText = `
                        background: ${tag.color}20;
                        color: ${tag.color};
                        border: 1px solid ${tag.color}40;
                        padding: 2px 6px;
                        border-radius: 12px;
                        font-size: 11px;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    `;
                    tagElement.innerHTML = `
                        <img src="${tagIconUrl}" alt="Tag" style="width: 14px; height: 14px;" />
                        <span>${tag.name}</span>
                        <button class="remove-edit-tag-btn" data-tag-id="${tagId}" style="
                            background: none;
                            border: none;
                            color: ${tag.color};
                            cursor: pointer;
                            padding: 0;
                            width: 14px;
                            height: 14px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 10px;
                        ">×</button>
                    `;
                    
                    // Add event listener for remove button
                    const removeBtn = tagElement.querySelector('.remove-edit-tag-btn');
                    removeBtn.addEventListener('click', () => {
                        selectedTags.delete(tagId);
                        updateEditTagsDisplay(selectedTags);
                    });
                    tagsContainer.appendChild(tagElement);
                }
            });
            
            // Re-add the add button
            const addButton = document.createElement('button');
            addButton.id = 'add-tag-to-edit';
            addButton.style.cssText = `
                background: none;
                border: 1px dashed #f39c12;
                color: #f39c12;
                padding: 2px 6px;
                border-radius: 12px;
                font-size: 11px;
                cursor: pointer;
            `;
            addButton.textContent = '+ Add Tag';
            addButton.addEventListener('click', () => showEditTagSelector(selectedTags));
            tagsContainer.appendChild(addButton);
        }
        
        function saveEditedOrganization(historyItem, selectedTags) {
            const projectSelect = document.getElementById('edit-project');
            const newProject = projectSelect ? projectSelect.value || null : null;
            const newTags = Array.from(selectedTags);
            
            // Update the history item
            const history = loadSearchHistory();
            const itemIndex = history.findIndex(h => h.id === historyItem.id);
            
            if (itemIndex !== -1) {
                // Remove old tag usage counts
                if (historyItem.tags) {
                    historyItem.tags.forEach(tagId => {
                        const tags = loadTags();
                        const tag = tags.find(t => t.id === tagId);
                        if (tag && tag.usageCount > 0) {
                            tag.usageCount = Math.max(0, tag.usageCount - 1);
                        }
                        saveTags(tags);
                    });
                }
                
                // Remove old project count
                if (historyItem.projectId) {
                    const projects = loadProjects();
                    const project = projects.find(p => p.id === historyItem.projectId);
                    if (project && project.searchCount > 0) {
                        project.searchCount = Math.max(0, project.searchCount - 1);
                    }
                    saveProjects(projects);
                }
                
                // Update history item
                history[itemIndex] = {
                    ...historyItem,
                    tags: newTags,
                    projectId: newProject
                };
                
                // Update new tag usage counts
                newTags.forEach(tagId => {
                    updateTagUsage(tagId);
                });
                
                // Update new project count
                if (newProject) {
                    updateProjectSearchCount(newProject);
                }
                
                // Save updated history
                localStorage.setItem('chatgpt-product-search-history', JSON.stringify(history));
                
                // Update sidebar to reflect changes
                populateProjectsList();
                populateTagsList();
                
                // Remove edit interface
                const editInterface = document.getElementById('edit-organization-interface');
                if (editInterface) {
                    editInterface.remove();
                }
                
                
                // Show confirmation
                const resultsContainer = document.getElementById('results-container');
                if (resultsContainer) {
                    const confirmation = document.createElement('div');
                    confirmation.style.cssText = `
                        background: #d4edda;
                        border: 1px solid #c3e6cb;
                        border-radius: 4px;
                        padding: 8px 12px;
                        margin: 16px 0;
                        color: #155724;
                        font-size: 13px;
                        text-align: center;
                    `;
                    confirmation.innerHTML = formatStatusMessage('success', 'Organization updated successfully!');
                    confirmation.style.display = 'inline-flex';
                    confirmation.style.alignItems = 'center';
                    confirmation.style.justifyContent = 'center';
                    confirmation.style.gap = '8px';
                    resultsContainer.insertAdjacentElement('afterbegin', confirmation);
                    
                    // Remove confirmation after 3 seconds
                    setTimeout(() => {
                        confirmation.remove();
                    }, 3000);
                }
            }
        }
        
        // ===== END EDIT EXISTING SEARCH ORGANIZATION =====
        
        // ===== END POST-SEARCH TAGGING FUNCTIONALITY =====
        
        // ===== HISTORY ENHANCEMENT FUNCTIONS - Phase 4 =====
        
        function generateHistoryTagsAndProject(item) {
            const tags = loadTags();
            const projects = loadProjects();
            const itemTags = item.tags || [];
            const itemProject = item.projectId;
            
            // Skip if no tags or project
            if (!itemTags.length && !itemProject) {
                return '';
            }
            
            let html = `
                <div style="
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                ">
            `;
            
            // Add project if present
            if (itemProject) {
                const project = projects.find(p => p.id === itemProject);
                if (project) {
                    html += `
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 4px;
                            background: #f8f9fa;
                            border: 1px solid #e9ecef;
                            padding: 2px 6px;
                            border-radius: 12px;
                            font-size: 11px;
                            color: #495057;
                        ">
                            <img src="${projectIconUrl}" alt="Project" style="width: 14px; height: 14px;" />
                            <span>${project.name}</span>
                        </div>
                    `;
                }
            }
            
            // Add tags if present
            if (itemTags.length > 0) {
                itemTags.forEach(tagId => {
                    const tag = tags.find(t => t.id === tagId);
                    if (tag) {
                        html += `
                            <div style="
                                background: ${tag.color}15;
                                color: ${tag.color};
                                border: 1px solid ${tag.color}30;
                                padding: 2px 6px;
                                border-radius: 12px;
                                font-size: 11px;
                                display: flex;
                                align-items: center;
                                gap: 4px;
                            ">
                                <img src="${tagIconUrl}" alt="Tag" style="width: 14px; height: 14px;" />
                                <span>${tag.name}</span>
                            </div>
                        `;
                    }
                });
            }
            
            html += `</div>`;
            return html;
        }
        
        // ===== END HISTORY ENHANCEMENT FUNCTIONS =====
        
        // ===== ADVANCED FILTERING SYSTEM - Phase 5 =====
        
        // Global filter state
        let currentFilters = {
            text: '',
            rawText: '',
            project: '',
            tags: [],
            market: 'all',
            isActive: false
        };
        
        function initializeAdvancedFiltering() {
            // Populate filter dropdowns and checkboxes
            populateFilterOptions();
            
            // Add event listeners
            const toggleBtn = document.getElementById('toggle-filters');
            const applyBtn = document.getElementById('apply-filters');
            const clearBtn = document.getElementById('clear-filters');
            const filterText = document.getElementById('filter-text');
            const filterProject = document.getElementById('filter-project');
            const filterMarket = document.getElementById('filter-market');
            
            if (toggleBtn) {
                toggleBtn.addEventListener('click', toggleFilterPanel);
            }
            
            if (applyBtn) {
                applyBtn.addEventListener('click', applyFilters);
            }
            
            if (clearBtn) {
                clearBtn.addEventListener('click', clearAllFilters);
            }
            
            if (filterText) {
                filterText.addEventListener('input', updateFilterSummary);
            }
            
            if (filterProject) {
                filterProject.addEventListener('change', updateFilterSummary);
            }

            if (filterMarket) {
                filterMarket.addEventListener('change', updateFilterSummary);
            }
        }
        
        function populateFilterOptions() {
            const projects = loadProjects();
            const tags = loadTags();
            const marketSelect = document.getElementById('filter-market');
            
            // Populate projects dropdown
            const projectSelect = document.getElementById('filter-project');
            if (projectSelect) {
                projectSelect.innerHTML = '<option value="">All Projects</option>';
                projects.forEach(project => {
                    const option = document.createElement('option');
                    option.value = project.id;
                    option.textContent = project.name;
                    projectSelect.appendChild(option);
                });
            }

            if (marketSelect) {
                const previousValue = currentFilters.market || 'all';
                marketSelect.innerHTML = '<option value="all">All Markets</option>';
                MARKET_OPTIONS.forEach(option => {
                    const optionEl = document.createElement('option');
                    optionEl.value = option.value;
                    optionEl.textContent = option.label;
                    marketSelect.appendChild(optionEl);
                });
                if (previousValue && marketSelect.querySelector(`option[value="${previousValue}"]`)) {
                    marketSelect.value = previousValue;
                } else {
                    marketSelect.value = 'all';
                    currentFilters.market = 'all';
                }
            }

            // Populate tags checkboxes
            const tagsContainer = document.getElementById('filter-tags');
            if (tagsContainer) {
                tagsContainer.innerHTML = '';
                
                if (tags.length === 0) {
                    tagsContainer.innerHTML = `
                        <div style="
                            color: #6c757d;
                            font-size: 12px;
                            font-style: italic;
                            padding: 8px;
                        ">No tags available</div>
                    `;
                } else {
                    tags.forEach(tag => {
                        const tagCheckbox = document.createElement('label');
                        tagCheckbox.style.cssText = `
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            padding: 4px 8px;
                            border-radius: 12px;
                            background: ${tag.color}15;
                            border: 1px solid ${tag.color}30;
                            cursor: pointer;
                            font-size: 12px;
                            color: ${tag.color};
                            white-space: nowrap;
                        `;
                        
                        tagCheckbox.innerHTML = `
                            <input type="checkbox" value="${tag.id}" style="
                                margin: 0;
                                width: 12px;
                                height: 12px;
                            " />
                            <img src="${tagIconUrl}" alt="Tag" style="width: 14px; height: 14px;" />
                            <span>${tag.name}</span>
                        `;
                        
                        const checkbox = tagCheckbox.querySelector('input');
                        checkbox.addEventListener('change', updateFilterSummary);
                        
                        tagsContainer.appendChild(tagCheckbox);
                    });
                }
            }

            updateFilterSummary();
        }
        
        function toggleFilterPanel() {
            const panel = document.getElementById('filter-panel');
            const toggleText = document.getElementById('filter-toggle-text');
            
            if (panel && toggleText) {
                const isVisible = panel.style.display !== 'none';
                panel.style.display = isVisible ? 'none' : 'block';
                toggleText.textContent = isVisible ? 'Filters' : 'Hide Filters';
            }
        }
        
        function updateFilterSummary() {
            const filterText = document.getElementById('filter-text');
            const filterProject = document.getElementById('filter-project');
            const filterMarket = document.getElementById('filter-market');
            const tagCheckboxes = document.querySelectorAll('#filter-tags input[type="checkbox"]:checked');
            const summary = document.getElementById('filter-summary');
            
            if (!summary) return;
            
            let activeCount = 0;
            let summaryParts = [];
            
            if (filterText && filterText.value.trim()) {
                activeCount++;
                summaryParts.push('text search');
            }
            
            if (filterProject && filterProject.value) {
                activeCount++;
                const selectedProject = loadProjects().find(p => p.id === filterProject.value);
                summaryParts.push(`project: ${selectedProject?.name || 'Unknown'}`);
            }

            if (filterMarket && filterMarket.value && filterMarket.value !== 'all') {
                activeCount++;
                const marketOption = getMarketOption(filterMarket.value);
                summaryParts.push(`market: ${marketOption.label}`);
            }

            if (tagCheckboxes.length > 0) {
                activeCount++;
                summaryParts.push(`${tagCheckboxes.length} tag${tagCheckboxes.length > 1 ? 's' : ''}`);
            }
            
            if (activeCount === 0) {
                summary.textContent = 'No filters applied';
            } else {
                summary.textContent = `${activeCount} filter${activeCount > 1 ? 's' : ''} ready: ${summaryParts.join(', ')}`;
            }
        }
        
        function applyFilters() {
            const filterText = document.getElementById('filter-text');
            const filterProject = document.getElementById('filter-project');
            const tagCheckboxes = document.querySelectorAll('#filter-tags input[type="checkbox"]:checked');
            
            const rawText = filterText ? filterText.value.trim() : '';
            const normalizedText = rawText.toLowerCase();

            // Update global filter state
            const filterMarket = document.getElementById('filter-market');

            const nextProject = filterProject ? filterProject.value : '';
            const nextTags = Array.from(tagCheckboxes).map(cb => cb.value);
            const nextMarket = filterMarket ? filterMarket.value : 'all';

            currentFilters = {
                text: normalizedText,
                rawText: rawText,
                project: nextProject,
                tags: nextTags,
                market: nextMarket,
                isActive: Boolean(normalizedText || nextProject || nextTags.length > 0 || (nextMarket && nextMarket !== 'all'))
            };
            
            // Apply filters to history
            const history = loadSearchHistory();
            const filteredHistory = applyAdvancedFilters(history);
            renderHistoryList(filteredHistory);
            
            // Update filter chips display
            updateFilterChips();
            updateFilterSummary();
            
            // Sync filters to Analysis tab
            syncAnalysisFiltersWithHistoryFilters();
            
            // Hide filter panel
            const panel = document.getElementById('filter-panel');
            const toggleText = document.getElementById('filter-toggle-text');
            if (panel) panel.style.display = 'none';
            if (toggleText) toggleText.textContent = 'Filters';
            
        }
        
        function applyAdvancedFilters(history) {
            if (!currentFilters.isActive && !currentFilters.text && !currentFilters.project && currentFilters.tags.length === 0 && (!currentFilters.market || currentFilters.market === 'all')) {
                return history;
            }
            
            return history.filter(item => {
                // Text filter - search in query, rationale, and review summary
                if (currentFilters.text) {
                    const searchableText = [
                        item.query || '',
                        item.results?.rationale || '',
                        item.results?.reviewSummary || '',
                        ...(item.results?.reviews || []).map(r => r.content || ''),
                        ...(item.results?.citations || []).map(c => c.snippet || ''),
                        ...(item.results?.productLinks || []).map(p => p.title || '')
                    ].join(' ').toLowerCase();
                    
                    if (!searchableText.includes(currentFilters.text)) {
                        return false;
                    }
                }
                
                // Project filter
                if (currentFilters.project) {
                    if (item.projectId !== currentFilters.project) {
                        return false;
                    }
                }
                
                // Tags filter - item must have ALL selected tags (AND logic)
                if (currentFilters.tags.length > 0) {
                    const itemTags = item.tags || [];
                    if (!currentFilters.tags.every(tagId => itemTags.includes(tagId))) {
                        return false;
                    }
                }

                // Market filter - match stored market value (legacy entries may not have market)
                if (currentFilters.market && currentFilters.market !== 'all') {
                    const itemMarket = item.market || null;
                    if (itemMarket !== currentFilters.market) {
                        return false;
                    }
                }

                return true;
            });
        }
        
        function updateFilterChips() {
            const activeFiltersDiv = document.getElementById('active-filters');
            const filterChips = document.getElementById('filter-chips');
            
            if (!activeFiltersDiv || !filterChips) return;
            
            // Clear existing chips
            filterChips.innerHTML = '';
            
            let hasActiveFilters = false;
            
            // Text filter chip
            if (currentFilters.text) {
                hasActiveFilters = true;
                const chip = createFilterChip('text', `Text: "${currentFilters.text}"`, () => {
                    currentFilters.text = '';
                    const filterText = document.getElementById('filter-text');
                    if (filterText) filterText.value = '';
                    applyFilters();
                });
                filterChips.appendChild(chip);
            }
            
            // Project filter chip
            if (currentFilters.project) {
                hasActiveFilters = true;
                const project = loadProjects().find(p => p.id === currentFilters.project);
                const chip = createFilterChip('project', `<span style="display:flex; align-items:center; gap:4px;"><img src="${projectIconUrl}" alt="Project" style="width: 14px; height: 14px;" />${project?.name || 'Unknown Project'}</span>`, () => {
                    currentFilters.project = '';
                    const filterProject = document.getElementById('filter-project');
                    if (filterProject) filterProject.value = '';
                    applyFilters();
                });
                filterChips.appendChild(chip);
            }

            if (currentFilters.market && currentFilters.market !== 'all') {
                hasActiveFilters = true;
                const option = getMarketOption(currentFilters.market);
                const chip = createFilterChip('market', `🌍 ${option.label}`, () => {
                    currentFilters.market = 'all';
                    const filterMarket = document.getElementById('filter-market');
                    if (filterMarket) filterMarket.value = 'all';
                    applyFilters();
                });
                filterChips.appendChild(chip);
            }

            // Tag filter chips
            if (currentFilters.tags.length > 0) {
                hasActiveFilters = true;
                const tags = loadTags();
                currentFilters.tags.forEach(tagId => {
                    const tag = tags.find(t => t.id === tagId);
                    if (tag) {
                        const chip = createFilterChip('tag', tag.name, () => {
                            currentFilters.tags = currentFilters.tags.filter(id => id !== tagId);
                            const checkbox = document.querySelector(`#filter-tags input[value="${tagId}"]`);
                            if (checkbox) checkbox.checked = false;
                            applyFilters();
                        }, tag.color);
                        filterChips.appendChild(chip);
                    }
                });
            }
            
            // Show/hide active filters section
            activeFiltersDiv.style.display = hasActiveFilters ? 'block' : 'none';
        }
        
        function createFilterChip(type, text, onRemove, color = '#007bff') {
            const chip = document.createElement('div');
            chip.style.cssText = `
                display: flex;
                align-items: center;
                gap: 6px;
                background: ${color}15;
                color: ${color};
                border: 1px solid ${color}30;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                white-space: nowrap;
            `;
            
            chip.innerHTML = `
                <span>${text}</span>
                <button style="
                    background: none;
                    border: none;
                    color: ${color};
                    cursor: pointer;
                    padding: 0;
                    width: 14px;
                    height: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    border-radius: 50%;
                ">×</button>
            `;
            
            const removeBtn = chip.querySelector('button');
            removeBtn.addEventListener('click', onRemove);
            
            return chip;
        }
        
        function clearAllFilters() {
            // Reset form
            const filterText = document.getElementById('filter-text');
            const filterProject = document.getElementById('filter-project');
            const filterMarket = document.getElementById('filter-market');
            const tagCheckboxes = document.querySelectorAll('#filter-tags input[type="checkbox"]');
            
            if (filterText) filterText.value = '';
            if (filterProject) filterProject.value = '';
            if (filterMarket) filterMarket.value = 'all';
            tagCheckboxes.forEach(cb => cb.checked = false);
            
            // Reset global state
            currentFilters = {
                text: '',
                rawText: '',
                project: '',
                tags: [],
                market: 'all',
                isActive: false
            };
            
            // Show all history
            const history = loadSearchHistory();
            renderHistoryList(history);
            
            // Update UI
            updateFilterSummary();
            updateFilterChips();
            
        }
        
        // ===== SIDEBAR-TO-FILTER INTEGRATION =====
        
        function filterByProject(projectId) {
            const tab = typeof _activeTab === 'function' ? _activeTab() : (typeof getActiveTab === 'function' ? getActiveTab() : 'history');
            if (tab === 'reports') {
                _applyToAnalysis({ projectId });
                return;
            }
            _applyToHistory({ projectId });
        }

        function filterByTag(tagId) {
            const tab = typeof _activeTab === 'function' ? _activeTab() : (typeof getActiveTab === 'function' ? getActiveTab() : 'history');
            if (tab === 'reports') {
                _applyToAnalysis({ tagId });
                return;
            }
            _applyToHistory({ tagId });
        }
        
        // ===== END SIDEBAR-TO-FILTER INTEGRATION =====
        
        // ===== END ADVANCED FILTERING SYSTEM =====

        // ===== END SIDEBAR FUNCTIONALITY =====







        function deleteHistoryItem(itemId) {
            try {
                const history = loadSearchHistory();
                const itemToDelete = history.find(item => item.id === itemId);
                
                // Decrement counts before deleting
                if (itemToDelete) {
                    // Decrement project count
                    if (itemToDelete.projectId) {
                        decrementProjectSearchCount(itemToDelete.projectId);
                    }
                    
                    // Decrement tag usage counts
                    if (itemToDelete.tags && Array.isArray(itemToDelete.tags)) {
                        itemToDelete.tags.forEach(tagId => {
                            if (tagId) {
                                decrementTagUsage(tagId);
                            }
                        });
                    }
                }
                
                const filteredHistory = history.filter(item => item.id !== itemId);
                localStorage.setItem('chatgpt-product-search-history', JSON.stringify(filteredHistory));
                loadHistory();
                
                // Update sidebar to reflect new counts
                populateProjectsList();
                populateTagsList();
            } catch (error) {
                console.error('Error deleting history item:', error);
            }
        }

        function resetToCleanSearchState() {
            // Clear search input fields
            const searchQuery = document.getElementById('search-query');
            const multiSearchQuery = document.getElementById('multi-search-query');
            const multiProductToggle = document.getElementById('multi-product-toggle');
            
            if (searchQuery) {
                searchQuery.value = '';
            }
            if (multiSearchQuery) {
                multiSearchQuery.value = '';
            }
            if (multiProductToggle) {
                multiProductToggle.checked = false;
                // Trigger change event to update UI
                multiProductToggle.dispatchEvent(new Event('change'));
            }
            
            // Remove any organization interfaces
            const editToggle = document.getElementById('edit-organization-toggle');
            const editContent = document.getElementById('edit-organization-content');
            const postSearchToggle = document.getElementById('post-search-toggle');
            const postSearchContent = document.getElementById('post-search-content');
            
            if (editToggle) editToggle.remove();
            if (editContent) editContent.remove();
            if (postSearchToggle) postSearchToggle.remove();
            if (postSearchContent) postSearchContent.remove();
            
            // Reset results container to welcome state
            const resultsContainer = document.getElementById('results-container');
            if (resultsContainer) {
                resultsContainer.innerHTML = `
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
                        <img src="${searchIconUrl}" alt="Search" style="width: 48px; height: 48px; margin-bottom: 20px; opacity: 0.7;" />
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
                            border-radius: 4px;
                            font-size: 12px;
                            font-weight: 600;
                        ">
                            <span style="color: #28a745;">✓ Ready to search</span>
                        </div>
                    </div>
                `;
            }
        }


        function loadHistory() {

            // Force-hide other containers so nothing leaks into History
            const searchArea = document.getElementById('search-area');
            const resultsContainer = document.getElementById('results-container');
            const reportsContainer = document.getElementById('reports-container');
            const historyContainer = document.getElementById('history-container');
            if (searchArea) searchArea.style.display = 'none';
            if (resultsContainer) resultsContainer.style.display = 'none';
            if (reportsContainer) reportsContainer.style.display = 'none';
            if (historyContainer) historyContainer.style.display = 'block';
            
            const history = loadSearchHistory();
            const historyWelcome = document.getElementById('history-welcome-state');
            const historyContent = document.getElementById('history-content');
            const historyList = document.getElementById('history-list');
            const clearHistoryBtn = document.getElementById('clear-history-btn');

            // Ensure history elements are visible again after visiting other tabs
            ['history-content', 'history-welcome-state', 'history-list'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.style.visibility = 'visible';
                }
            });

            if (history.length === 0) {
                historyWelcome.style.display = 'flex';
                historyContent.style.display = 'none';
                if (clearHistoryBtn) {
                    clearHistoryBtn.style.display = 'none';
                }
            } else {
                historyWelcome.style.display = 'none';
                historyContent.style.display = 'block';
                if (clearHistoryBtn) {
                    clearHistoryBtn.style.display = 'block';
                }
                
                // Initialize advanced filtering system
                initializeAdvancedFiltering();

                // Restore filter UI to match current filter state
                const filterTextField = document.getElementById('filter-text');
                const filterProjectField = document.getElementById('filter-project');
                const filterTagCheckboxes = document.querySelectorAll('#filter-tags input[type="checkbox"]');

                if (filterTextField) {
                    filterTextField.value = currentFilters.rawText || '';
                }
                if (filterProjectField) {
                    filterProjectField.value = currentFilters.project || '';
                }
                if (filterTagCheckboxes.length > 0) {
                    const activeTags = new Set(currentFilters.tags || []);
                    filterTagCheckboxes.forEach(cb => {
                        cb.checked = activeTags.has(cb.value);
                    });
                }

                currentFilters.isActive = Boolean(
                    (currentFilters.rawText && currentFilters.rawText.trim().length) ||
                    (currentFilters.project && currentFilters.project.length) ||
                    (currentFilters.tags && currentFilters.tags.length)
                );
                
                if (typeof updateFilterSummary === 'function') {
                    updateFilterSummary();
                }
                if (typeof updateFilterChips === 'function') {
                    updateFilterChips();
                }
                
                // Apply current filters (if any) or show all
                const filteredHistory = applyAdvancedFilters(history);
                renderHistoryList(filteredHistory);
            }
        }

        function renderHistoryList(history) {
            const historyList = document.getElementById('history-list');
            if (!historyList) return;

            historyList.innerHTML = history.map(item => `
                <div class="history-item" data-id="${item.id}" style="
                    background: white;
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 12px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                ">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 8px;
                    ">
                        <div style="
                            font-size: 16px;
                            font-weight: 600;
                            color: #495057;
                            margin-bottom: 4px;
                        ">${item.searchType === 'multi' ? 
                            item.query.split('\n').map(q => 
                                `<span style="
                                    display: inline-block;
                                    background: #e3f2fd;
                                    color: #1565c0;
                                    padding: 4px 8px;
                                    border-radius: 12px;
                                    font-size: 13px;
                                    margin: 2px 4px 2px 0;
                                    border: 1px solid #bbdefb;
                                ">${q.trim()}</span>`
                            ).join('') 
                            : `<span style="
                                display: inline-block;
                                background: #e3f2fd;
                                color: #1565c0;
                                padding: 4px 8px;
                                border-radius: 12px;
                                font-size: 13px;
                                margin: 2px 4px 2px 0;
                                border: 1px solid #bbdefb;
                            ">${item.query}</span>`
                        }</div>
                        <div style="display: flex; gap: 8px;">
                            <button class="reopen-search-btn" data-id="${item.id}" style="
                                background: #007bff;
                                color: white;
                                border: none;
                                padding: 4px 8px;
                                border-radius: 4px;
                                font-size: 12px;
                                cursor: pointer;
                                white-space: nowrap;
                            ">Open</button>
                            <button class="delete-history-btn" data-id="${item.id}" style="
                                background: #dc3545;
                                color: white;
                                border: none;
                                padding: 4px 8px;
                                border-radius: 4px;
                                font-size: 12px;
                                cursor: pointer;
                            ">Delete</button>
                        </div>
                    </div>
                    <div style="
                        font-size: 12px;
                        color: #6c757d;
                        margin-bottom: 8px;
                    " ${item.marketLabel ? `title="${item.marketLabel}"` : ''}>
                        ${item.date} • ${item.searchType === 'multi' ? 'Multi-product search' : 'Single search'}${item.market ? ` • ${renderMarketBadge(item.market, item.marketCode, item.marketLabel)}` : (item.marketCode ? ` • ${item.marketCode}` : '')}
                    </div>
                    ${generateHistoryTagsAndProject(item)}
                    <div style="
                        font-size: 13px;
                        color: #6c757d;
                        display: flex;
                        gap: 16px;
                    ">
                        <span>${item.results.summary?.total_reviews || 0} reviews</span>
                        <span>${item.results.summary?.total_products || 0} products</span>
                        <span>${item.results.summary?.total_product_links || 0} links</span>
                    </div>
                </div>
            `).join('');

            // Add event listeners for history items
            document.querySelectorAll('.reopen-search-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const itemId = btn.getAttribute('data-id');
                    reopenSearch(itemId);
                });
            });

            document.querySelectorAll('.delete-history-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const itemId = btn.getAttribute('data-id');
                    deleteHistoryItem(itemId);
                });
            });

            // Add hover effects
            document.querySelectorAll('.history-item').forEach(item => {
                item.addEventListener('mouseenter', () => {
                    item.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    item.style.transform = 'translateY(-2px)';
                });
                item.addEventListener('mouseleave', () => {
                    item.style.boxShadow = 'none';
                    item.style.transform = 'translateY(0)';
                });
                item.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('reopen-search-btn') && 
                        !e.target.classList.contains('delete-history-btn')) {
                        const itemId = item.getAttribute('data-id');
                        reopenSearch(itemId);
                    }
                });
            });
            
            // NUCLEAR SAFEGUARD: Ensure no analysis content has been accidentally added to history
            const historyContainer = document.getElementById('history-container');
            if (historyContainer) {
                const analysisResults = historyContainer.querySelector('#analysis-results');
                const analysisContent = historyContainer.querySelector('#analysis-content');
                const citationTable = historyContainer.querySelector('#citation-sources-table');
                const reviewTable = historyContainer.querySelector('#review-sources-table');
                
                if (analysisResults) {
                    analysisResults.remove();
                }
                if (analysisContent) {
                    analysisContent.remove();
                }
                if (citationTable) {
                    citationTable.remove();
                }
                if (reviewTable) {
                    reviewTable.remove();
                }
            }
        }

        function toggleMultiProductSearch() {
            const multiProductToggle = document.getElementById('multi-product-toggle');
            const toggleBackground = document.getElementById('toggle-background');
            const toggleSlider = document.getElementById('toggle-slider');
            const singleProductInput = document.getElementById('single-product-input');
            const multiProductInput = document.getElementById('multi-product-input');

            if (!multiProductToggle) return;

            const isMultiMode = multiProductToggle.checked;
            
            if (isMultiMode) {
                // Switch to multi-product mode
                if (singleProductInput) singleProductInput.style.display = 'none';
                if (multiProductInput) multiProductInput.style.display = 'block';
                if (toggleBackground) toggleBackground.style.background = '#007bff';
                if (toggleSlider) toggleSlider.style.transform = 'translateX(20px)';
            } else {
                // Switch to single-product mode
                if (singleProductInput) singleProductInput.style.display = 'flex';
                if (multiProductInput) multiProductInput.style.display = 'none';
                if (toggleBackground) toggleBackground.style.background = '#dee2e6';
                if (toggleSlider) toggleSlider.style.transform = 'translateX(0px)';
            }

            moveMarketSelector(isMultiMode);
        }

        function reopenSearch(itemId) {
            const history = loadSearchHistory();
            const item = history.find(h => h.id === itemId);
            if (!item) return;

            // Switch to search tab
            switchTab('search');

            if (item.market) {
                setMarketSelection(item.market);
            }

            // Fill search query
            const searchQuery = document.getElementById('search-query');
            const multiSearchQuery = document.getElementById('multi-search-query');
            const multiProductToggle = document.getElementById('multi-product-toggle');

            if (item.searchType === 'multi') {
                // Multi-product search
                if (multiProductToggle) {
                    multiProductToggle.checked = true;
                    toggleMultiProductSearch();
                }
                if (multiSearchQuery) {
                    multiSearchQuery.value = item.query;
                }
            } else {
                // Single search
                if (multiProductToggle) {
                    multiProductToggle.checked = false;
                    toggleMultiProductSearch();
                }
                if (searchQuery) {
                    searchQuery.value = item.query;
                }
            }

            // Display the results
            if (item.searchType === 'multi' && item.results.multiResults) {
                displayMultiResults(item.results.multiResults);
            } else {
                displayResults(item.results, item.query);
            }
            showCollapseToggle();
            
            // Add edit organization interface for reopened searches
            showEditOrganizationInterface(item);
        }

        function filterHistory() {
            // Legacy function - now redirects to advanced filtering
            // This maintains compatibility with existing event listeners
            applyFilters();
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

            const marketSettings = getSelectedMarketSettings();
            
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
            resultsContainer.style.display = 'block';
            resultsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <div class="cpr-loading-spinner"></div>
                    <p>Searching for "${query}"...</p>
                </div>
            `;
            
            try {
                const result = await searchProduct(query, token, marketSettings);
                displayResults(result, query);
                const historyId = saveSearchToHistory(query, result, 'single', [], null, marketSettings.value);
                
                // Show post-search tagging interface
                showPostSearchTagging(query, result, 'single', historyId);
            } catch (error) {
                displayError(error.message);
            } finally {
                searchBtn.disabled = false;
                searchBtn.textContent = 'Search';
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
            
            // Remove duplicates (case-insensitive) to avoid unnecessary requests
            const uniqueQueries = [...new Set(queries.map(q => q.toLowerCase()))].map(lowerQuery => {
                // Find the original case version of this query
                return queries.find(originalQuery => originalQuery.toLowerCase() === lowerQuery);
            });
            
            if (uniqueQueries.length === 0) {
                alert('Please enter at least one product name');
                return;
            }
            
            // Show info if duplicates were removed
            if (queries.length > uniqueQueries.length) {
            }
            
            // If only one unique query remains, treat as single product search
            if (uniqueQueries.length === 1) {
                const singleQuery = document.getElementById('search-query');
                if (singleQuery) {
                    singleQuery.value = uniqueQueries[0];
                    // Trigger single search instead
                    await performSearch();
                    return;
                }
            }
            
            if (uniqueQueries.length > 10) {
                alert('Maximum 10 products allowed at once to avoid rate limiting');
                return;
            }

            const marketSettings = getSelectedMarketSettings();

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
            resultsContainer.style.display = 'block';
            resultsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <div class="cpr-loading-spinner"></div>
                    <p>Searching ${uniqueQueries.length} products...</p>
                    <div id="progress-status" style="font-size: 14px; color: #999; margin-top: 10px;">
                        Starting searches...
                    </div>
                </div>
            `;
            
            const results = [];
            const progressStatus = document.getElementById('progress-status');
            
            try {
                // Search products one by one
                for (let i = 0; i < uniqueQueries.length; i++) {
                    const query = uniqueQueries[i].trim();
                    if (progressStatus) {
                        progressStatus.textContent = `Searching "${query}" (${i + 1}/${uniqueQueries.length})...`;
                    }
                    
                    try {
                        const result = await searchProduct(query, token, marketSettings);
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
                    if (i < uniqueQueries.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
                
                displayMultiResults(results);

                // Show post-search tagging interface for multi-search
                const queriesText = uniqueQueries.join('\n');
                const combinedResults = {
                    summary: {
                        total_reviews: results.reduce((acc, r) => acc + (r.success ? (r.data.summary?.total_reviews || 0) : 0), 0),
                        total_products: results.reduce((acc, r) => acc + (r.success ? (r.data.summary?.total_products || 0) : 0), 0),
                        total_product_links: results.reduce((acc, r) => acc + (r.success ? (r.data.summary?.total_product_links || 0) : 0), 0),
                        review_themes: []
                    },
                    multiResults: results,
                    rationale: `Multi-product search for ${queries.length} products`,
                    reviewSummary: `Combined results from ${results.filter(r => r.success).length} successful searches`
                };
                const historyId = saveSearchToHistory(queriesText, combinedResults, 'multi', [], null, marketSettings.value);
                showPostSearchTagging(queriesText, combinedResults, 'multi', historyId);
            } catch (error) {
                displayError(error.message);
            } finally {
                multiSearchBtn.disabled = false;
                multiSearchBtn.textContent = 'Search All Products';
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
                    applyInputStatusStyles(tokenInput, {
                        text: 'Token fetched from session',
                        iconUrl: checkIconUrl,
                        color: '#155724',
                        backgroundColor: '#d4edda',
                        borderColor: '#c3e6cb'
                    });
                    tokenInput.readOnly = true;
                    tokenInput.style.cursor = 'not-allowed';
                }
                
                return sessionData.accessToken;
            } catch (error) {
                // Update the token input field to show error
                const tokenInput = document.getElementById('auth-token');
                if (tokenInput) {
                    applyInputStatusStyles(tokenInput, {
                        text: 'Failed to fetch token automatically',
                        iconUrl: errorIconUrl,
                        color: '#721c24',
                        backgroundColor: '#f8d7da',
                        borderColor: '#f5c6cb'
                    });
                    tokenInput.readOnly = false;
                    tokenInput.style.cursor = "text";
                }
                
                throw error;
            }
        }

        async function searchProduct(query, token, marketSettings = getSelectedMarketSettings()) {
            const effectiveMarket = marketSettings || getSelectedMarketSettings();
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
                    "accept-language": effectiveMarket.acceptLanguage,
                    "authorization": "Bearer " + token,
                    "content-type": "application/json",
                    "oai-client-version": "prod-43c98f917bf2c3e3a36183e9548cd048e4e40615",
                    "oai-device-id": generateDeviceId(),
                    "oai-language": effectiveMarket.oaiLanguage || 'en-US',
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

        function getFaviconUrl(url) {
            try {
                const urlObj = new URL(url);
                const domain = urlObj.protocol + '//' + urlObj.hostname;
                return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(domain)}&size=16`;
            } catch (e) {
                // Fallback for invalid URLs
                return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(url)}&size=16`;
            }
        }

        // Function to create floating button
        function createFloatingButton() {
            const button = document.createElement('button');
            button.id = 'openProductSearchModalBtn';
            button.title = 'Open ChatGPT Product Info Research';
            const iconBase = (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function')
                ? chrome.runtime.getURL('icons/logobubble.svg')
                : null;

            if (iconBase) {
                const iconImg = document.createElement('img');
                iconImg.src = iconBase;
                iconImg.alt = 'ChatGPT Product Info';
                iconImg.style.pointerEvents = 'none';
                button.appendChild(iconImg);
            } else {
                button.textContent = '🛍️';
                button.classList.add('icon-fallback');
            }
            document.body.appendChild(button);
            return button;
        }

        // Create floating button and add click handler
        const floatingButton = createFloatingButton();
        floatingButton.addEventListener('click', createModal);

        // Initialize token status check
        async function initializeTokenStatus() {
            const tokenInput = document.getElementById('auth-token');
            const authStatus = document.getElementById('auth-status');
            
            if (!tokenInput || !authStatus) {
                return;
            }
            
            try {
                const response = await fetch("/api/auth/session");
                if (response.ok) {
                    const sessionData = await response.json();
                    if (sessionData.accessToken) {
                        // Update hidden token field
                        if (tokenInput) {
                            applyInputStatusStyles(tokenInput, {
                                text: 'Token ready - session active',
                                iconUrl: checkIconUrl,
                                color: '#155724',
                                backgroundColor: '#d4edda',
                                borderColor: '#c3e6cb'
                            });
                            tokenInput.readOnly = true;
                            tokenInput.style.cursor = 'not-allowed';
                        }
                        
                        // Update visible auth status
                        if (authStatus) {
                            applyStatusBanner(authStatus, {
                                iconType: 'success',
                                text: 'Ready to search',
                                color: '#155724',
                                backgroundColor: '#d4edda',
                                borderColor: '#c3e6cb'
                            });
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
                    applyInputStatusStyles(tokenInput, {
                        text: 'Please log in to ChatGPT first',
                        iconUrl: errorIconUrl,
                        color: '#721c24',
                        backgroundColor: '#f8d7da',
                        borderColor: '#f5c6cb'
                    });
                    tokenInput.readOnly = false;
                    tokenInput.style.cursor = 'text';
                }
                
                // Update visible auth status
                if (authStatus) {
                    applyStatusBanner(authStatus, {
                        iconType: 'error',
                        text: 'Please log in to ChatGPT first',
                        color: '#721c24',
                        backgroundColor: '#f8d7da',
                        borderColor: '#f5c6cb'
                    });
                }
            }
        }

        // Parse product info from API response
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
            
            productLinks.forEach((link, index) => {
            });
            
            // Remove exact duplicates (same title AND url) while preserving different sources
            const deduplicatedLinks = [];
            const seenCombinations = new Set();
            
            productLinks.forEach(link => {
                const key = `${link.title}|||${link.url}`;
                if (!seenCombinations.has(key)) {
                    seenCombinations.add(key);
                    deduplicatedLinks.push(link);
                } else {
                }
            });
            
            
            return {
                products: products,
                productLinks: deduplicatedLinks, // Use deduplicated product links
                reviews: reviews,
                rationale: rationaleObj.text || null,
                reviewSummary: summaryObj.text || null, // Add the built summary
                summary: {
                    total_products: products.length,
                    total_product_links: deduplicatedLinks.length,
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
                        
                        
                    // Handle supporting_websites array
                    if (patch.p === '/grouped_citation/supporting_websites' && patch.o === 'append' && patch.v && Array.isArray(patch.v)) {
                        for (const supportingSite of patch.v) {
                            if (supportingSite.url) {
                                const productLink = {
                                    title: supportingSite.title || 'Supporting Link',
                                    url: supportingSite.url,
                                    snippet: supportingSite.snippet || '',
                                    source: extractDomainFromUrl(supportingSite.url)
                                };
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
                        
                        // Capture ALL grouped_citation objects as product links
                        const productLink = {
                            title: patch.v.title || '',
                            url: patch.v.url,
                            snippet: patch.v.snippet || '',
                            source: extractDomainFromUrl(patch.v.url)
                        };
                        
                        productLinks.push(productLink);
                    }
                        
                    // Handle supporting_websites array in patch operations too
                    if (patch.p === '/grouped_citation/supporting_websites' && patch.o === 'append' && patch.v && Array.isArray(patch.v)) {
                        for (const supportingSite of patch.v) {
                            if (supportingSite.url) {
                                const productLink = {
                                    title: supportingSite.title || 'Supporting Link',
                                    url: supportingSite.url,
                                    snippet: supportingSite.snippet || '',
                                    source: extractDomainFromUrl(supportingSite.url)
                                };
                                productLinks.push(productLink);
                            }
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

        // Determine theme sentiment color styling for review themes
        function getThemeColor(theme, reviews) {
            if (!reviews || reviews.length === 0) {
                return { background: '#f8f9fa', color: '#6c757d' };
            }

            const themeReviews = reviews.filter(review =>
                review.theme && review.theme.toLowerCase() === theme.toLowerCase()
            );

            if (themeReviews.length === 0) {
                const sentimentCounts = reviews.reduce((acc, review) => {
                    acc[review.sentiment] = (acc[review.sentiment] || 0) + 1;
                    return acc;
                }, {});

                const totalReviews = reviews.length;
                const positivePercent = (sentimentCounts.positive || 0) / totalReviews;
                const negativePercent = (sentimentCounts.negative || 0) / totalReviews;

                if (positivePercent > 0.6) {
                    return { background: '#d1f2d1', color: '#2d5a2d' };
                }
                if (negativePercent > 0.6) {
                    return { background: '#f8d7da', color: '#721c24' };
                }
                
                return { background: '#fff3cd', color: '#856404' };
            }

            const themeSentimentCounts = themeReviews.reduce((acc, review) => {
                acc[review.sentiment] = (acc[review.sentiment] || 0) + 1;
                return acc;
            }, {});

            const themeTotal = themeReviews.length;
            const positivePercent = (themeSentimentCounts.positive || 0) / themeTotal;
            const negativePercent = (themeSentimentCounts.negative || 0) / themeTotal;

            if (positivePercent > negativePercent && positivePercent > 0.5) {
                return { background: '#d1f2d1', color: '#2d5a2d' };
            }
            if (negativePercent > positivePercent && negativePercent > 0.5) {
                return { background: '#f8d7da', color: '#721c24' };
            }

            return { background: '#fff3cd', color: '#856404' };
        }

        function displayResults(data, query) {
            const resultsContainer = document.getElementById('results-container');
            if (!resultsContainer) {
                return;
            }

            resultsContainer.style.display = 'block';
            
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
                    padding: 6px 12px;
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
                            padding: 6px 12px;
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
                            padding: 6px 12px;
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
                                padding: 6px 12px;
                                margin: 0 12px 8px 12px;
                                background: #f8f9fa;
                            ">
                                <div style="
                                    display: flex;
                                    align-items: center;
                                    margin-bottom: 6px;
                                    gap: 8px;
                                ">
                                    <img src="${getFaviconUrl(link.url)}" 
                                         alt="Site favicon" 
                                         style="
                                             width: 16px;
                                             height: 16px;
                                             flex-shrink: 0;
                                         " 
                                         onerror="this.style.display='none'" />
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
                                    padding: 6px 12px;
                                    margin-bottom: 1px;
                                ">
                                    <div style="
                                        display: flex;
                                        align-items: center;
                                        margin-bottom: 8px;
                                        gap: 8px;
                                    ">
                                        ${review.url ? `<img src="${getFaviconUrl(review.url)}" 
                                                             alt="Site favicon" 
                                                             style="
                                                                 width: 16px;
                                                                 height: 16px;
                                                                 flex-shrink: 0;
                                                             " 
                                                             onerror="this.style.display='none'" />` : ''}
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
                            ${data.summary.review_themes.map(theme => {
                                const colors = getThemeColor(theme, data.reviews);
                                return `<span style="
                                    background: ${colors.background};
                                    color: ${colors.color};
                                    padding: 4px 8px;
                                    border-radius: 12px;
                                    font-size: 12px;
                                    border: 1px solid ${colors.background === '#d1f2d1' ? '#c3e6cb' : colors.background === '#f8d7da' ? '#f5c6cb' : '#ffeaa7'};
                                ">${theme}</span>`;
                            }).join('')}
                        </div>
                    </div>
                `;
            }
            
            resultsContainer.innerHTML = html;
        }

        function displayMultiResults(results) {
            const resultsContainer = document.getElementById('results-container');
            if (!resultsContainer) {
                return;
            }

            resultsContainer.style.display = 'block';
            
            const successfulResults = results.filter(r => r.success);
            const failedResults = results.filter(r => !r.success);
            
            let html = `
                <div style="
                    padding: 6px 12px;
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
                            padding: 6px 12px;
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
                        <span class="status-icon status-icon--large status-icon--error" aria-hidden="true" style="margin-bottom: 20px; color: #dc3545; opacity: 0.8;"></span>
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
                                    ">Themes</th>
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
                
                // Get all themes instead of just top 3
                const topThemes = data.summary.review_themes;
                
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
                            ${topThemes.length > 0 ? topThemes.map(theme => {
                                const colors = getThemeColor(theme, data.reviews);
                                return `
                                <span style="
                                    display: inline-block;
                                    background: ${colors.background};
                                    color: ${colors.color};
                                    padding: 2px 6px;
                                    border-radius: 8px;
                                    font-size: 10px;
                                    margin: 1px 2px 1px 0;
                                    border: 1px solid ${colors.background === '#d1f2d1' ? '#c3e6cb' : colors.background === '#f8d7da' ? '#f5c6cb' : '#ffeaa7'};
                                ">${theme}</span>
                                `;
                            }).join('') : '<span style="color: #6c757d; font-size: 11px;">No themes</span>'}
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
                    padding: 6px 12px;
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

        // --- Patched, context-aware sidebar filters (last definition wins) ---
        function _activeTab() {
            const reportsContainer = document.getElementById('reports-container');
            if (reportsContainer && reportsContainer.style.display !== 'none') {
                return 'reports';
            }
            const historyContainer = document.getElementById('history-container');
            if (historyContainer && historyContainer.style.display !== 'none') {
                return 'history';
            }
            return 'search';
        }

        function _applyToAnalysis({ projectId = '', tagId = '' }) {
            const projectSelects = document.querySelectorAll('select#analysis-project-filter');
            if (projectSelects.length > 0) {
                projectSelects.forEach(select => {
                    select.value = projectId || '';
                });
            }

            if (tagId) {
                const tagChecks = document.querySelectorAll('.analysis-tag-checkbox');
                const targetCheckbox = Array.from(tagChecks).find(cb => cb.value === tagId);
                if (targetCheckbox) {
                    // Toggle the tag - if it's checked, uncheck it; if unchecked, check it
                    targetCheckbox.checked = !targetCheckbox.checked;
                }
            }

            // Apply the filters to actually trigger the filtering and update global state
            if (typeof applyAnalysisFilters === 'function') {
                applyAnalysisFilters();
            } else {
                if (typeof updateAnalysisFilterSummary === 'function') {
                    updateAnalysisFilterSummary();
                }
                if (typeof updateAnalysisFilterChips === 'function') {
                    updateAnalysisFilterChips();
                }
            }

            if (projectId || tagId) {
                const syncOptions = { shouldSwitch: false };
                if (projectId) syncOptions.projectId = projectId;
                if (tagId) {
                    syncOptions.tagId = tagId;
                    syncOptions.tags = [tagId];
                }
                _applyToHistory(syncOptions);
            }
        }

        function _applyToHistory({ projectId, tagId, tags, market, shouldSwitch = true } = {}) {
            const previousFilters = currentFilters || { text: '', rawText: '', project: '', tags: [], market: 'all', isActive: false };

            const filterTextInput = document.getElementById('filter-text');
            const rawFromDom = filterTextInput ? filterTextInput.value.trim() : '';
            const effectiveRawText = rawFromDom || previousFilters.rawText || '';

            let nextProject = previousFilters.project || '';
            if (typeof projectId === 'string') {
                nextProject = projectId;
            }

            let nextTags = Array.isArray(previousFilters.tags) ? [...previousFilters.tags] : [];
            if (Array.isArray(tags)) {
                nextTags = Array.from(new Set(
                    tags.filter(tag => typeof tag === 'string' && tag.length > 0)
                ));
            }

            if (typeof tagId === 'string' && tagId.length > 0) {
                // For sidebar tag selection, preserve existing tags and add/toggle the new one
                if (nextTags.includes(tagId)) {
                    // If tag is already selected, remove it (toggle off)
                    nextTags = nextTags.filter(tag => tag !== tagId);
                } else {
                    // Add the tag to existing selection
                    nextTags = [...nextTags, tagId];
                }
                // Don't clear project when selecting a tag from sidebar
            }

            // Only clear tags when explicitly setting a project with empty tags array
            if (typeof projectId === 'string' && Array.isArray(tags) && tags.length === 0) {
                nextTags = [];
            }

            const filterMarketSelect = document.getElementById('filter-market');
            let nextMarket = previousFilters.market || 'all';
            const domMarket = filterMarketSelect ? filterMarketSelect.value : '';

            if (typeof market === 'string') {
                nextMarket = market;
            } else if (domMarket) {
                nextMarket = domMarket;
            }

            const normalizedText = effectiveRawText.toLowerCase();

            currentFilters = {
                text: normalizedText,
                rawText: effectiveRawText,
                project: nextProject,
                tags: nextTags,
                market: nextMarket,
                isActive: Boolean(normalizedText || nextProject || nextTags.length || (nextMarket && nextMarket !== 'all'))
            };

            if (filterMarketSelect) {
                filterMarketSelect.value = nextMarket || 'all';
            }

            const historyIsActive = _activeTab() === 'history';
            const shouldRender = shouldSwitch || historyIsActive;

            if (!shouldRender) {
                return;
            }

            if (shouldSwitch && !historyIsActive) {
                switchTab('history');
            }

            if (typeof loadHistory === 'function') {
                loadHistory();
            }
            
            // Sync filters to Analysis tab
            if (typeof syncAnalysisFiltersWithHistoryFilters === 'function') {
                syncAnalysisFiltersWithHistoryFilters();
            }

            ['history-content', 'history-welcome-state', 'history-list'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.style.visibility = 'visible';
                }
            });

            const projectSel = document.getElementById('filter-project');
            if (projectSel) {
                projectSel.value = currentFilters.project || '';
            }

            const tagChecks = document.querySelectorAll('#filter-tags input[type="checkbox"]');
            if (tagChecks.length > 0) {
                const activeTags = new Set(currentFilters.tags || []);
                tagChecks.forEach(cb => {
                    cb.checked = activeTags.has(cb.value);
                });
            }

            const updatedFilterText = document.getElementById('filter-text');
            if (updatedFilterText) {
                updatedFilterText.value = currentFilters.rawText || '';
            }

            if (typeof updateFilterSummary === 'function') {
                updateFilterSummary();
            }
            if (typeof updateFilterChips === 'function') {
                updateFilterChips();
            }

            if (typeof loadSearchHistory === 'function' && typeof applyAdvancedFilters === 'function') {
                const history = loadSearchHistory();
                const filtered = applyAdvancedFilters(history);
                if (typeof renderHistoryList === 'function') {
                    renderHistoryList(filtered);
                }
            }
        }

        window.filterByProject = filterByProject;
        window.filterByTag = filterByTag;

        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'ping') {
                sendResponse({ status: 'ready' });
                return true;
            }
            
            if (message.action === 'openSearch') {
                createModal();
                sendResponse({ status: 'opened' });
                return true;
            }
        });
    }

})();

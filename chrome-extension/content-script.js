// ChatGPT GEO/AEO Research - content bootstrap.
(function () {
    'use strict';

    if (!window.location.hostname.includes('chatgpt.com')) return;

    const BUTTON_ID = 'openGeoResearchBtn';
    let lastUrl = window.location.href;
    let statusTimer = null;

    function ready(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
        else fn();
    }

    function core() {
        return window.CgptGeoResearchCore;
    }

    function ui() {
        return window.CgptGeoResearchUI;
    }

    function getIconUrl() {
        if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function') {
            return chrome.runtime.getURL('icons/logobubble.svg');
        }
        return '';
    }

    function createFloatingButton() {
        document.getElementById(BUTTON_ID)?.remove();
        const button = document.createElement('button');
        button.id = BUTTON_ID;
        button.type = 'button';
        button.title = 'Open ChatGPT GEO/AEO Research';
        button.setAttribute('aria-label', 'Open ChatGPT GEO/AEO Research');

        const iconUrl = getIconUrl();
        if (iconUrl) {
            const img = document.createElement('img');
            img.src = iconUrl;
            img.alt = '';
            img.setAttribute('aria-hidden', 'true');
            button.appendChild(img);
        }
        const label = document.createElement('span');
        label.className = 'geo-research-label';
        label.textContent = 'GEO/AEO Research';
        button.appendChild(label);

        button.addEventListener('click', openResearch);
        document.body.appendChild(button);
        updateButtonStatus();
        return button;
    }

    function updateButtonStatus() {
        const button = document.getElementById(BUTTON_ID);
        if (!button || !core()) return;
        const status = core().getPageStatus();
        button.dataset.ready = status.ready ? 'true' : 'false';
        button.title = status.ready ? 'Open ChatGPT GEO/AEO Research' : status.message;
    }

    async function openResearch() {
        if (!core() || !ui()) {
            console.warn('GEO/AEO Research modules are not ready yet.');
            return;
        }
        try {
            await ui().open();
            updateButtonStatus();
        } catch (error) {
            const button = document.getElementById(BUTTON_ID);
            if (button) {
                button.dataset.ready = 'false';
                button.title = error && error.message ? error.message : 'Refresh this ChatGPT tab and try again.';
            }
            console.warn('Failed to open GEO/AEO Research:', error);
        }
    }

    function watchRouteChanges() {
        const notify = () => {
            const current = window.location.href;
            if (current === lastUrl) return;
            lastUrl = current;
            updateButtonStatus();
        };

        ['pushState', 'replaceState'].forEach((method) => {
            const original = history[method];
            history[method] = function patchedHistoryMethod() {
                const result = original.apply(this, arguments);
                setTimeout(notify, 0);
                return result;
            };
        });
        window.addEventListener('popstate', notify);

        if (statusTimer) clearInterval(statusTimer);
        statusTimer = setInterval(updateButtonStatus, 1500);
    }

    ready(() => {
        createFloatingButton();
        watchRouteChanges();
    });

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'ping') {
                const pageStatus = core() ? core().getPageStatus() : { ready: false, reason: 'loading', message: 'Extension is loading.' };
                sendResponse({ status: 'ready', pageStatus });
                return true;
            }

            if (message.action === 'openResearch') {
                openResearch()
                    .then(() => sendResponse({ status: 'opened' }))
                    .catch((error) => sendResponse({ status: 'error', message: error.message }));
                return true;
            }

            return false;
        });
    }
})();

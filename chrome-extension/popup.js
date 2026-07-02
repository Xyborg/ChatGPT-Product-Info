// ChatGPT GEO/AEO Research Extension - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
    const statusEl = document.getElementById('status');
    const statusTextEl = document.getElementById('status-text');
    const openSearchBtn = document.getElementById('open-search');
    const goToChatGPTBtn = document.getElementById('go-to-chatgpt');

    const statusIcons = {
        success: { modifier: 'status-icon--success', label: 'Success status' },
        warning: { modifier: 'status-icon--warning', label: 'Warning status' },
        error: { modifier: 'status-icon--error', label: 'Error status' },
    };

    function setStatus(type, message) {
        const icon = statusIcons[type];
        if (!icon) {
            statusTextEl.textContent = message;
            return;
        }

        const iconEl = document.createElement('span');
        iconEl.className = `status-icon ${icon.modifier}`;
        iconEl.setAttribute('role', 'img');
        iconEl.setAttribute('aria-label', icon.label);
        const messageEl = document.createElement('span');
        messageEl.textContent = message;
        statusTextEl.replaceChildren(iconEl, document.createTextNode(' '), messageEl);
    }

    // Check if we're on a ChatGPT tab
    async function checkChatGPTStatus() {
        try {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!activeTab || !(activeTab.url || '').includes('chatgpt.com')) {
                statusEl.className = 'status status-bad';
                setStatus('error', 'Please navigate to ChatGPT first');
                openSearchBtn.disabled = true;
                return false;
            }

            // Check if content script is ready by sending a message
            try {
                const response = await chrome.tabs.sendMessage(activeTab.id, { action: 'ping' });
                const pageStatus = response && response.pageStatus;
                if (pageStatus && pageStatus.ready === false) {
                    statusEl.className = 'status status-warning';
                    setStatus('warning', pageStatus.message || 'Open a ChatGPT conversation to scan');
                    openSearchBtn.disabled = true;
                    return false;
                }
                statusEl.className = 'status status-good';
                setStatus('success', 'Ready to scan this conversation');
                openSearchBtn.disabled = false;
                return true;
            } catch (error) {
                statusEl.className = 'status status-warning';
                setStatus('warning', 'Please refresh the ChatGPT page');
                openSearchBtn.disabled = true;
                return false;
            }
        } catch (error) {
            statusEl.className = 'status status-bad';
            setStatus('error', 'Unable to check status');
            openSearchBtn.disabled = true;
            return false;
        }
    }

    // Open the GEO/AEO Research modal
    openSearchBtn.addEventListener('click', async () => {
        try {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.tabs.sendMessage(activeTab.id, { action: 'openResearch' });
            window.close(); // Close the popup
        } catch (error) {
            console.error('Failed to open GEO/AEO Research:', error);
            statusEl.className = 'status status-bad';
            setStatus('error', 'Failed to open GEO/AEO Research. Please refresh the page.');
        }
    });

    // Navigate to ChatGPT
    goToChatGPTBtn.addEventListener('click', async () => {
        try {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if ((activeTab.url || '').includes('chatgpt.com')) {
                // Already on ChatGPT, just refresh
                await chrome.tabs.reload(activeTab.id);
            } else {
                // Navigate to ChatGPT
                await chrome.tabs.update(activeTab.id, { url: 'https://chatgpt.com' });
            }
            
            window.close();
        } catch (error) {
            console.error('Failed to navigate to ChatGPT:', error);
        }
    });

    // Initial status check
    await checkChatGPTStatus();

    // Recheck status every 2 seconds
    setInterval(checkChatGPTStatus, 2000);
});
// ChatGPT Product Info Research Extension - Popup Script

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

        statusTextEl.innerHTML = `<span class="status-icon ${icon.modifier}" role="img" aria-label="${icon.label}"></span> <span>${message}</span>`;
    }

    // Check if we're on a ChatGPT tab
    async function checkChatGPTStatus() {
        try {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!activeTab.url.includes('chatgpt.com')) {
                statusEl.className = 'status status-bad';
                setStatus('error', 'Please navigate to ChatGPT first');
                openSearchBtn.disabled = true;
                return false;
            }

            // Check if content script is ready by sending a message
            try {
                await chrome.tabs.sendMessage(activeTab.id, { action: 'ping' });
                statusEl.className = 'status status-good';
                setStatus('success', 'Ready to search products');
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

    // Open the product search modal
    openSearchBtn.addEventListener('click', async () => {
        try {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.tabs.sendMessage(activeTab.id, { action: 'openSearch' });
            window.close(); // Close the popup
        } catch (error) {
            console.error('Failed to open search:', error);
            statusEl.className = 'status status-bad';
            setStatus('error', 'Failed to open search. Please refresh the page.');
        }
    });

    // Navigate to ChatGPT
    goToChatGPTBtn.addEventListener('click', async () => {
        try {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (activeTab.url.includes('chatgpt.com')) {
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

// ChatGPT Product Search Extension - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
    const statusEl = document.getElementById('status');
    const statusTextEl = document.getElementById('status-text');
    const openSearchBtn = document.getElementById('open-search');
    const goToChatGPTBtn = document.getElementById('go-to-chatgpt');

    // Check if we're on a ChatGPT tab
    async function checkChatGPTStatus() {
        try {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!activeTab.url.includes('chatgpt.com')) {
                statusEl.className = 'status status-bad';
                statusTextEl.textContent = '❌ Please navigate to ChatGPT first';
                openSearchBtn.disabled = true;
                return false;
            }

            // Check if content script is ready by sending a message
            try {
                await chrome.tabs.sendMessage(activeTab.id, { action: 'ping' });
                statusEl.className = 'status status-good';
                statusTextEl.textContent = '✅ Ready to search products';
                openSearchBtn.disabled = false;
                return true;
            } catch (error) {
                statusEl.className = 'status status-bad';
                statusTextEl.textContent = '⚠️ Please refresh the ChatGPT page';
                openSearchBtn.disabled = true;
                return false;
            }
        } catch (error) {
            statusEl.className = 'status status-bad';
            statusTextEl.textContent = '❌ Unable to check status';
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
            statusTextEl.textContent = '❌ Failed to open search. Please refresh the page.';
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

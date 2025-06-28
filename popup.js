document.addEventListener('DOMContentLoaded', function() {
    const fetchBtn = document.getElementById('fetch-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const loading = document.getElementById('loading');
    const statsSection = document.getElementById('stats-section');
    const platformStats = document.getElementById('platform-stats');
    const totalCount = document.getElementById('total-count');

    // Load saved URLs
    loadSavedUrls();

    fetchBtn.addEventListener('click', async function() {
        const urls = {
            leetcode: document.getElementById('leetcode-url').value.trim(),
            gfg: document.getElementById('gfg-url').value.trim(),
            codeforces: document.getElementById('codeforces-url').value.trim(),
            code360: document.getElementById('code360-url').value.trim()
        };

        // Save URLs
        chrome.storage.sync.set({ urls: urls });

        // Show loading
        loading.style.display = 'flex';
        statsSection.style.display = 'none';
        fetchBtn.disabled = true;

        try {
            // Send message to background script to fetch data
            const response = await chrome.runtime.sendMessage({
                action: 'fetchAllStats',
                urls: urls
            });

            if (response.success) {
                displayStats(response.data);
                // Save the fetched data
                chrome.storage.sync.set({ 
                    stats: response.data,
                    lastUpdated: new Date().toISOString()
                });
            } else {
                showError('Failed to fetch data: ' + response.error);
            }
        } catch (error) {
            showError('Error: ' + error.message);
        } finally {
            loading.style.display = 'none';
            fetchBtn.disabled = false;
        }
    });

    dashboardBtn.addEventListener('click', function() {
        chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    });

    function loadSavedUrls() {
        chrome.storage.sync.get(['urls'], function(result) {
            if (result.urls) {
                document.getElementById('leetcode-url').value = result.urls.leetcode || '';
                document.getElementById('gfg-url').value = result.urls.gfg || '';
                document.getElementById('codeforces-url').value = result.urls.codeforces || '';
                document.getElementById('code360-url').value = result.urls.code360 || '';
            }
        });

        // Load and display saved stats
        chrome.storage.sync.get(['stats'], function(result) {
            if (result.stats) {
                displayStats(result.stats);
            }
        });
    }

    function displayStats(data) {
        let total = 0;
        platformStats.innerHTML = '';

        const platforms = [
            { key: 'leetcode', name: 'LeetCode', count: data.leetcode?.total || 0 },
            { key: 'gfg', name: 'GeeksForGeeks', count: data.gfg?.total || 0 },
            { key: 'codeforces', name: 'Codeforces', count: data.codeforces?.total || 0 },
            { key: 'code360', name: 'Code360', count: data.code360?.total || 0 }
        ];

        platforms.forEach(platform => {
            total += platform.count;
            
            const statDiv = document.createElement('div');
            statDiv.className = 'platform-stat';
            statDiv.innerHTML = `
                <span class="platform-name">${platform.name}</span>
                <span class="platform-count">${platform.count}</span>
            `;
            platformStats.appendChild(statDiv);
        });

        totalCount.textContent = total;
        statsSection.style.display = 'block';
    }

    function showError(message) {
        // You could add a proper error display here
        console.error(message);
        alert(message);
    }
});
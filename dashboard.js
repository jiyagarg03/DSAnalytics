document.addEventListener("DOMContentLoaded", function () {
  const loading = document.getElementById("loading");
  const dashboardContent = document.getElementById("dashboard-content");
  const emptyState = document.getElementById("empty-state");
  const openPopupBtn = document.getElementById("open-popup");

  // Load and display data
  loadDashboardData();

  openPopupBtn.addEventListener("click", function (e) {
    e.preventDefault();
    // Since we can't open the popup from here, we'll redirect to the extension
    window.close();
  });

  function loadDashboardData() {
    chrome.storage.sync.get(["stats", "lastUpdated"], function (result) {
      loading.style.display = "none";

      if (result.stats && Object.keys(result.stats).length > 0) {
        displayDashboard(result.stats);
        updateLastUpdatedTime(result.lastUpdated);
        dashboardContent.style.display = "block";
      } else {
        emptyState.style.display = "block";
      }
    });
  }

  function displayDashboard(stats) {
    let totalProblems = 0;
    let activePlatforms = 0;
    const allTopics = {};

    // Calculate summary stats
    Object.values(stats).forEach((platform) => {
      if (platform.total > 0) {
        totalProblems += platform.total;
        activePlatforms++;

        // Merge topics
        Object.entries(platform.topics || {}).forEach(([topic, count]) => {
          allTopics[topic] = (allTopics[topic] || 0) + count;
        });
      }
    });

    // Find top topic
    const topTopic = Object.entries(allTopics).sort(([, a], [, b]) => b - a)[0];

    // Update summary cards
    document.getElementById("total-problems").textContent = totalProblems;
    document.getElementById("total-platforms").textContent = activePlatforms;
    document.getElementById("total-topics").textContent =
      Object.keys(allTopics).length;
    document.getElementById("favorite-topic").textContent = topTopic
      ? topTopic[0]
      : "-";

    // Generate platform cards
    const platformsContainer = document.getElementById("platforms-container");
    platformsContainer.innerHTML = "";

    const platformConfigs = {
      leetcode: {
        name: "LeetCode",
        class: "leetcode",
        icon: getIcon("check-circle"),
      },
      gfg: { name: "GeeksForGeeks", class: "gfg", icon: getIcon("book") },
      codeforces: {
        name: "Codeforces",
        class: "codeforces",
        icon: getIcon("zap"),
      },
      code360: { name: "Code360", class: "code360", icon: getIcon("code") },
    };

    Object.entries(stats).forEach(([platform, data]) => {
      if (data.total > 0 || Object.keys(data.topics || {}).length > 0) {
        const config = platformConfigs[platform];
        const card = createPlatformCard(config, data);
        platformsContainer.appendChild(card);
      }
    });
  }

  function createPlatformCard(config, data) {
    const card = document.createElement("div");
    card.className = `platform-card ${config.class}`;

    const topicsHtml = Object.entries(data.topics || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10) // Show top 10 topics
      .map(
        ([topic, count]) => `
                <div class="topic-item">
                    <span class="topic-name">${topic}</span>
                    <span class="topic-count">${count}</span>
                </div>
            `
      )
      .join("");

    card.innerHTML = `
            <div class="platform-header">
                <div class="platform-name">
                    ${config.icon}
                    ${config.name}
                </div>
                <div class="platform-total">${data.total}</div>
            </div>
            ${
              topicsHtml
                ? `
    <div class="topics-section">
        <div class="topics-header">Top Topics</div>
        <div class="topics-grid">
            ${topicsHtml}
        </div>
    </div>
    `
                : config.name === "GeeksForGeeks"
                ? `
    <div style="margin-top: 12px; font-size: 14px; color: #64748b;">
        Topic-wise data is not available on GFG profiles.
    </div>
    `
                : ""
            }

            ${
              data.error
                ? `
                <div style="color: #dc2626; font-size: 12px; margin-top: 8px;">
                    Error: ${data.error}
                </div>
            `
                : ""
            }
        `;

    return card;
  }

  function getIcon(type) {
    const icons = {
      "check-circle":
        '<svg class="platform-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
      book: '<svg class="platform-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>',
      zap: '<svg class="platform-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>',
      code: '<svg class="platform-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>',
    };
    return icons[type] || icons["code"];
  }

  function updateLastUpdatedTime(timestamp) {
    if (timestamp) {
      const date = new Date(timestamp);
      const timeString = date.toLocaleString();
      document.getElementById("update-time").textContent = timeString;
    }
  }
});

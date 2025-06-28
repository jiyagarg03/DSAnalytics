// Content script for scraping GFG and Code360 profiles
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapeGFG") {
    setTimeout(() => {
      const gfgData = scrapeGFGProfile();
      sendResponse(gfgData);
    }, 1000);
    return true; // Keep message channel open
  } else if (request.action === "scrapeCode360") {
    setTimeout(() => {
      const code360Data = scrapeCode360Profile();
      sendResponse(code360Data);
    }, 1000);
    return true; // Keep message channel open
  }
});

function scrapeGFGProfile() {
  try {
    let total = 0;
    const topics = {};

    console.log("Scraping GFG profile...");
    console.log("Current URL:", window.location.href);
    console.log("Page title:", document.title);

    // Multiple selectors to try for total problems solved
    const possibleSelectors = [
      // Common selectors for problem count
      ".score_card_value",
      ".scoreCard_head",
      ".problemsSolved",
      ".problems-solved",
      ".total-problems",
      ".solved-count",
      '[data-testid="problems-solved"]',
      ".profile-stats .count",
      ".stat-value",
      ".achievement-count",
      // Generic number selectors
      ".number",
      ".count",
      ".value",
    ];

    // Try each selector
    for (const selector of possibleSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const text = element.textContent.trim();
        const number = parseInt(text);
        if (!isNaN(number) && number > total && number < 10000) {
          total = Math.max(total, number);
          console.log(`Found potential total from ${selector}: ${number}`);
        }
      });
    }

    // Also search in text content for patterns
    const bodyText = document.body.textContent;
    const patterns = [
      /(\d+)\s*(?:problems?\s*solved|Problems?\s*Solved|questions?\s*solved|Questions?\s*Solved)/gi,
      /solved\s*:?\s*(\d+)/gi,
      /total\s*:?\s*(\d+)/gi,
    ];

    patterns.forEach((pattern) => {
      const matches = bodyText.matchAll(pattern);
      for (const match of matches) {
        const number = parseInt(match[1]);
        if (!isNaN(number) && number > 0 && number < 10000) {
          total = Math.max(total, number);
          console.log(`Found potential total from pattern: ${number}`);
        }
      }
    });

    // Try to extract topics/categories
    const topicSelectors = [
      ".topic-tag",
      ".category-name",
      ".problem-category",
      ".tag",
      ".skill-tag",
      ".topic",
      ".category",
      ".subject",
      ".domain",
      '[class*="tag"]',
      '[class*="topic"]',
      '[class*="category"]',
    ];

    topicSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const topicName = element.textContent.trim();
        if (
          topicName &&
          topicName.length > 2 &&
          topicName.length < 50 &&
          !topicName.match(/^\d+$/)
        ) {
          topics[topicName] = (topics[topicName] || 0) + 1;
        }
      });
    });

    // Look for problem lists and extract topics from there
    const problemRows = document.querySelectorAll(
      "tr, .problem-row, .problem-item, .list-item"
    );
    problemRows.forEach((row) => {
      const topicElements = row.querySelectorAll(
        '.tag, .topic, .category, [class*="tag"]'
      );
      topicElements.forEach((element) => {
        const topicName = element.textContent.trim();
        if (topicName && topicName.length > 2 && topicName.length < 50) {
          topics[topicName] = (topics[topicName] || 0) + 1;
        }
      });
    });

    console.log("GFG scraping results:", { total, topics });

    return {
      total: total,
      topics: topics,
      platform: "GeeksForGeeks",
    };
  } catch (error) {
    console.error("Error scraping GFG:", error);
    return {
      total: 0,
      topics: {},
      platform: "GeeksForGeeks",
      error: error.message,
    };
  }
}

function scrapeCode360Profile() {
  try {
    let total = 0;
    const topics = {};

    console.log("Scraping Code360 profile...");
    console.log("Current URL:", window.location.href);
    console.log("Page title:", document.title);

    // Wait a bit more for dynamic content to load
    const checkForContent = () => {
      // Multiple selectors to try for total problems solved
      const possibleSelectors = [
        // Code360 specific selectors
        ".stats-value",
        ".stat-number",
        ".problem-count",
        ".solved-problems",
        ".total-solved",
        ".problems-solved",
        ".question-count",
        ".solved-count",
        '[data-cy="problems-solved"]',
        '[data-testid="problems-solved"]',
        ".profile-stat-value",
        ".achievement-number",
        ".metric-value",
        // Generic selectors
        ".number",
        ".count",
        ".value",
        ".stat",
      ];

      // Try each selector
      for (const selector of possibleSelectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          const text = element.textContent.trim();
          const number = parseInt(text);
          if (!isNaN(number) && number > total && number < 10000) {
            total = Math.max(total, number);
            console.log(`Found potential total from ${selector}: ${number}`);
          }
        });
      }

      // Search in text content for patterns
      const bodyText = document.body.textContent;
      const patterns = [
        /(\d+)\s*(?:problems?\s*solved|Problems?\s*Solved|questions?\s*solved|Questions?\s*Solved)/gi,
        /solved\s*:?\s*(\d+)/gi,
        /completed\s*:?\s*(\d+)/gi,
        /total\s*:?\s*(\d+)/gi,
        /(\d+)\s*solved/gi,
      ];

      patterns.forEach((pattern) => {
        const matches = bodyText.matchAll(pattern);
        for (const match of matches) {
          const number = parseInt(match[1]);
          if (!isNaN(number) && number > 0 && number < 10000) {
            total = Math.max(total, number);
            console.log(`Found potential total from pattern: ${number}`);
          }
        }
      });

      // Try to extract topics/skills
      const topicSelectors = [
        ".topic",
        ".category",
        ".skill-tag",
        ".tag",
        ".subject",
        ".domain",
        ".technology",
        ".skill",
        '[class*="tag"]',
        '[class*="topic"]',
        '[class*="category"]',
        '[class*="skill"]',
      ];

      topicSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          const topicName = element.textContent.trim();
          if (
            topicName &&
            topicName.length > 2 &&
            topicName.length < 50 &&
            !topicName.match(/^\d+$/) &&
            !topicName.includes("http")
          ) {
            topics[topicName] = (topics[topicName] || 0) + 1;
          }
        });
      });

      // Look in tables and lists for more data
      const dataRows = document.querySelectorAll("tr, .row, .item, .card");
      dataRows.forEach((row) => {
        const text = row.textContent;
        if (text.includes("solved") || text.includes("completed")) {
          const numbers = text.match(/\d+/g);
          if (numbers) {
            numbers.forEach((num) => {
              const number = parseInt(num);
              if (number > 0 && number < 1000 && number > total) {
                total = Math.max(total, number);
              }
            });
          }
        }
      });
    };

    // Run the check immediately and after a delay
    checkForContent();
    setTimeout(checkForContent, 1000);

    console.log("Code360 scraping results:", { total, topics });

    return {
      total: total,
      topics: topics,
      platform: "Code360",
    };
  } catch (error) {
    console.error("Error scraping Code360:", error);
    return {
      total: 0,
      topics: {},
      platform: "Code360",
      error: error.message,
    };
  }
}

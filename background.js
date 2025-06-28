chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchAllStats") {
    fetchAllPlatformStats(request.urls)
      .then((data) => sendResponse({ success: true, data }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
});

async function fetchAllPlatformStats(urls) {
  const results = {};

  try {
    // Fetch LeetCode stats
    if (urls.leetcode) {
      results.leetcode = await fetchLeetCodeStats(urls.leetcode);
    }

    // Fetch Codeforces stats
    if (urls.codeforces) {
      results.codeforces = await fetchCodeforcesStats(urls.codeforces);
    }

    // For GFG and Code360, we'll use content scripts
    if (urls.gfg) {
      results.gfg = await fetchGFGStats(urls.gfg);
    }

    if (urls.code360) {
      results.code360 = await fetchCode360Stats(urls.code360);
    }

    return results;
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }
}

async function fetchLeetCodeStats(profileUrl) {
  try {
    // Extract username from URL
    const username =
      profileUrl.match(/\/u\/([^\/]+)/)?.[1] ||
      profileUrl.match(/\/([^\/]+)\/?$/)?.[1];
    if (!username) {
      throw new Error("Invalid LeetCode profile URL");
    }

    console.log("Fetching LeetCode stats for:", username);

    // Use the correct GraphQL query to get actual solved problems count
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://leetcode.com/",
      },
      body: JSON.stringify({
        query: `
                    query userPublicProfile($username: String!) {
                        matchedUser(username: $username) {
                            submitStatsGlobal {
                                acSubmissionNum {
                                    difficulty
                                    count
                                }
                            }
                            tagProblemCounts {
                                advanced {
                                    tagName
                                    tagSlug
                                    problemsSolved
                                }
                                intermediate {
                                    tagName
                                    tagSlug
                                    problemsSolved
                                }
                                fundamental {
                                    tagName
                                    tagSlug
                                    problemsSolved
                                }
                            }
                            profile {
                                reputation
                                ranking
                            }
                        }
                    }
                `,
        variables: { username },
      }),
    });

    const data = await response.json();
    console.log("LeetCode API Response:", data);

    if (data.errors) {
      console.error("LeetCode API errors:", data.errors);
      throw new Error("LeetCode API error: " + data.errors[0].message);
    }

    const user = data.data?.matchedUser;
    if (!user) {
      throw new Error("User not found on LeetCode");
    }

    const total = user.submitStatsGlobal?.acSubmissionNum?.find(
      (x) => x.difficulty === "All"
    )?.count;
    if (typeof total === "number") {
      totalSolved = total;
    }

    // If that doesn't work, try the tag-based approach which gives unique problems
    if (totalSolved === 0 && user.tagProblemCounts) {
      const uniqueProblems = new Set();
      ["advanced", "intermediate", "fundamental"].forEach((level) => {
        if (user.tagProblemCounts[level]) {
          user.tagProblemCounts[level].forEach((tag) => {
            if (tag.problemsSolved > 0) {
              // This gives us unique problems per tag, but we need to avoid double counting
              for (let i = 0; i < tag.problemsSolved; i++) {
                uniqueProblems.add(`${tag.tagSlug}-${i}`);
              }
            }
          });
        }
      });
      totalSolved = uniqueProblems.size;
    }

    // Collect topics
    const topics = {};
    if (user.tagProblemCounts) {
      ["advanced", "intermediate", "fundamental"].forEach((level) => {
        if (user.tagProblemCounts[level]) {
          user.tagProblemCounts[level].forEach((tag) => {
            if (tag.problemsSolved > 0) {
              topics[tag.tagName] = tag.problemsSolved;
            }
          });
        }
      });
    }

    console.log("LeetCode final result:", { total: totalSolved, topics });

    return {
      total: totalSolved,
      topics: topics,
      platform: "LeetCode",
    };
  } catch (error) {
    console.error("LeetCode fetch error:", error);
    return { total: 0, topics: {}, platform: "LeetCode", error: error.message };
  }
}

async function fetchCodeforcesStats(profileUrl) {
  try {
    // Extract username from URL
    const username = profileUrl.match(/\/profile\/([^\/]+)/)?.[1];
    if (!username) {
      throw new Error("Invalid Codeforces profile URL");
    }

    console.log("Fetching Codeforces stats for:", username);

    // Fetch user submissions
    const response = await fetch(
      `https://codeforces.com/api/user.status?handle=${username}&from=1&count=10000`
    );
    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error("Codeforces API error: " + data.comment);
    }

    // Count unique solved problems
    const solvedProblems = new Set();
    const topics = {};

    data.result.forEach((submission) => {
      if (submission.verdict === "OK") {
        const problemId = `${submission.problem.contestId}-${submission.problem.index}`;
        if (!solvedProblems.has(problemId)) {
          solvedProblems.add(problemId);

          // Count topics only once per problem
          if (submission.problem.tags) {
            submission.problem.tags.forEach((tag) => {
              topics[tag] = (topics[tag] || 0) + 1;
            });
          }
        }
      }
    });

    console.log("Codeforces final result:", {
      total: solvedProblems.size,
      topics,
    });

    return {
      total: solvedProblems.size,
      topics: topics,
      platform: "Codeforces",
    };
  } catch (error) {
    console.error("Codeforces fetch error:", error);
    return {
      total: 0,
      topics: {},
      platform: "Codeforces",
      error: error.message,
    };
  }
}

async function fetchGFGStats(profileUrl) {
  try {
    console.log("Fetching GFG stats for:", profileUrl);
    // For GFG, we need to scrape the page using a content script
    return new Promise((resolve) => {
      chrome.tabs.create({ url: profileUrl, active: false }, (tab) => {
        const tabId = tab.id;

        // Wait for page to load completely
        setTimeout(() => {
          chrome.tabs.sendMessage(
            tabId,
            { action: "scrapeGFG" },
            (response) => {
              chrome.tabs.remove(tabId);
              console.log("GFG scraping response:", response);
              resolve(
                response || {
                  total: 0,
                  topics: {},
                  platform: "GeeksForGeeks",
                  error: "Unable to scrape data",
                }
              );
            }
          );
        }, 4000); // Increased wait time
      });
    });
  } catch (error) {
    console.error("GFG fetch error:", error);
    return {
      total: 0,
      topics: {},
      platform: "GeeksForGeeks",
      error: error.message,
    };
  }
}

async function fetchCode360Stats(profileUrl) {
  try {
    console.log("Fetching Code360 stats for:", profileUrl);
    // For Code360, we need to scrape the page using a content script
    return new Promise((resolve) => {
      chrome.tabs.create({ url: profileUrl, active: false }, (tab) => {
        const tabId = tab.id;

        // Wait for page to load completely
        setTimeout(() => {
          chrome.tabs.sendMessage(
            tabId,
            { action: "scrapeCode360" },
            (response) => {
              chrome.tabs.remove(tabId);
              console.log("Code360 scraping response:", response);
              resolve(
                response || {
                  total: 0,
                  topics: {},
                  platform: "Code360",
                  error: "Unable to scrape data",
                }
              );
            }
          );
        }, 5000); // Increased wait time
      });
    });
  } catch (error) {
    console.error("Code360 fetch error:", error);
    return { total: 0, topics: {}, platform: "Code360", error: error.message };
  }
}

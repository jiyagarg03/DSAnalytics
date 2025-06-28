# DSAnalytics - Chrome Extension Multi-Platform DSA Tracking

A comprehensive Chrome extension to track your Data Structures & Algorithms problem-solving progress across multiple coding platforms.

## Features

- **Multi-Platform Support**: LeetCode, GeeksForGeeks, Codeforces, and Code360 (Naukri)
- **Real-time Stats**: Fetch current problem counts and topic breakdowns
- **Professional Dashboard**: Comprehensive view with topic analysis
- **Data Persistence**: Saves your progress data locally
- **Clean UI**: Professional, neutral design with excellent UX

## Supported Platforms

### LeetCode

- Uses official GraphQL API
- Fetches total problems solved
- Provides detailed topic-wise breakdown
- Includes difficulty-based statistics

### Codeforces

- Uses official REST API
- Counts unique accepted submissions
- Provides tag-based topic analysis
- Real-time data fetching

### GeeksForGeeks

- Web scraping approach
- Extracts total problems solved
- Attempts to gather topic information
- Handles various profile layouts

### Code360 (Naukri)

- Web scraping approach
- Extracts visible problem counts
- Collects available topic/skill tags
- Adapts to different profile formats

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The DSA Progress Tracker icon will appear in your extensions bar

## Usage

### Setting Up Profiles

1. Click the extension icon to open the popup
2. Enter your profile URLs for each platform:
   - **LeetCode**: `https://leetcode.com/u/your-username/`
   - **GeeksForGeeks**: `https://www.geeksforgeeks.org/user/your-username/`
   - **Codeforces**: `https://codeforces.com/profile/your-username`
   - **Code360**: `https://www.naukri.com/code360/profile/your-profile-id`

### Fetching Stats

1. Click "Fetch Stats" to retrieve your current progress
2. The extension will fetch data from all configured platforms
3. Quick stats will be displayed in the popup
4. Data is automatically saved for future reference

### Viewing Dashboard

1. Click "Dashboard" to open the comprehensive view
2. See total problems solved across all platforms
3. View platform-specific breakdowns
4. Analyze topic-wise progress
5. Track your most active areas

## Technical Details

### Architecture

- **Manifest V3**: Uses the latest Chrome extension format
- **Background Script**: Handles API calls and data fetching
- **Content Scripts**: Performs web scraping for platforms without APIs
- **Storage API**: Saves user data and preferences locally

### Data Sources

- **LeetCode**: Official GraphQL API for accurate, real-time data
- **Codeforces**: Official REST API for submission history
- **GeeksForGeeks**: DOM scraping with fallback selectors
- **Code360**: DOM scraping with adaptive selectors

### Privacy & Security

- All data is stored locally on your device
- No personal information is transmitted to third parties
- Profile URLs are saved only in your browser's local storage
- API calls are made directly to the respective platforms

## Troubleshooting

### Common Issues

1. **No data showing**: Ensure profile URLs are correct and public
2. **API errors**: Check if the username exists on the platform
3. **Scraping failures**: Some platforms may update their layouts
4. **CORS errors**: The extension handles cross-origin requests automatically

### Platform-Specific Notes

- **LeetCode**: Requires public profile visibility
- **GeeksForGeeks**: Profile must be publicly accessible
- **Codeforces**: Handle must be valid and submissions public
- **Code360**: Profile page must be publicly viewable

## Development

### File Structure

```
├── manifest.json          # Extension configuration
├── popup.html             # Main popup interface
├── popup.js               # Popup functionality
├── dashboard.html         # Dashboard view
├── dashboard.js           # Dashboard functionality
├── background.js          # Background script for API calls
├── content.js             # Content script for web scraping
└── README.md             # Documentation
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with different profiles
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).  
© 2025 [Jiya Garg](https://github.com/jiyagarg03) – All rights reserved.

Please retain proper attribution when using or modifying this code. Contributions are welcome with credit.


## Support

If you encounter any issues or have suggestions:

1. Check the troubleshooting section
2. Verify your profile URLs are correct
3. Ensure your profiles are publicly accessible
4. Open an issue with detailed information about the problem

---

**Note**: This extension respects the terms of service of all integrated platforms and only accesses publicly available data. Always ensure your profiles are configured according to each platform's privacy settings.

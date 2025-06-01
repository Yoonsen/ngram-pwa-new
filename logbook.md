# Logbook

## 2024-03-19: Ngram Visualization Improvements

### Cohort Analysis Fix
- Fixed cohort analysis calculation to show proper proportions within each year
- Previously calculated proportions across all years for each word
- Now calculates yearly totals across all words and shows relative proportions within each year
- This gives a more accurate representation of how word usage compares within each time period

### Tools Modal Improvements
- Added capitalization toggle for case-sensitive searches
- Added smoothing slider (0-20 years) for data visualization
- Implemented proper state management to prevent unnecessary redraws
- Capitalization changes only affect new searches
- Smoothing changes affect current visualization immediately

### UI/UX Improvements
- Refined button styling with consistent subtle borders
- Improved input group styling for seamless integration
- Added tools modal with download options (CSV and Excel)
- Fixed year number formatting on x-axis (removed spaces)
- Improved language dropdown behavior when corpus is 'avis'

### Technical Improvements
- Optimized component re-rendering
- Improved state management for settings
- Better separation of search parameters vs visualization parameters
- More efficient data processing for cohort analysis
- Added proper error handling for API calls

### Files Modified
- `src/components/NgramChartRecharts.js`
- `src/components/SearchControls.js`
- `src/services/ngramProcessor.js`
- `src/App.js`

## 2024-03-19
- Fixed zoom functionality on mobile devices
  - Simplified Chart.js zoom configuration
  - Made reset button always visible
  - Improved touch zoom handling
  - Added proper zoom state tracking
- Improved layout responsiveness
  - Made input field expand with window width
  - Enhanced mobile layout with proper stacking
  - Added flex handling for better control organization

## 2024-03-19: Modern UI Update and Interaction Improvements

### UI Modernization
- Implemented borderless button design for cleaner interface
- Enhanced button hover states with subtle background effects
- Improved language dropdown with Norwegian labels and native language tooltips
- Maintained cohesive search input group styling

### Chart Interaction Enhancements
- Implemented year range limits (1810-2025)
- Optimized drag-to-zoom functionality
- Added touch device support with pinch-to-zoom
- Improved zoom reset functionality
- Added minimum zoom range protection (5 years)

### Documentation
- Created comprehensive README.md
- Added development process documentation
- Included AI assistance acknowledgments
- Updated logbook with recent changes

### Technical Improvements
- Enforced year limits in both UI and data fetching
- Optimized chart performance
- Enhanced touch interaction handling
- Improved error handling and data validation

## 2024-03-19: Ngram Visualization Improvements

### Cohort Analysis Fix
- Fixed cohort analysis calculation to show proper proportions within each year
- Previously calculated proportions across all years for each word
- Now calculates yearly totals across all words and shows relative proportions within each year
- This gives a more accurate representation of how word usage compares within each time period

### Tools Modal Improvements
- Added capitalization toggle for case-sensitive searches
- Added smoothing slider (0-20 years) for data visualization
- Implemented proper state management to prevent unnecessary redraws
- Capitalization changes only affect new searches
- Smoothing changes affect current visualization immediately

### UI/UX Improvements
- Refined button styling with consistent subtle borders
- Improved input group styling for seamless integration
- Added tools modal with download options (CSV and Excel)
- Fixed year number formatting on x-axis (removed spaces)
- Improved language dropdown behavior when corpus is 'avis'

### Technical Improvements
- Optimized component re-rendering
- Improved state management for settings
- Better separation of search parameters vs visualization parameters
- More efficient data processing for cohort analysis
- Added proper error handling for API calls

### Files Modified
- `src/components/NgramChartRecharts.js`
- `src/components/SearchControls.js`
- `src/services/ngramProcessor.js`
- `src/App.js`

## 2024-03-19
- Fixed zoom functionality on mobile devices
  - Simplified Chart.js zoom configuration
  - Made reset button always visible
  - Improved touch zoom handling
  - Added proper zoom state tracking
- Improved layout responsiveness
  - Made input field expand with window width
  - Enhanced mobile layout with proper stacking
  - Added flex handling for better control organization 
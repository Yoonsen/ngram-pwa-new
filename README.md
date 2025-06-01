# Ngram Viewer - National Library of Norway 🇳🇴 [Norsk](README.no.md)

A modern, interactive web application for exploring word frequencies in the National Library of Norway's digital collections. This tool allows users to analyze and visualize how word usage has evolved over time in both books and newspapers.

## Features

- **Interactive Word Frequency Analysis**
  - Search multiple words simultaneously
  - Compare frequencies across different corpora (books and newspapers)
  - Support for multiple languages (Bokmål, Nynorsk, Sami languages, and Kven)
  - Real-time visualization updates

- **Advanced Visualization Options**
  - Relative frequency view
  - Absolute frequency view
  - Cumulative frequency analysis
  - Cohort analysis for comparing proportions
  - Smooth data visualization with adjustable year ranges
  - Interactive zoom and pan capabilities

- **User-Friendly Interface**
  - Clean, modern design
  - Intuitive drag-to-zoom functionality
  - Touch-device support
  - Responsive layout for all screen sizes
  - Easy-to-use language and corpus selection

- **Data Export Options**
  - Download visualizations as PNG
  - Export data as CSV
  - Export data as Excel spreadsheet

## Technical Details

### Built With
- React
- Chart.js for visualizations
- React-Bootstrap for UI components
- DH-Lab API for ngram data

### Key Features Implementation
- Year range limits (1810-2025) for data consistency
- Smoothing algorithm for trend visualization
- Case-sensitive search options
- Multi-language support with proper localization
- Responsive design for mobile and desktop

## Development

### Prerequisites
```bash
node >= 14.0.0
npm >= 6.14.0
```

### Installation
```bash
# Clone the repository
git clone https://github.com/Yoonsen/ngram-pwa-new.git

# Install dependencies
cd ngram-pwa-new
npm install

# Start development server
npm start
```

### Building for Production
```bash
npm run build
```

## Development Process and AI Assistance

This project represents a successful collaboration between human developers and AI tools:

- Initial conversion from Python/Dash/Plotly to React/JavaScript was assisted by Cursor AI
- Ongoing development and improvements facilitated by AI pair programming
- UI/UX refinements and feature implementations guided by human expertise
- Code quality and best practices maintained through AI-human collaboration

The development process showcases how AI can effectively assist in:
- Complex codebase migrations
- Feature implementation
- Code optimization
- Best practices adoption
- Problem-solving

## Acknowledgments

- National Library of Norway's DH-Lab for the ngram API
- Cursor AI for assistance in codebase conversion and development
- Claude AI for pair programming support
- The open-source community for various tools and libraries

## License

This project is licensed under the MIT License - see the LICENSE file for details. 

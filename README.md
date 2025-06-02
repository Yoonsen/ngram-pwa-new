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

This project serves as a case study for AI-assisted development, particularly in transitioning between different programming ecosystems. It demonstrates how teams with expertise in one technology stack (Python) can successfully develop modern web applications using different technologies (JavaScript/React) with AI assistance.

### Key Insights

#### Language Transition Success
- Successfully converted from Python/Dash/Plotly to React/JavaScript
- Maintained full functionality while modernizing the technology stack
- Achieved smooth transition despite team's primary Python background
- Preserved complex visualization features while improving user experience

#### AI as a Development Bridge
- AI tools provided contextual guidance for JavaScript/React ecosystem
- Handled complex transitions in:
  - Component architecture
  - State management
  - Modern UI implementation
  - API integration
- Translated Python development patterns to JavaScript equivalents
- Maintained code quality and best practices across languages

#### Collaborative Development Model
- Human expertise driving:
  - Data visualization requirements
  - Library selection
  - User experience design
  - Domain-specific features
- AI assistance with:
  - Technical implementation
  - Code structure
  - Best practices
  - Documentation
  - Problem-solving

#### Documentation and Knowledge Transfer
- Bilingual documentation (English/Norwegian)
- Clear technical documentation accessible to Python developers
- Detailed development logging
- Comprehensive feature documentation

This approach demonstrates how AI tools can effectively bridge technical gaps, enabling teams to:
- Venture beyond their primary technology stack
- Implement modern web development practices
- Maintain high code quality
- Focus on domain expertise while letting AI handle technical details

## Acknowledgments

- National Library of Norway's DH-Lab for the ngram API
- Cursor AI for assistance in codebase conversion and development
- ChatGPT AI for pair programming support
- The open-source community for various tools and libraries

## License

This project is licensed under the MIT License - see the LICENSE file for details. 

// Constants for n-gram processing
const MIN_YEAR = 1810;
const MAX_YEAR = new Date().getFullYear();
const NGRAM_API = 'https://api.nb.no/dhlab/nb_ngram/ngram/query';

// Process n-gram data
const processNgramData = (data, mode, smooth) => {
    if (!data || !data.length) return null;

    let processedData = [...data];

    // Apply mode-specific processing
    switch (mode) {
        case 'cumulative':
            processedData = processedData.map(series => {
                let sum = 0;
                return series.map(value => {
                    sum += value;
                    return sum;
                });
            });
            break;
            
        case 'cohort':
            // Calculate relative frequencies for each year
            processedData = processedData.map(series => {
                const total = series.reduce((a, b) => a + b, 0);
                return series.map(value => value / total);
            });
            break;
            
        case 'relative':
            // Already in relative format
            break;
            
        case 'absolute':
            // Already in absolute format
            break;
            
        default:
            // Default to relative frequency
            break;
    }

    // Apply smoothing if needed
    if (smooth > 1) {
        processedData = processedData.map(series => {
            return series.map((value, index) => {
                const start = Math.max(0, index - Math.floor(smooth / 2));
                const end = Math.min(series.length, index + Math.floor(smooth / 2) + 1);
                const window = series.slice(start, end);
                return window.reduce((a, b) => a + b, 0) / window.length;
            });
        });
    }

    return processedData;
};

// Fetch n-gram data from the API
const fetchNgramData = async (words, corpus, lang, graphType = 'relative', settings = {}) => {
    try {
        // Map corpus and language to correct API values
        const corpusMap = {
            'bok': 'bok',
            'avis': 'avis'
        };

        const langMap = {
            'nob': 'nob',  // Norwegian Bokmål
            'nno': 'nno',  // Norwegian Nynorsk
            'sme': 'sme',  // Northern Sami
            'smj': 'smj',  // Lule Sami
            'sma': 'sma',  // Southern Sami
            'fkv': 'fkv'   // Kven
        };

        // Use 'nor' for newspapers, otherwise use the selected language
        const apiLang = corpus === 'avis' ? 'nor' : langMap[lang] || 'nob';

        // Map graph type to API mode
        const modeMap = {
            'relative': 'relative',
            'absolute': 'absolutt',
            'cumulative': 'absolutt',
            'cohort': 'absolutt'
        };

        const params = new URLSearchParams({
            terms: words.join(','),
            lang: apiLang,
            case_sens: settings?.capitalization ? '1' : '0',
            corpus: corpusMap[corpus],
            mode: modeMap[graphType],
            smooth: '1',  // Set to 1 to turn off smoothing
            from: MIN_YEAR.toString(),
            to: MAX_YEAR.toString()
        });

        const url = `${NGRAM_API}?${params.toString()}`;
        console.log('DEBUG - API URL:', url);

        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                url: url,
                body: errorText
            });
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const ngrams = await response.json();
        console.log('API Response:', JSON.stringify(ngrams, null, 2));
        
        // Process the raw ngram data
        const processedData = {
            dates: [],
            series: []
        };

        // First, collect all unique years from all ngrams
        const allYears = new Set();
        ngrams.forEach(ngram => {
            if (ngram && ngram.values) {
                ngram.values.forEach(v => {
                    const year = parseInt(v.x);
                    // Only include years within the valid range
                    if (year >= MIN_YEAR && year <= MAX_YEAR) {
                        allYears.add(year);
                    }
                });
            }
        });
        
        // Convert to sorted array
        const sortedYears = Array.from(allYears).sort((a, b) => a - b);
        processedData.dates = sortedYears;

        // Extract data from the API response
        ngrams.forEach(ngram => {
            if (ngram && ngram.values) {
                const values = ngram.values;
                console.log('Processing ngram:', ngram.key, 'Values:', values);

                if (values.length > 0) {
                    // Create a map of year to value for this ngram
                    const yearToValue = new Map(
                        values
                            .filter(v => {
                                const year = parseInt(v.x);
                                return year >= MIN_YEAR && year <= MAX_YEAR;
                            })
                            .map(v => [parseInt(v.x), graphType === 'absolute' ? v.f : v.y])
                    );
                    
                    // Create data array with zeros for missing years
                    let data = sortedYears.map(year => yearToValue.get(year) || 0);

                    // Apply mode-specific processing
                    if (graphType === 'cumulative') {
                        let sum = 0;
                        data = data.map(val => {
                            sum += val;
                            return sum;
                        });
                    } else if (graphType === 'cohort') {
                        // Calculate row sums for normalization
                        const rowSums = sortedYears.map(year => 
                            ngrams.reduce((sum, n) => {
                                const value = n.values.find(v => parseInt(v.x) === year);
                                return sum + (value ? (graphType === 'absolute' ? value.f : value.y) : 0);
                            }, 0)
                        );
                        // Normalize by row sum
                        data = data.map((val, i) => rowSums[i] > 0 ? val / rowSums[i] : 0);
                    }

                    processedData.series.push({
                        name: ngram.key,
                        data
                    });
                }
            }
        });

        console.log('Processed Data:', JSON.stringify(processedData, null, 2));
        return processedData;
    } catch (error) {
        console.error('Error fetching ngram data:', error);
        throw error;
    }
};

export {
    MIN_YEAR,
    MAX_YEAR,
    processNgramData,
    fetchNgramData
}; 
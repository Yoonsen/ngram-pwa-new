// Constants
const SCHEMES = ['light', 'dark', 'ggplot2', 'seaborn'];
const LANGUAGES = ['nob', 'nno', 'sme', 'fkv'];
const MODES = [
    { label: 'Relativ', value: 'relative' },
    { label: 'Absolutt', value: 'absolute' },
    { label: 'Kumulativ', value: 'cumulative' },
    { label: 'Kohort', value: 'cohort' }
];
const CORPORA = [
    { label: 'Avis', value: 'avis' },
    { label: 'Bok', value: 'bok' }
];

import { fetchNgramData as fetchData, MIN_YEAR, MAX_YEAR } from './ngramProcessor';

// Process data based on selected mode
const processChartData = (data, mode, smooth) => {
    if (!data || !data.length) return null;

    let processedData = [...data];

    if (mode === 'cumulative') {
        processedData = processedData.map(series => {
            let sum = 0;
            return series.map(value => {
                sum += value;
                return sum;
            });
        });
    } else if (mode === 'cohort') {
        // Implement cohort calculation
        // This would need to be implemented based on your specific requirements
    }

    // Apply smoothing
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

// Fetch ngram data
const fetchNgramData = async (words, fromYear, toYear, doctype, lang, mode, smooth = 1) => {
    try {
        const wordsList = words.split(',').map(w => w.trim());
        return await fetchData(wordsList, fromYear, toYear, doctype, lang, mode, smooth);
    } catch (error) {
        console.error('Error fetching ngram data:', error);
        throw error;
    }
};

// Create National Library search query URL
const makeNbQuery = (name, mediatype, startDate, endDate) => {
    const params = new URLSearchParams({
        q: `"${name}"`,
        fromDate: startDate,
        toDate: endDate,
        mediatype: mediatype
    });
    return `https://www.nb.no/search?${params.toString()}`;
};

export {
    SCHEMES,
    LANGUAGES,
    MODES,
    CORPORA,
    MIN_YEAR,
    MAX_YEAR,
    processChartData,
    fetchNgramData,
    makeNbQuery
}; 
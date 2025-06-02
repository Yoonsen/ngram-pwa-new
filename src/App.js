import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import SearchControls from './components/SearchControls';
import NgramChartPlotly from './components/NgramChartPlotly';
import { fetchNgramData } from './services/ngramProcessor';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [graphType, setGraphType] = useState('relative');
    const [settings, setSettings] = useState({
        capitalization: false,
        smoothing: 4
    });
    const [corpus, setCorpus] = useState('');

    const handleSearch = async (words, corpus, lang, graphType) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchNgramData(words, corpus, lang, graphType, settings);
            setData(result);
            setCorpus(corpus);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCsv = () => {
        if (!data?.series) return;
        // Create CSV content
        const headers = ['Year', ...data.series.map(s => s.name)];
        const rows = data.dates.map((year, i) => {
            const values = data.series.map(s => s.data[i]);
            return [year, ...values];
        });
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ngram_data_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadExcel = () => {
        if (!data?.series) return;
        // Create Excel workbook
        const wb = XLSX.utils.book_new();
        
        // Create worksheet data
        const wsData = [
            ['Year', ...data.series.map(s => s.name)],
            ...data.dates.map((year, i) => {
                const values = data.series.map(s => s.data[i]);
                return [year, ...values];
            })
        ];
        
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Add metadata
        ws['!cols'] = [
            { wch: 10 }, // Year column width
            ...data.series.map(() => ({ wch: 15 })) // Data columns width
        ];
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Ngram Data');
        
        // Generate Excel file
        XLSX.writeFile(wb, `ngram_data_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <Container fluid className="p-4">
            <div className="mb-4">
                <SearchControls 
                    onSearch={handleSearch}
                    onGraphTypeChange={setGraphType}
                    data={data}
                    onSettingsChange={setSettings}
                />
            </div>
                    
            <div className="chart-container" style={{ height: 'calc(100vh - 120px)' }}>
                {loading && <div>Loading...</div>}
                {error && <div className="text-danger">{error}</div>}
                {data && <NgramChartPlotly 
                    data={data} 
                    graphType={graphType}
                    settings={settings}
                    corpus={corpus}
                    onDownloadCsv={handleDownloadCsv}
                    onDownloadExcel={handleDownloadExcel}
                />}
            </div>
        </Container>
    );
}

export default App; 
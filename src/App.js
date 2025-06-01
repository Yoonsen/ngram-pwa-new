import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import SearchControls from './components/SearchControls';
import NgramChartRecharts from './components/NgramChartRecharts';
import { fetchNgramData } from './services/ngramProcessor';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [graphType, setGraphType] = useState('relative');

    const handleSearch = async (words, corpus, lang, graphType) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchNgramData(words, corpus, lang, graphType);
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="p-4">
            <div className="mb-4">
                <SearchControls 
                    onSearch={handleSearch}
                    onGraphTypeChange={setGraphType}
                />
            </div>
            
            <div className="chart-container" style={{ height: 'calc(100vh - 120px)' }}>
                {loading && <div>Loading...</div>}
                {error && <div className="text-danger">{error}</div>}
                {data && <NgramChartRecharts data={data} graphType={graphType} />}
            </div>
        </Container>
    );
}

export default App; 
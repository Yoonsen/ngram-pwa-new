import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { fetchNgramData } from '../services/ngramProcessor';

const TestNgram = () => {
    const [words, setWords] = useState('frihet');
    const [corpus, setCorpus] = useState('avis');
    const [lang, setLang] = useState('nob');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        // Log the URL we're about to call
        const url = `https://api.nb.no/dhlab/nb_ngram/ngram/query?terms=${words}&corpus=${corpus}&lang=${lang}`;
        console.log('DEBUG - About to call URL:', url);
        
        try {
            const result = await fetchNgramData(
                [words],
                1950,
                2020,
                corpus,
                lang,
                'relative'
            );
            setData(result);
            console.log('API Response:', result);
        } catch (err) {
            setError(err.message);
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="m-3">
            <Card.Body>
                <Card.Title>Test N-gram API</Card.Title>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Words</Form.Label>
                        <Form.Control
                            type="text"
                            value={words}
                            onChange={(e) => setWords(e.target.value)}
                            placeholder="Enter words (comma-separated)"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Corpus</Form.Label>
                        <Form.Select
                            value={corpus}
                            onChange={(e) => setCorpus(e.target.value)}
                        >
                            <option value="avis">Avis (Newspapers)</option>
                            <option value="bok">Bok (Books)</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Language</Form.Label>
                        <Form.Select
                            value={lang}
                            onChange={(e) => setLang(e.target.value)}
                        >
                            <option value="nob">Norwegian Bokmål</option>
                            <option value="nno">Norwegian Nynorsk</option>
                        </Form.Select>
                    </Form.Group>

                    <Button type="submit" disabled={loading}>
                        {loading ? 'Loading...' : 'Fetch Data'}
                    </Button>
                </Form>

                {error && (
                    <div className="text-danger mt-3">
                        Error: {error}
                    </div>
                )}

                {data && (
                    <div className="mt-3">
                        <h5>Results:</h5>
                        <pre style={{ maxHeight: '300px', overflow: 'auto' }}>
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default TestNgram; 
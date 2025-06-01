import React, { useState, useEffect } from 'react';
import { Form, Button, ButtonGroup, InputGroup, Modal, Dropdown } from 'react-bootstrap';
import { FaBook, FaNewspaper, FaChartLine, FaSearch, FaLanguage } from 'react-icons/fa';

const SearchControls = ({ onSearch, onGraphTypeChange }) => {
    const [words, setWords] = useState('');
    const [corpus, setCorpus] = useState('bok');
    const [lang, setLang] = useState('nob');
    const [graphType, setGraphType] = useState('relative');
    const [showModal, setShowModal] = useState(false);

    const performSearch = () => {
        const wordList = words.split(',')
            .map(w => w.trim())
            .filter(w => w.length > 0);
        
        if (wordList.length === 0) {
            return;
        }
        
        console.log('Searching with:', {
            words: wordList,
            corpus,
            lang,
            graphType
        });
        
        onSearch(wordList, corpus, lang, graphType);
    };

    // Trigger search when parameters change
    useEffect(() => {
        if (words) {
            performSearch();
        }
    }, [corpus, lang, graphType]);

    const handleSubmit = (e) => {
        e.preventDefault();
        performSearch();
    };

    const handleGraphTypeSelect = (type) => {
        setGraphType(type);
        onGraphTypeChange(type);
        setShowModal(false);
    };

    const graphTypes = [
        { id: 'relative', label: 'Relative Frequency' },
        { id: 'absolute', label: 'Absolute Frequency' },
        { id: 'cumulative', label: 'Cumulative Frequency' },
        { id: 'cohort', label: 'Cohort Analysis' }
    ];

    const getCorpusLabel = (corpus) => corpus === 'bok' ? 'Books' : 'Newspapers';
    const getLangLabel = (lang) => {
        const labels = {
            'nob': 'Bokmål',
            'nno': 'Nynorsk',
            'sme': 'Northern Sami',
            'smj': 'Lule Sami',
            'sma': 'Southern Sami',
            'fkv': 'Kven'
        };
        return labels[lang] || lang;
    };

    const languages = [
        { code: 'nob', label: 'Bokmål' },
        { code: 'nno', label: 'Nynorsk' },
        { code: 'sme', label: 'Northern Sami' },
        { code: 'sma', label: 'Southern Sami' },
        { code: 'smj', label: 'Lule Sami' },
        { code: 'fkv', label: 'Kven' }
    ];

    return (
        <div className="d-flex flex-column gap-2">
            <Form onSubmit={handleSubmit} className="d-flex align-items-center gap-3">
                <InputGroup style={{ width: '40%' }}>
                    <Form.Control
                        type="text"
                        value={words}
                        onChange={(e) => setWords(e.target.value)}
                        placeholder="Enter words to search..."
                        aria-label="Search words"
                    />
                    <Dropdown>
                        <Dropdown.Toggle 
                            variant="outline-secondary" 
                            id="language-dropdown"
                            title={getLangLabel(lang)}
                        >
                            <FaLanguage />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {languages.map(l => (
                                <Dropdown.Item 
                                    key={l.code}
                                    active={lang === l.code}
                                    onClick={() => setLang(l.code)}
                                >
                                    {l.label}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                    <Button 
                        variant="primary" 
                        type="submit"
                        title="Search"
                    >
                        <FaSearch />
                    </Button>
                </InputGroup>

                <ButtonGroup>
                    <Button
                        variant={corpus === 'bok' ? 'primary' : 'outline-primary'}
                        onClick={() => setCorpus('bok')}
                        title="Books"
                    >
                        <FaBook />
                    </Button>
                    <Button
                        variant={corpus === 'avis' ? 'primary' : 'outline-primary'}
                        onClick={() => setCorpus('avis')}
                        title="Newspapers"
                    >
                        <FaNewspaper />
                    </Button>
                </ButtonGroup>

                <Button
                    variant="outline-primary"
                    onClick={() => setShowModal(true)}
                    title="Select Graph Type"
                >
                    <FaChartLine />
                </Button>
            </Form>

            {words && (
                <div className="text-muted small ms-2">
                    Searching for: {words} in {getCorpusLabel(corpus)} ({getLangLabel(lang)})
                </div>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Select Graph Type</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-grid gap-2">
                        {graphTypes.map(type => (
                            <Button
                                key={type.id}
                                variant={graphType === type.id ? 'primary' : 'outline-primary'}
                                onClick={() => handleGraphTypeSelect(type.id)}
                                className="text-start"
                            >
                                {type.label}
                            </Button>
                        ))}
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default SearchControls; 
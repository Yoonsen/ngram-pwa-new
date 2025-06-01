import React, { useState, useEffect } from 'react';
import { Form, Button, ButtonGroup, InputGroup, Modal, Dropdown } from 'react-bootstrap';
import { FaBook, FaNewspaper, FaChartLine, FaSearch, FaLanguage, FaTools } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const SearchControls = ({ onSearch, onGraphTypeChange, data, onSettingsChange }) => {
    const [words, setWords] = useState('');
    const [corpus, setCorpus] = useState('bok');
    const [lang, setLang] = useState('nob');
    const [graphType, setGraphType] = useState('relative');
    const [showModal, setShowModal] = useState(false);
    const [showLangDropdown, setShowLangDropdown] = useState(false);
    const [showCorpusDropdown, setShowCorpusDropdown] = useState(false);
    const [showGraphTypeDropdown, setShowGraphTypeDropdown] = useState(false);
    const [showToolsModal, setShowToolsModal] = useState(false);
    const [capitalization, setCapitalization] = useState(false);
    const [smoothing, setSmoothing] = useState(4);

    // Notify parent component of settings changes
    useEffect(() => {
        onSettingsChange?.({ capitalization, smoothing });
    }, [capitalization, smoothing, onSettingsChange]);

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
        <div className="d-flex flex-column gap-2 position-relative">
            <Form onSubmit={handleSubmit} className="d-flex align-items-center gap-3">
                <InputGroup style={{ width: '40%' }}>
                    <Form.Control
                        type="text"
                        value={words}
                        onChange={(e) => setWords(e.target.value)}
                        placeholder="Enter words to search..."
                        aria-label="Search words"
                    />
                    <div className="dropdown">
                        <button
                            className="btn btn-outline-secondary dropdown-toggle"
                            type="button"
                            onClick={() => setShowLangDropdown(!showLangDropdown)}
                        >
                            {lang}
                        </button>
                        {showLangDropdown && (
                            <div className="dropdown-menu show">
                                {languages.map(language => (
                                    <button
                                        key={language.code}
                                        className="dropdown-item"
                                        onClick={() => {
                                            setLang(language.code);
                                            setShowLangDropdown(false);
                                        }}
                                    >
                                        {language.code}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <Button 
                        variant="primary" 
                        type="submit"
                        title="Search"
                    >
                        <FaSearch />
                    </Button>
                </InputGroup>

                <ButtonGroup>
                    <div className="dropdown">
                        <button
                            className="btn btn-outline-secondary dropdown-toggle"
                            type="button"
                            onClick={() => setShowCorpusDropdown(!showCorpusDropdown)}
                        >
                            {corpus}
                        </button>
                        {showCorpusDropdown && (
                            <div className="dropdown-menu show">
                                <button
                                    className="dropdown-item"
                                    onClick={() => {
                                        setCorpus('bok');
                                        setShowCorpusDropdown(false);
                                    }}
                                >
                                    bok
                                </button>
                                <button
                                    className="dropdown-item"
                                    onClick={() => {
                                        setCorpus('avis');
                                        setShowCorpusDropdown(false);
                                    }}
                                >
                                    avis
                                </button>
                            </div>
                        )}
                    </div>
                </ButtonGroup>

                <div className="dropdown">
                    <button
                        className="btn btn-outline-secondary dropdown-toggle"
                        type="button"
                        onClick={() => setShowGraphTypeDropdown(!showGraphTypeDropdown)}
                    >
                        {graphType}
                    </button>
                    {showGraphTypeDropdown && (
                        <div className="dropdown-menu show">
                            {graphTypes.map(type => (
                                <button
                                    key={type.id}
                                    className="dropdown-item"
                                    onClick={() => {
                                        handleGraphTypeSelect(type.id);
                                        setShowGraphTypeDropdown(false);
                                    }}
                                >
                                    {type.id}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </Form>

            <Button
                variant="outline-secondary"
                size="sm"
                className="position-absolute top-0 end-0 mt-2 me-2"
                onClick={() => setShowToolsModal(true)}
            >
                <FaTools />
            </Button>

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

            <Modal show={showToolsModal} onHide={() => setShowToolsModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Tools</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-grid gap-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <Form.Label className="mb-0">Capitalization</Form.Label>
                            <Form.Check 
                                type="switch"
                                id="capitalization-switch"
                                checked={capitalization}
                                onChange={(e) => setCapitalization(e.target.checked)}
                            />
                        </div>
                        
                        <div>
                            <Form.Label>Smoothing: {smoothing} years</Form.Label>
                            <Form.Range
                                min={0}
                                max={20}
                                value={smoothing}
                                onChange={(e) => setSmoothing(parseInt(e.target.value))}
                            />
                        </div>

                        <hr />

                        <Button
                            variant="outline-primary"
                            onClick={() => {
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
                                setShowToolsModal(false);
                            }}
                        >
                            Download CSV
                        </Button>
                        <Button
                            variant="outline-success"
                            onClick={() => {
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
                                setShowToolsModal(false);
                            }}
                        >
                            Download Excel
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default SearchControls; 
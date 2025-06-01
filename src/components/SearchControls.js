import React, { useState, useEffect } from 'react';
import { Form, Button, ButtonGroup, InputGroup, Modal, Dropdown, Container } from 'react-bootstrap';
import { FaBook, FaNewspaper, FaChartLine, FaSearch, FaLanguage, FaTools, FaDownload } from 'react-icons/fa';
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
    const [lineThickness, setLineThickness] = useState(2);
    const [lineTransparency, setLineTransparency] = useState(0.1);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState({
        capitalization,
        smoothing,
        lineThickness,
        lineTransparency
    });

    const updateCapitalization = (newValue) => {
        setCapitalization(newValue);
        setSettings(prev => ({ ...prev, capitalization: newValue }));
        onSettingsChange?.({ 
            capitalization: newValue, 
            smoothing,
            lineThickness,
            lineTransparency
        });
    };

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

    const handleDownload = () => {
        if (!data?.series) return;
        const canvas = document.querySelector('canvas');
        const link = document.createElement('a');
        link.download = `ngram_graph_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const handleDownloadExcel = () => {
        if (!data?.series) return;
        // Create Excel workbook
        const wb = XLSX.utils.book_new();
        
        // Create worksheet data
        const headers = ['Year', ...data.series.map(s => s.name)];
        const rows = data.dates.map((year, i) => {
            const values = data.series.map(s => s.data[i]);
            return [year, ...values];
        });
        
        const wsData = [
            headers,
            ...rows
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
        <div className="d-flex flex-column flex-md-row gap-3 align-items-start w-100">
            <div className="d-flex flex-column flex-md-row gap-3 align-items-start w-100">
                <Form onSubmit={handleSubmit} className="d-flex align-items-center gap-3 flex-grow-1">
                    <InputGroup className="flex-grow-1">
                        <Form.Control
                            type="text"
                            value={words}
                            onChange={(e) => setWords(e.target.value)}
                            placeholder="Skriv ord skilt med komma"
                            aria-label="Search words"
                            style={{ borderRight: 'none' }}
                        />
                        <div className="dropdown">
                            <button
                                className="btn btn-outline-secondary dropdown-toggle"
                                type="button"
                                onClick={() => setShowLangDropdown(!showLangDropdown)}
                                style={{ 
                                    borderLeft: 'none',
                                    borderRadius: '0',
                                    borderTop: '1px solid #ced4da',
                                    borderBottom: '1px solid #ced4da',
                                    borderRight: '1px solid #ced4da'
                                }}
                                disabled={corpus === 'avis'}
                            >
                                {corpus === 'avis' ? 'nor' : lang}
                            </button>
                            {showLangDropdown && corpus !== 'avis' && (
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
                </Form>

                <div className="d-flex gap-2">
                    <ButtonGroup>
                        <div className="dropdown">
                            <button
                                className="btn btn-outline-secondary dropdown-toggle"
                                type="button"
                                onClick={() => setShowCorpusDropdown(!showCorpusDropdown)}
                                style={{ 
                                    borderColor: '#ced4da'
                                }}
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
                            className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center"
                            type="button"
                            onClick={() => setShowGraphTypeDropdown(!showGraphTypeDropdown)}
                            style={{ 
                                borderColor: '#ced4da',
                                position: 'relative',
                                zIndex: 1001,
                                minWidth: '120px'
                            }}
                        >
                            {graphType === 'relative' ? 'Relativ' :
                             graphType === 'absolute' ? 'Absolutt' :
                             graphType === 'cumulative' ? 'Kumulativ' :
                             'Kohort'}
                        </button>
                        {showGraphTypeDropdown && (
                            <div className="dropdown-menu show d-flex flex-column" style={{ 
                                position: 'absolute',
                                zIndex: 1000,
                                top: '100%',
                                left: 0,
                                marginTop: '0.125rem',
                                minWidth: '120px'
                            }}>
                                <button className="dropdown-item" onClick={() => {
                                    handleGraphTypeSelect('relative');
                                    setShowGraphTypeDropdown(false);
                                }}>Relativ</button>
                                <button className="dropdown-item" onClick={() => {
                                    handleGraphTypeSelect('absolute');
                                    setShowGraphTypeDropdown(false);
                                }}>Absolutt</button>
                                <button className="dropdown-item" onClick={() => {
                                    handleGraphTypeSelect('cumulative');
                                    setShowGraphTypeDropdown(false);
                                }}>Kumulativ</button>
                                <button className="dropdown-item" onClick={() => {
                                    handleGraphTypeSelect('cohort');
                                    setShowGraphTypeDropdown(false);
                                }}>Kohort</button>
                            </div>
                        )}
                    </div>

                    <div className="d-flex gap-2">
                        <Button 
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => {
                                if (!data?.series) return;
                                const canvas = document.querySelector('canvas');
                                const link = document.createElement('a');
                                link.download = `ngram_graph_${new Date().toISOString().split('T')[0]}.png`;
                                link.href = canvas.toDataURL('image/png');
                                link.click();
                            }}
                            style={{ 
                                borderColor: '#ced4da',
                                backgroundColor: 'white'
                            }}
                        >
                            <FaDownload />
                        </Button>
                        <Button 
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setShowToolsModal(true)}
                            style={{ 
                                borderColor: '#ced4da',
                                backgroundColor: 'white'
                            }}
                        >
                            <FaTools />
                        </Button>
                    </div>
                </div>
            </div>

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
                    <Modal.Title>Verktøy</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-grid gap-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <Form.Label className="mb-0">Skill mellom stor og liten forbokstav</Form.Label>
                            <Form.Check 
                                type="switch"
                                id="capitalization-switch"
                                checked={capitalization}
                                onChange={(e) => updateCapitalization(e.target.checked)}
                            />
                        </div>
                        
                        <div>
                            <Form.Label>Utjevning av kurve: {smoothing} år</Form.Label>
                            <Form.Range
                                min={0}
                                max={20}
                                value={smoothing}
                                onChange={(e) => {
                                    const newValue = parseInt(e.target.value);
                                    setSmoothing(newValue);
                                    onSettingsChange?.({ 
                                        capitalization, 
                                        smoothing: newValue,
                                        lineThickness,
                                        lineTransparency
                                    });
                                    if (words) {
                                        onSearch(words.split(',').map(w => w.trim()).filter(w => w.length > 0), corpus, lang, graphType);
                                    }
                                }}
                            />
                        </div>

                        <div>
                            <Form.Label>Linjetykkelse: {lineThickness}px</Form.Label>
                            <Form.Range
                                min={1}
                                max={10}
                                value={lineThickness}
                                onChange={(e) => {
                                    const newValue = parseInt(e.target.value);
                                    setLineThickness(newValue);
                                    onSettingsChange?.({ 
                                        capitalization, 
                                        smoothing,
                                        lineThickness: newValue,
                                        lineTransparency
                                    });
                                }}
                            />
                        </div>

                        <div>
                            <Form.Label>Transparens: {Math.round(lineTransparency * 100)}%</Form.Label>
                            <Form.Range
                                min={0}
                                max={100}
                                value={lineTransparency * 100}
                                onChange={(e) => {
                                    const newValue = parseInt(e.target.value) / 100;
                                    setLineTransparency(newValue);
                                    onSettingsChange?.({ 
                                        capitalization, 
                                        smoothing,
                                        lineThickness,
                                        lineTransparency: newValue
                                    });
                                }}
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
                            Last ned som CSV
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
                            Last ned som Excel
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default SearchControls; 
import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, ButtonGroup, InputGroup, Modal, Dropdown, Container } from 'react-bootstrap';
import { FaBook, FaNewspaper, FaChartLine, FaSearch, FaLanguage, FaTools, FaDownload } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import DownloadModal from './DownloadModal';

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
    const [showDownloadModal, setShowDownloadModal] = useState(false);
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
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [lastSearchedWords, setLastSearchedWords] = useState('');

    const debouncedSearch = useCallback((immediate = false) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        if (immediate) {
            performSearch();
            return;
        }

        const newTimeout = setTimeout(() => {
            // Only perform search if we have a complete word (no typing in progress)
            if (!words.endsWith(',')) {
                performSearch();
            }
        }, 2000);

        setSearchTimeout(newTimeout);
    }, [searchTimeout, words]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    const updateCapitalization = (newValue) => {
        setCapitalization(newValue);
        setSettings(prev => ({ ...prev, capitalization: newValue }));
        onSettingsChange?.({ 
            capitalization: newValue, 
            smoothing,
            lineThickness,
            lineTransparency
        });
        // Trigger a new search with updated capitalization setting
        if (words) {
            performSearch();
        }
    };

    const performSearch = () => {
        // Don't search if we've already searched these exact words
        if (words === lastSearchedWords) {
            return;
        }

        // Split by comma and filter out empty strings
        const wordList = words
            .split(',')
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
        
        setLastSearchedWords(words);
        onSearch(wordList, corpus, lang, graphType);
    };

    // Only trigger search when corpus/lang/graphType changes if we have words
    useEffect(() => {
        if (words.trim()) {
            performSearch();
        }
    }, [corpus, lang, graphType]);

    const handleSubmit = (e) => {
        e.preventDefault();
        performSearch(); // Immediate search on form submit
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
        { code: 'nob', label: 'Bokmål', fullName: 'Norsk bokmål' },
        { code: 'nno', label: 'Nynorsk', fullName: 'Norsk nynorsk' },
        { code: 'sme', label: 'Nordsamisk', fullName: 'Davvisámegiella' },
        { code: 'sma', label: 'Sørsamisk', fullName: 'Åarjelsaemien gïele' },
        { code: 'smj', label: 'Lulesamisk', fullName: 'Julevsámegiella' },
        { code: 'fkv', label: 'Kvensk', fullName: 'Kainun kieli' }
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
                            onChange={(e) => {
                                const newValue = e.target.value;
                                setWords(newValue);
                                
                                // Clear any pending debounced searches
                                if (searchTimeout) {
                                    clearTimeout(searchTimeout);
                                    setSearchTimeout(null);
                                }

                                // Only trigger search in specific cases:
                                // 1. When a comma is typed (immediate search)
                                // 2. When typing normally (debounced search)
                                if (newValue.endsWith(',')) {
                                    // If we just typed a comma, search immediately
                                    const lastWord = newValue.split(',').slice(-2, -1)[0];
                                    if (lastWord && lastWord.trim()) {
                                        performSearch();
                                    }
                                } else if (newValue.trim() && !newValue.endsWith(',')) {
                                    // Only set up debounced search if this is a new word
                                    const words = newValue.split(',').map(w => w.trim());
                                    const lastWord = words[words.length - 1];
                                    if (lastWord && lastWord.length > 1) { // Only search if word is longer than 1 char
                                        const newTimeout = setTimeout(() => {
                                            performSearch();
                                        }, 2000);
                                        setSearchTimeout(newTimeout);
                                    }
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (searchTimeout) {
                                        clearTimeout(searchTimeout);
                                        setSearchTimeout(null);
                                    }
                                    performSearch();
                                }
                            }}
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
                                title={languages.find(l => l.code === lang)?.fullName || lang}
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
                                            title={language.fullName}
                                    >
                                            {language.label}
                                        </button>
                                ))}
                                </div>
                            )}
                        </div>
                        <Button 
                            variant="outline-secondary" 
                            type="submit"
                            title="Search"
                            style={{
                                backgroundColor: 'white',
                                border: '1px solid #ced4da',
                                borderLeft: 'none',
                                color: '#212529'
                            }}
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
                                    border: 'none'
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
                                border: 'none',
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
                            onClick={() => setShowDownloadModal(true)}
                            style={{ 
                                border: 'none',
                                backgroundColor: 'transparent'
                            }}
                        >
                            <FaDownload />
                        </Button>
                        <Button 
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setShowToolsModal(true)}
                            style={{ 
                                border: 'none',
                                backgroundColor: 'transparent'
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
                                }}
                            />
                        </div>

                        <div>
                            <Form.Label>Linjetykkelse: {lineThickness}</Form.Label>
                            <Form.Range
                                min={1}
                                max={5}
                                step={0.5}
                                value={lineThickness}
                                onChange={(e) => {
                                    const newValue = parseFloat(e.target.value);
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
                            <Form.Label>Gjennomsiktighet: {Math.round(lineTransparency * 100)}%</Form.Label>
                            <Form.Range
                                min={0.1}
                                max={1}
                                step={0.1}
                                value={lineTransparency}
                                onChange={(e) => {
                                    const newValue = parseFloat(e.target.value);
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
                    </div>
                </Modal.Body>
            </Modal>

            <DownloadModal
                show={showDownloadModal}
                onHide={() => setShowDownloadModal(false)}
                onDownloadCsv={handleDownload}
                onDownloadExcel={handleDownloadExcel}
            />
        </div>
    );
};

export default SearchControls; 
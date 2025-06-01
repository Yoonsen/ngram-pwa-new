import React, { useEffect, useRef, useState } from 'react';
import { Container, Button, ButtonGroup, Modal } from 'react-bootstrap';
import { Chart, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import * as XLSX from 'xlsx';
import { MIN_YEAR, MAX_YEAR } from '../services/ngramProcessor';

// Register Chart.js components and zoom plugin
Chart.register(...registerables, zoomPlugin);

const NgramChartRecharts = ({ data, graphType = 'relative', settings = { capitalization: false, smoothing: 4 }, corpus: corpusType }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomStart, setZoomStart] = useState(null);
    const [zoomEnd, setZoomEnd] = useState(null);
    const [currentZoomState, setCurrentZoomState] = useState(null);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedWord, setSelectedWord] = useState(null);

    const handleChartClick = (event) => {
        const chart = chartInstance.current;
        if (!chart) return;

        const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
        if (elements.length === 0) return;

        const element = elements[0];
        const datasetIndex = element.datasetIndex;
        const dataIndex = element.index;
        
        const year = data.dates[dataIndex];
        const word = data.series[datasetIndex].name;
        
        setSelectedYear(year);
        setSelectedWord(word);
        setShowSearchModal(true);
    };

    const openSearch = (period) => {
        if (!selectedWord || !selectedYear) return;

        let fromDate, toDate;
        const year = parseInt(selectedYear);
        
        switch(period) {
            case 'exact':
                fromDate = `${year}0101`;
                toDate = `${year}1231`;
                break;
            case 'range':
                fromDate = `${year - 5}0101`;
                toDate = `${year + 5}1231`;
                break;
            case 'open':
                fromDate = '';
                toDate = '';
                break;
        }

        const mediatype = corpusType === 'avis' ? 'aviser' : 'bøker';
        const searchUrl = `https://www.nb.no/search?q="${encodeURIComponent(selectedWord)}"&mediatype=${mediatype}${fromDate ? `&fromDate=${fromDate}` : ''}${toDate ? `&toDate=${toDate}` : ''}`;
        window.open(searchUrl, '_blank');
        setShowSearchModal(false);
    };

    const resetZoom = () => {
        if (chartInstance.current) {
            chartInstance.current.resetZoom();
            setIsZoomed(false);
            setZoomStart(null);
            setZoomEnd(null);
            setCurrentZoomState(null);
        }
    };

    useEffect(() => {
        if (!data || !data.series) return;

        // Log raw data for debugging
        console.log('Raw data from API:', data);
        data.series.forEach(series => {
            console.log(`Series ${series.name} values:`, series.data);
        });

        // Transform data for Chart.js
        const labels = data.dates;
        const datasets = data.series.map((series, index) => {
            let values = [...series.data];
            
            // Log raw values for debugging
            console.log(`Raw values for ${series.name}:`, values);
            
            // Apply smoothing if enabled
            if (settings.smoothing > 0) {
                const smoothed = [];
                for (let i = 0; i < values.length; i++) {
                    const start = Math.max(0, i - Math.floor(settings.smoothing / 2));
                    const end = Math.min(values.length - 1, i + Math.floor(settings.smoothing / 2));
                    const window = values.slice(start, end + 1);
                    const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
                    smoothed.push(avg);
                }
                values = smoothed;
                console.log(`Smoothed values for ${series.name}:`, values);
            }
            
            // Handle cumulative data
            if (graphType === 'cumulative') {
                let sum = 0;
                values = values.map(val => {
                    sum += val;
                    return sum;
                });
                console.log(`Cumulative values for ${series.name}:`, values);
            }
            
            // Remove unnecessary absolute value conversion
            // The API already provides absolute counts in the 'f' field
            
            // Handle cohort data
            if (graphType === 'cohort') {
                // Calculate yearly totals across all words
                const yearlyTotals = data.series.reduce((totals, series) => {
                    series.data.forEach((value, index) => {
                        if (!totals[index]) totals[index] = 0;
                        totals[index] += value;
                    });
                    return totals;
                }, {});

                // Calculate proportions within each year
                values = values.map((value, index) => {
                    const yearTotal = yearlyTotals[index];
                    return yearTotal > 0 ? value / yearTotal : 0;
                });
            }

            const strokeWidth = settings?.lineThickness || 2;

            return {
                label: series.name,
                data: values,
                borderColor: series.name === 'bok' ? `rgba(31, 119, 180, ${1 - (settings?.lineTransparency || 0.1)})` : 
                            series.name === 'avis' ? `rgba(255, 127, 14, ${1 - (settings?.lineTransparency || 0.1)})` :
                            `hsla(${(index * 360) / data.series.length}, 70%, 50%, ${1 - (settings?.lineTransparency || 0.1)})`,
                backgroundColor: series.name === 'bok' ? 'rgba(31, 119, 180, 0.1)' :
                                series.name === 'avis' ? 'rgba(255, 127, 14, 0.1)' :
                                `hsla(${(index * 360) / data.series.length}, 70%, 50%, 0.1)`,
                borderWidth: strokeWidth,
                pointRadius: 0,  // Hide points by default
                pointHoverRadius: 12,  // Show larger points on hover
                pointHitRadius: 20,  // Keep large hit area for better click detection
                pointStyle: 'circle',
                tension: 0.4,
                showLine: true,
                pointBackgroundColor: series.name === 'bok' ? '#1f77b4' : 
                                    series.name === 'avis' ? '#ff7f0e' :
                                    `hsl(${(index * 360) / data.series.length}, 70%, 50%)`,
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            };
        });

        const ctx = chartRef.current.getContext('2d');

        // Destroy existing chart if it exists
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        // Create new chart
        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'nearest',
                    intersect: true,
                    axis: 'xy'
                },
                onClick: handleChartClick,
                onHover: (event, elements) => {
                    event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#000',
                        bodyColor: '#000',
                        borderColor: '#ccc',
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                
                                if (graphType === 'cohort') {
                                    return `${context.dataset.label}: ${(value * 100).toFixed(2)}%`;
                                } else if (graphType === 'cumulative') {
                                    return `${context.dataset.label}: ${Math.round(value).toLocaleString()}`;
                                } else if (graphType === 'absolute') {
                                    return `${context.dataset.label}: ${Math.round(value).toLocaleString()}`;
                                } else if (graphType === 'relative') {
                                    return `${context.dataset.label}: ${value.toFixed(4)}%`;
                                }
                                return `${context.dataset.label}: ${value}`;
                            }
                        }
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x',
                            modifierKey: 'shift',
                            threshold: 10,
                            onPan: () => {
                                setIsZoomed(true);
                            }
                        },
                        zoom: {
                            mode: 'x',
                            drag: {
                                enabled: true,
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                borderColor: 'rgba(0,0,0,0.3)',
                                borderWidth: 1,
                                threshold: 10
                            },
                            pinch: {
                                enabled: true
                            },
                            wheel: {
                                enabled: false
                            },
                            limits: {
                                x: {
                                    min: MIN_YEAR,
                                    max: MAX_YEAR,
                                    minRange: 5
                                }
                            },
                            onZoom: ({chart}) => {
                                setIsZoomed(true);
                                const start = Math.max(MIN_YEAR, chart.scales.x.min);
                                const end = Math.min(MAX_YEAR, chart.scales.x.max);
                                setZoomStart(Math.round(start));
                                setZoomEnd(Math.round(end));
                                setCurrentZoomState({ start, end });
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Year'
                        },
                        ticks: {
                            maxTicksLimit: 10,
                            callback: function(value) {
                                return Math.round(value).toString().replace(/\s/g, '');
                            }
                        },
                        min: Math.max(MIN_YEAR, currentZoomState ? currentZoomState.start : MIN_YEAR),
                        max: Math.min(MAX_YEAR, currentZoomState ? currentZoomState.end : MAX_YEAR),
                        bounds: 'ticks'
                    },
                    y: {
                        title: {
                            display: true,
                            text: graphType === 'relative' ? 'Relativ frekvens i prosent' :
                                  graphType === 'absolute' ? 'Antall forekomster totalt' :
                                  graphType === 'cumulative' ? 'Kumulativt antall' :
                                  'Kohort'
                        },
                        ticks: {
                            callback: function(value) {
                                if (graphType === 'absolute' || graphType === 'cumulative') {
                                    return Math.round(value).toLocaleString();
                                } else if (graphType === 'relative') {
                                    return value.toFixed(4) + '%';
                                } else if (graphType === 'cohort') {
                                    return (value * 100).toFixed(2) + '%';
                                }
                                return value;
                            }
                        }
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data, graphType, currentZoomState, settings.smoothing, settings.lineThickness, settings.lineTransparency]);

    return (
        <Container fluid className="p-0">
            <div style={{ 
                width: '100%', 
                height: 400,
                position: 'relative'
            }}>
                <canvas 
                    ref={chartRef} 
                    style={{
                        touchAction: 'none',
                        userSelect: 'none'
                    }}
                />
            </div>
            <div className="text-center mt-2">
                <small className="text-muted">
                    Klikk å dra for å indikere en periode (zoom inn)
                </small>
                <div className="mt-2">
                        <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={resetZoom}
                            className="me-2"
                        >
                        Gjenopprett hele perioden
                    </Button>
                </div>
            </div>

            <Modal show={showSearchModal} onHide={() => setShowSearchModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Søk i Nasjonalbiblioteket</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Søk etter "{selectedWord}" i {corpusType === 'avis' ? 'aviser' : 'bøker'}:</p>
                    <div className="d-grid gap-2">
                        <Button variant="outline-primary" onClick={() => openSearch('exact')}>
                            Søk i {selectedYear}
                        </Button>
                        <Button variant="outline-primary" onClick={() => openSearch('range')}>
                            Søk i perioden {selectedYear - 5} - {selectedYear + 5}
                        </Button>
                        <Button variant="outline-primary" onClick={() => openSearch('open')}>
                            Åpen søk
                        </Button>
                </div>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default NgramChartRecharts; 
import React, { useEffect, useRef, useState } from 'react';
import { Container, Button, ButtonGroup, Modal } from 'react-bootstrap';
import { Chart, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import * as XLSX from 'xlsx';

// Register Chart.js components and zoom plugin
Chart.register(...registerables, zoomPlugin);

const NgramChartRecharts = ({ data, graphType = 'relative', settings = { capitalization: false, smoothing: 4 }, corpus }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomStart, setZoomStart] = useState(null);
    const [zoomEnd, setZoomEnd] = useState(null);
    const [lastZoomState, setLastZoomState] = useState(null);
    const [currentZoomState, setCurrentZoomState] = useState(null);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedWord, setSelectedWord] = useState(null);

    const resetZoom = () => {
        if (chartInstance.current) {
            chartInstance.current.resetZoom();
            setIsZoomed(false);
            setZoomStart(null);
            setZoomEnd(null);
            setLastZoomState(null);
            setCurrentZoomState(null);
        }
    };

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

        const mediatype = corpus === 'avis' ? 'aviser' : 'bøker';
        const searchUrl = `https://www.nb.no/search?q="${encodeURIComponent(selectedWord)}"&mediatype=${mediatype}${fromDate ? `&fromDate=${fromDate}` : ''}${toDate ? `&toDate=${toDate}` : ''}`;
        window.open(searchUrl, '_blank');
        setShowSearchModal(false);
    };

    useEffect(() => {
        if (!data || !data.series) return;

        // Transform data for Chart.js
        const labels = data.dates;
        const datasets = data.series.map((series, index) => {
            let values = [...series.data];
            
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
            }
            
            // Handle cumulative data
            if (graphType === 'cumulative') {
                values = values.map((_, i) => 
                    values.slice(0, i + 1).reduce((sum, val) => sum + val, 0)
                );
            }
            
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

            return {
                label: series.name,
                data: values,
                borderColor: series.name === 'bok' ? '#1f77b4' : 
                            series.name === 'avis' ? '#ff7f0e' :
                            `hsl(${(index * 360) / data.series.length}, 70%, 50%)`,
                backgroundColor: series.name === 'bok' ? 'rgba(31, 119, 180, 0.1)' :
                                series.name === 'avis' ? 'rgba(255, 127, 14, 0.1)' :
                                `hsla(${(index * 360) / data.series.length}, 70%, 50%, 0.1)`,
                borderWidth: series.name === 'bok' || series.name === 'avis' ? 3 : 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                tension: 0.4
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
                    intersect: false,
                    axis: 'x'
                },
                onClick: handleChartClick,
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
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#000',
                        bodyColor: '#000',
                        borderColor: '#ccc',
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                return graphType === 'cohort' ? 
                                    `${context.dataset.label}: ${(value * 100).toFixed(2)}%` :
                                    `${context.dataset.label}: ${value.toFixed(6)}`;
                            }
                        }
                    },
                    zoom: {
                        limits: {
                            x: {min: 'original', max: 'original'}
                        },
                        pan: {
                            enabled: true,
                            mode: 'x',
                            threshold: 5,
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
                                onDragStart: (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const chart = chartInstance.current;
                                    const rect = chart.canvas.getBoundingClientRect();
                                    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
                                    const xValue = chart.scales.x.getValueForPixel(x);
                                    setZoomStart(Math.round(xValue));
                                },
                                onDrag: (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const chart = chartInstance.current;
                                    const rect = chart.canvas.getBoundingClientRect();
                                    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
                                    const xValue = chart.scales.x.getValueForPixel(x);
                                    setZoomEnd(Math.round(xValue));
                                },
                                onDragEnd: (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const chart = chartInstance.current;
                                    const rect = chart.canvas.getBoundingClientRect();
                                    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
                                    const xValue = chart.scales.x.getValueForPixel(x);
                                    setZoomEnd(Math.round(xValue));
                                    const newZoomState = {
                                        start: Math.min(zoomStart, Math.round(xValue)),
                                        end: Math.max(zoomStart, Math.round(xValue))
                                    };
                                    setLastZoomState(newZoomState);
                                    setCurrentZoomState(newZoomState);
                                    setTimeout(() => {
                                        setZoomStart(null);
                                        setZoomEnd(null);
                                    }, 2000);
                                }
                            },
                            pinch: {
                                enabled: true,
                                onPinch: () => {
                                    setIsZoomed(true);
                                }
                            },
                            wheel: {
                                enabled: true
                            },
                            onZoom: () => {
                                setIsZoomed(true);
                                const chart = chartInstance.current;
                                if (chart) {
                                    const newZoomState = {
                                        start: chart.scales.x.min,
                                        end: chart.scales.x.max
                                    };
                                    setCurrentZoomState(newZoomState);
                                }
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
                        // Apply current zoom state if it exists
                        min: currentZoomState ? currentZoomState.start : undefined,
                        max: currentZoomState ? currentZoomState.end : undefined
                    },
                    y: {
                        title: {
                            display: true,
                            text: graphType === 'relative' ? 'Relativ frekvens i prosent' :
                                  graphType === 'absolute' ? 'Antall forekomster totalt' :
                                  graphType === 'cumulative' ? 'Kumulativt antall' :
                                  'Kohort'
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
    }, [data, graphType, currentZoomState, settings.smoothing]);

    return (
        <Container fluid className="p-0">
            <div style={{ 
                width: '100%', 
                height: 400,
                position: 'relative',
                touchAction: 'none'
            }}>
                <canvas 
                    ref={chartRef} 
                    style={{
                        touchAction: 'none',
                        userSelect: 'none'
                    }}
                />
                {(zoomStart !== null || zoomEnd !== null) && (
                    <div style={{
                        position: 'absolute',
                        top: '50px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        zIndex: 1000,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                        transition: 'all 0.2s ease',
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap'
                    }}>
                        {zoomStart && zoomEnd ? 
                            `Selected: ${zoomStart} - ${zoomEnd}` :
                            zoomStart ? 
                            `From ${zoomStart}` :
                            `To ${zoomEnd}`
                        }
                    </div>
                )}
            </div>
            <div className="text-center mt-2">
                <small className="text-muted">
                    Klikk å dra for å indikere en periode (zoom inn)
                </small>
                <div className="mt-2">
                    {isZoomed && (
                        <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={resetZoom}
                            className="me-2"
                        >
                            Gjenopprett hele perioden
                        </Button>
                    )}
                </div>
            </div>

            <Modal show={showSearchModal} onHide={() => setShowSearchModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Søk i Nasjonalbiblioteket</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Søk etter "{selectedWord}" i {corpus === 'avis' ? 'aviser' : 'bøker'}:</p>
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
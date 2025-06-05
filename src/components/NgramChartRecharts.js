import React, { useEffect, useRef, useState } from 'react';
import { Container, Button, ButtonGroup, Modal } from 'react-bootstrap';
import { Chart, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import * as XLSX from 'xlsx';
import { MIN_YEAR, MAX_YEAR } from '../services/ngramProcessor';
import { FaUndo } from 'react-icons/fa';

// Register Chart.js components and zoom plugin
Chart.register(...registerables, zoomPlugin);

const NgramChartRecharts = ({ data, graphType = 'relative', settings = { 
    capitalization: false, 
    smoothing: 4,
    zoomStart: MIN_YEAR,
    zoomEnd: MAX_YEAR
}, corpus: corpusType }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomStart, setZoomStart] = useState(null);
    const [zoomEnd, setZoomEnd] = useState(null);
    const [currentZoomState, setCurrentZoomState] = useState(null);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedWord, setSelectedWord] = useState(null);
    const [isNarrow, setIsNarrow] = useState(false);

    // Add resize observer to detect container width
    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const width = entry.contentRect.width;
                setIsNarrow(width < 992); // Bootstrap's lg breakpoint
            }
        });

        if (chartRef.current) {
            resizeObserver.observe(chartRef.current.parentElement);
        }

        return () => {
            if (chartRef.current) {
                resizeObserver.unobserve(chartRef.current.parentElement);
            }
        };
    }, []);

    const handleChartClick = (event) => {
        const chart = chartInstance.current;
        if (!chart) return;

        // Check if we're in the middle of a zoom operation
        if (event.native.ctrlKey || event.native.shiftKey) {
            return;  // Don't trigger search during zoom
        }

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
                animation: false, // Disable animations for better performance
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x',
                            modifierKey: 'ctrl',
                            onPan: () => {
                                setIsZoomed(true);
                                if (chartInstance.current) {
                                    const chart = chartInstance.current;
                                    const start = Math.max(MIN_YEAR, chart.scales.x.min);
                                    const end = Math.min(MAX_YEAR, chart.scales.x.max);
                                    setZoomStart(Math.round(start));
                                    setZoomEnd(Math.round(end));
                                    setCurrentZoomState({ start, end });
                                    chart.update('none'); // Update without animation
                                }
                            }
                        },
                        zoom: {
                            wheel: {
                                enabled: true,
                                modifierKey: 'ctrl',
                            },
                            pinch: {
                                enabled: true
                            },
                            drag: {
                                enabled: true,
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                borderColor: 'rgba(0,0,0,0.3)',
                                borderWidth: 1
                            },
                            mode: 'x',
                            onZoom: ({chart}) => {
                                setIsZoomed(true);
                                const start = Math.max(MIN_YEAR, chart.scales.x.min);
                                const end = Math.min(MAX_YEAR, chart.scales.x.max);
                                setZoomStart(Math.round(start));
                                setZoomEnd(Math.round(end));
                                setCurrentZoomState({ start, end });
                                chart.update('none'); // Update without animation
                            }
                        },
                        limits: {
                            x: {
                                min: settings.zoomStart,
                                max: settings.zoomEnd,
                                minRange: 5
                            }
                        }
                    },
                    legend: {
                        position: isNarrow ? 'bottom' : 'right',
                        align: 'start',
                        labels: {
                            boxWidth: 12,
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('no-NO').format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        min: currentZoomState ? Math.floor(currentZoomState.start) : settings.zoomStart,
                        max: currentZoomState ? Math.ceil(currentZoomState.end) : settings.zoomEnd,
                        ticks: {
                            callback: function(value) {
                                return Math.round(value);
                            },
                            stepSize: 1
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('no-NO').format(value);
                            }
                        }
                    }
                },
                onClick: handleChartClick
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data, graphType, currentZoomState, settings.smoothing, settings.lineThickness, settings.lineTransparency, isNarrow, settings.zoomStart, settings.zoomEnd]);

    return (
        <div className="d-flex flex-column flex-lg-row gap-3">
            <div className="flex-grow-1">
                <div style={{ minHeight: '400px', position: 'relative' }}>
                    <canvas ref={chartRef} style={{ touchAction: 'none', userSelect: 'none' }}></canvas>
                    {isZoomed && (
                        <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={resetZoom}
                            className="position-absolute"
                            style={{ 
                                bottom: '10px', 
                                right: '10px',
                                zIndex: 1,
                                padding: '0.25rem 0.5rem',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)'
                            }}
                            title="Gjenopprett hele perioden"
                        >
                            <FaUndo />
                        </Button>
                    )}
                </div>
                <div className="text-center mt-2">
                    <small className="text-muted">
                        Klikk å dra for å indikere en periode (zoom inn)
                    </small>
                </div>
            </div>
            <div className="d-flex flex-column justify-content-center">
                <div className="chart-legend"></div>
            </div>
            <Modal show={showSearchModal} onHide={() => setShowSearchModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Søk i Nasjonalbiblioteket</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Velg tidsperiode for søk i Nasjonalbiblioteket:</p>
                    <div className="d-flex gap-2">
                        <Button variant="outline-primary" onClick={() => openSearch('exact')}>
                            Nøyaktig år
                        </Button>
                        <Button variant="outline-primary" onClick={() => openSearch('range')}>
                            ±5 år
                        </Button>
                        <Button variant="outline-primary" onClick={() => openSearch('open')}>
                            Hele perioden
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default NgramChartRecharts; 
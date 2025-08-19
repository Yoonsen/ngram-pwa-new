import React, { useState, useEffect, useCallback } from 'react';
import Plot from 'react-plotly.js';
import ConcordanceModal from './ConcordanceModal';
import DownloadModal from './DownloadModal';

const START_YEAR = 1810;

const NgramChartPlotly = ({ data, corpus = 'avis', onDownloadCsv, onDownloadExcel, settings, graphType = 'relative' }) => {
    const [modalData, setModalData] = useState(null);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [viewRange, setViewRange] = useState(null);
    const [containerWidth, setContainerWidth] = useState(null);

    // Add resize handler
    useEffect(() => {
        const handleResize = () => {
            const container = document.querySelector('.chart-container');
            if (container) {
                setContainerWidth(container.offsetWidth);
            }
        };

        handleResize(); // Initial size
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Apply smoothing to data
    const smoothData = useCallback((data, smoothing) => {
        if (!smoothing || smoothing <= 1) return data;
        return data.map((value, index, array) => {
            const start = Math.max(0, index - Math.floor(smoothing / 2));
            const end = Math.min(array.length, index + Math.floor(smoothing / 2) + 1);
            const window = array.slice(start, end);
            return window.reduce((a, b) => a + b, 0) / window.length;
        });
    }, []);

    // Get the maximum between current year and last year in data
    const currentYear = new Date().getFullYear();
    const dataMaxYear = Math.max(...data.dates);
    const maxYear = Math.max(currentYear, dataMaxYear);

    // Initialize view range if not set
    useEffect(() => {
        if (!viewRange) {
            setViewRange([START_YEAR, maxYear]);
        }
    }, [maxYear, viewRange]);

    const getVisibleYRange = useCallback((xRange) => {
        if (!data?.series?.length) return [0, 1];
        
        let visibleMax = 0;
        data.series.forEach(series => {
            series.data.forEach((value, index) => {
                const year = data.dates[index];
                if (year >= xRange[0] && year <= xRange[1]) {
                    visibleMax = Math.max(visibleMax, value);
                }
            });
        });
        return [0, visibleMax * 1.1];
    }, [data]);

    if (!data?.series?.length) {
        return <div>No data available</div>;
    }

    const plotData = data.series.map((series, i) => {
        const baseConfig = {
            x: data.dates,
            y: smoothData(series.data, settings?.smoothing),
            name: series.name,
            type: 'scatter',
            mode: 'lines',
            showlegend: true,
            hoverinfo: 'x+y+name',
            line: {
                shape: 'spline',
                width: settings?.lineThickness || 2,
                color: `hsla(${(i * 360) / data.series.length}, 70%, 50%, ${1 - (settings?.lineTransparency || 0)})`
            }
        };

        switch (graphType) {
            case 'absolute':
                return {
                    ...baseConfig,
                    y: series.data.map(val => val * 100) // Convert to percentage
                };
            case 'cumulative':
                return {
                    ...baseConfig,
                    y: series.data.reduce((acc, val) => {
                        acc.push((acc.length ? acc[acc.length - 1] : 0) + val);
                        return acc;
                    }, [])
                };
            case 'cohort':
                return {
                    ...baseConfig,
                    fill: 'tonexty'
                };
            case 'relative':
            default:
                return baseConfig;
        }
    });

    const layout = {
        title: 'Ngram Frequency',
        autosize: true,
        height: Math.min(500, window.innerHeight - 200),
        margin: { 
            t: 30,
            r: 20, 
            b: 40, 
            l: 60,
            pad: 5
        },
        xaxis: { 
            title: 'Year',
            fixedrange: false,
            range: viewRange || [START_YEAR, maxYear],
            autorange: false,
            constrain: 'domain',
            constraintoward: 'center',
            rangemode: 'normal',
            dtick: window.innerWidth < 600 ? 20 : 10,
            tick0: START_YEAR
        },
        yaxis: { 
            title: graphType === 'absolute' ? 'Percentage' : 'Frequency',
            fixedrange: true,
            rangemode: 'nonnegative',
            autorange: true
        },
        dragmode: 'pan',
        showlegend: true,
        legend: {
            x: window.innerWidth < 600 ? 0.5 : 1,
            xanchor: window.innerWidth < 600 ? 'center' : 'right',
            y: window.innerWidth < 600 ? -0.2 : 1,
            yanchor: window.innerWidth < 600 ? 'top' : 'auto',
            orientation: window.innerWidth < 600 ? 'horizontal' : 'vertical',
            traceorder: graphType === 'cohort' ? 'reversed' : 'normal'
        },
        hovermode: 'closest'
    };

    const config = {
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: [
            'select2d', 'lasso2d', 'autoScale2d',
            'hoverClosestCartesian', 'hoverCompareCartesian',
            'toggleSpikelines'
        ],
        modeBarButtonsToAdd: ['zoom2d', 'pan2d', 'resetScale2d'],
        scrollZoom: true,
        dragmode: 'pan',
        toImageButtonOptions: {
            format: 'png',
            filename: 'ngram_plot'
        }
    };

    const handleClick = (event) => {
        if (!event.points?.length) return;
        const point = event.points[0];
        const year = Math.round(point.x);
        const word = point.data.name;
        setModalData({ word, year });
    };

    const handleUpdate = (event) => {
        if (!event?.xaxis?.range) return;

        const [start, end] = event.xaxis.range;
        const newStart = Math.max(START_YEAR, start);
        const newEnd = Math.min(maxYear, end);

        // Only update if the range has actually changed
        if (viewRange?.[0] !== newStart || viewRange?.[1] !== newEnd) {
            setViewRange([newStart, newEnd]);
            
            // Update y-axis range
            const yRange = getVisibleYRange([newStart, newEnd]);
            event.target?.relayout?.({
                'yaxis.range': yRange,
                'xaxis.range': [newStart, newEnd]
            });
        }
    };

    return (
        <>
            <div className="chart-container" style={{ position: 'relative', width: '100%', minHeight: '300px' }}>
                <Plot
                    data={plotData}
                    layout={layout}
                    config={{
                        ...config,
                        responsive: true,
                        useResizeHandler: true
                    }}
                    onClick={handleClick}
                    onUpdate={handleUpdate}
                    style={{ width: '100%', height: '100%' }}
                    onButtonClicked={(event) => {
                        if (event === 'resetScale2d') {
                            setViewRange([START_YEAR, maxYear]);
                        }
                    }}
                />
            </div>
            <ConcordanceModal
                show={modalData !== null}
                onHide={() => setModalData(null)}
                word={modalData?.word}
                year={modalData?.year}
                corpus={corpus}
            />
            <DownloadModal
                show={showDownloadModal}
                onHide={() => {
                    console.log('Hiding download modal');
                    setShowDownloadModal(false);
                }}
                onDownloadCsv={() => {
                    onDownloadCsv?.();
                    setShowDownloadModal(false);
                }}
                onDownloadExcel={() => {
                    onDownloadExcel?.();
                    setShowDownloadModal(false);
                }}
            />
        </>
    );
};

export default NgramChartPlotly;

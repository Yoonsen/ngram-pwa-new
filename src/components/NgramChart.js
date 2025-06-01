import React, { useState, useRef, useEffect } from 'react';
import { Container } from 'react-bootstrap';

const NgramChart = ({ data, graphType = 'relative' }) => {
    const [hoveredSeries, setHoveredSeries] = useState(null);
    const [tooltip, setTooltip] = useState(null);
    const svgRef = useRef(null);

    useEffect(() => {
        console.log('NgramChart received data:', JSON.stringify(data, null, 2));
        console.log('Current graph type:', graphType);
    }, [data, graphType]);

    // Process data based on graph type
    const processData = () => {
        if (!data || !data.series || !data.dates) {
            console.log('No data available for processing');
            return [];
        }

        // Transform the data into our expected format
        const processed = data.series.map(series => {
            const values = series.data.map((value, index) => {
                // Convert milliseconds to year
                const year = new Date(parseInt(data.dates[index])).getFullYear();
                return {
                    year,
                    value: value  // Use the value directly
                };
            });

            // Calculate cumulative values if needed
            if (graphType === 'cumulative') {
                let cumulative = 0;
                values.forEach(point => {
                    cumulative += point.value;
                    point.value = cumulative;
                });
            }

            return {
                word: series.name,
                values
            };
        });

        console.log('Processed data:', processed);
        return processed;
    };

    // Calculate cohort data
    const calculateCohortData = () => {
        if (!data || !data.series) return [];

        // For each year, calculate the total frequency of all words
        const yearlyTotals = {};
        data.series.forEach(series => {
            series.data.forEach((value, index) => {
                const year = new Date(parseInt(data.dates[index])).getFullYear();
                if (!yearlyTotals[year]) {
                    yearlyTotals[year] = 0;
                }
                yearlyTotals[year] += value;
            });
        });

        // Calculate relative proportions for each word in each year
        const processed = data.series.map(series => {
            const values = series.data.map((value, index) => {
                const year = new Date(parseInt(data.dates[index])).getFullYear();
                const total = yearlyTotals[year];
                // If total is 0, all words have 0 frequency, so we'll show equal proportions
                const proportion = total > 0 ? value / total : 1 / data.series.length;
                return { year, value: proportion };
            });

            return {
                word: series.name,
                values
            };
        });

        return processed;
    };

    const processedData = graphType === 'cohort' ? calculateCohortData() : processData();
    
    if (!processedData.length) {
        console.log('No processed data available');
        return <div>No data available</div>;
    }

    // Calculate chart dimensions and scales
    const margin = { top: 40, right: 20, bottom: 40, left: 60 };
    const width = 800;
    const height = 400;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Get all years and values for scaling
    const allYears = processedData.flatMap(series => 
        series.values.map(v => v.year)
    );
    const allValues = processedData.flatMap(series => 
        series.values.map(v => v.value || 0)  // Use 0 if value is undefined
    );

    console.log('Chart scaling:', {
        years: allYears,
        values: allValues,
        maxValue: Math.max(...allValues)
    });

    const xScale = (year) => {
        const minYear = Math.min(...allYears);
        const maxYear = Math.max(...allYears);
        const x = margin.left + ((year - minYear) / (maxYear - minYear)) * innerWidth;
        console.log('xScale:', { year, minYear, maxYear, x });
        return x;
    };

    const yScale = (value) => {
        const maxValue = Math.max(...allValues);
        const y = margin.top + innerHeight - (value / maxValue) * innerHeight;
        console.log('yScale:', { value, maxValue, y });
        return y;
    };

    // Handle mouse events
    const handleMouseMove = (e) => {
        if (!svgRef.current) return;

        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

        // Find closest point
        let closestPoint = null;
        let minDistance = Infinity;

        processedData.forEach(series => {
            series.values.forEach(point => {
                const x = xScale(point.year);
                const y = yScale(point.value);
                const distance = Math.sqrt(
                    Math.pow(svgP.x - x, 2) + Math.pow(svgP.y - y, 2)
                );
                if (distance < minDistance && distance < 10) {
                    minDistance = distance;
                    closestPoint = {
                        ...point,
                        word: series.word
                    };
                }
            });
        });

        if (closestPoint) {
            setTooltip({
                x: xScale(closestPoint.year),
                y: yScale(closestPoint.value),
                year: closestPoint.year,
                value: closestPoint.value.toFixed(6),
                word: closestPoint.word
            });
        } else {
            setTooltip(null);
        }
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    // Generate path for a series
    const generatePath = (values) => {
        if (!values || values.length === 0) return '';
        
        // Log the first few points to see what we're working with
        console.log('First few points:', values.slice(0, 3));
        
        const path = values.map((point, i) => {
            const x = xScale(point.year);
            const y = yScale(point.value);
            
            // Log every 10th point to avoid console spam
            if (i % 10 === 0) {
                console.log(`Point ${i}:`, {
                    year: point.year,
                    value: point.value,
                    x: x,
                    y: y,
                    minYear: Math.min(...allYears),
                    maxYear: Math.max(...allYears),
                    maxValue: Math.max(...allValues)
                });
            }
            
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
        
        return path;
    };

    return (
        <Container fluid className="p-0">
            <svg
                ref={svgRef}
                width={width}
                height={height}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ background: 'white' }}
            >
                {/* Title */}
                <text
                    x={width / 2}
                    y={margin.top / 2}
                    textAnchor="middle"
                    style={{ fontSize: '16px', fontWeight: 'bold' }}
                >
                    {graphType === 'cumulative' ? 'Cumulative Word Frequency Over Time' :
                     graphType === 'cohort' ? 'Cohort Analysis' :
                     'Word Frequency Over Time'}
                </text>

                {/* X-axis */}
                <line
                    x1={margin.left}
                    y1={height - margin.bottom}
                    x2={width - margin.right}
                    y2={height - margin.bottom}
                    stroke="black"
                />
                {allYears.filter((_, i) => i % 5 === 0).map(year => (
                    <g key={year}>
                        <line
                            x1={xScale(year)}
                            y1={height - margin.bottom}
                            x2={xScale(year)}
                            y2={height - margin.bottom + 5}
                            stroke="black"
                        />
                        <text
                            x={xScale(year)}
                            y={height - margin.bottom + 20}
                            textAnchor="middle"
                            style={{ fontSize: '12px' }}
                        >
                            {year}
                        </text>
                    </g>
                ))}

                {/* Y-axis */}
                <line
                    x1={margin.left}
                    y1={margin.top}
                    x2={margin.left}
                    y2={height - margin.bottom}
                    stroke="black"
                />
                {[0, 0.25, 0.5, 0.75, 1].map(value => {
                    const maxValue = Math.max(...allValues);
                    const scaledValue = value * maxValue;
                    const displayValue = graphType === 'absolute' ? 
                        Math.round(scaledValue) : 
                        scaledValue.toFixed(6);
                    return (
                        <g key={value}>
                            <line
                                x1={margin.left - 5}
                                y1={yScale(scaledValue)}
                                x2={margin.left}
                                y2={yScale(scaledValue)}
                                stroke="black"
                            />
                            <text
                                x={margin.left - 10}
                                y={yScale(scaledValue)}
                                textAnchor="end"
                                dominantBaseline="middle"
                                style={{ fontSize: '12px' }}
                            >
                                {displayValue}
                            </text>
                        </g>
                    );
                })}

                {/* Grid lines */}
                {allYears.filter((_, i) => i % 5 === 0).map(year => (
                    <line
                        key={year}
                        x1={xScale(year)}
                        y1={margin.top}
                        x2={xScale(year)}
                        y2={height - margin.bottom}
                        stroke="#eee"
                    />
                ))}
                {[0, 0.25, 0.5, 0.75, 1].map(value => {
                    const scaledValue = value * Math.max(...allValues);
                    return (
                        <line
                            key={value}
                            x1={margin.left}
                            y1={yScale(scaledValue)}
                            x2={width - margin.right}
                            y2={yScale(scaledValue)}
                            stroke="#eee"
                        />
                    );
                })}

                {/* Data lines */}
                {graphType === 'cohort' ? (
                    processedData.map((cohort, i) => (
                        <g key={cohort.word}>
                            <text
                                x={margin.left - 10}
                                y={margin.top + i * 20}
                                textAnchor="end"
                                style={{ fontSize: '12px' }}
                            >
                                {cohort.word}
                            </text>
                            <path
                                d={generatePath(cohort.values)}
                                fill="none"
                                stroke={`hsl(${(i * 360) / processedData.length}, 70%, 50%)`}
                                strokeWidth={2}
                                onMouseEnter={() => setHoveredSeries(cohort.word)}
                                onMouseLeave={() => setHoveredSeries(null)}
                                style={{
                                    opacity: hoveredSeries === null || hoveredSeries === cohort.word ? 1 : 0.3,
                                    transition: 'opacity 0.2s'
                                }}
                            />
                        </g>
                    ))
                ) : (
                    processedData.map((series, i) => (
                        <path
                            key={series.word}
                            d={generatePath(series.values)}
                            fill="none"
                            stroke={`hsl(${(i * 360) / processedData.length}, 70%, 50%)`}
                            strokeWidth={2}
                            onMouseEnter={() => setHoveredSeries(series.word)}
                            onMouseLeave={() => setHoveredSeries(null)}
                            style={{
                                opacity: hoveredSeries === null || hoveredSeries === series.word ? 1 : 0.3,
                                transition: 'opacity 0.2s'
                            }}
                        />
                    ))
                )}

                {/* Tooltip */}
                {tooltip && (
                    <g>
                        <rect
                            x={tooltip.x - 60}
                            y={tooltip.y - 40}
                            width={120}
                            height={30}
                            fill="rgba(255, 255, 255, 0.9)"
                            stroke="gray"
                            rx={5}
                        />
                        <text
                            x={tooltip.x}
                            y={tooltip.y - 25}
                            textAnchor="middle"
                            style={{ fontSize: '12px' }}
                        >
                            {tooltip.word}
                        </text>
                        <text
                            x={tooltip.x}
                            y={tooltip.y - 10}
                            textAnchor="middle"
                            style={{ fontSize: '12px' }}
                        >
                            {tooltip.year}: {tooltip.value}
                        </text>
                    </g>
                )}
            </svg>

            {/* Legend */}
            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {graphType === 'cohort' ? (
                    processedData.map((cohort, i) => (
                        <div key={cohort.word} style={{ marginBottom: '10px' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{cohort.word}</div>
                            <path
                                d={generatePath(cohort.values)}
                                fill="none"
                                stroke={`hsl(${(i * 360) / processedData.length}, 70%, 50%)`}
                                strokeWidth={2}
                                onMouseEnter={() => setHoveredSeries(cohort.word)}
                                onMouseLeave={() => setHoveredSeries(null)}
                                style={{
                                    opacity: hoveredSeries === null || hoveredSeries === cohort.word ? 1 : 0.3,
                                    transition: 'opacity 0.2s'
                                }}
                            />
                        </div>
                    ))
                ) : (
                    processedData.map((series, i) => (
                        <div
                            key={series.word}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                opacity: hoveredSeries === null || hoveredSeries === series.word ? 1 : 0.3,
                                transition: 'opacity 0.2s'
                            }}
                        >
                            <div
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: `hsl(${(i * 360) / processedData.length}, 70%, 50%)`,
                                    marginRight: '5px'
                                }}
                            />
                            {series.word}
                        </div>
                    ))
                )}
            </div>
        </Container>
    );
};

export default NgramChart; 
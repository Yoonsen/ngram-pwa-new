import React from 'react';
import Plot from 'react-plotly.js';

const START_YEAR = 1810;

const NgramChartPlotly = ({ data, corpus = 'avis' }) => {
    if (!data?.series?.length) {
        return <div>No data available</div>;
    }

    // Get the maximum between current year and last year in data
    const currentYear = new Date().getFullYear();
    const dataMaxYear = Math.max(...data.dates);
    const maxYear = Math.max(currentYear, dataMaxYear);

    const plotData = data.series.map(series => ({
        x: data.dates,
        y: series.data,
        name: series.name,
        type: 'scatter',
        showlegend: true,
        hoverinfo: 'x+y+name'
    }));

    const layout = {
        title: 'Ngram Frequency',
        width: 900,
        height: 500,
        margin: { t: 30, r: 20, b: 40, l: 60 },
        xaxis: { 
            title: 'Year',
            fixedrange: false,  // Allow zoom on x-axis
            range: [START_YEAR, maxYear],  // Set boundaries using fixed start and dynamic end
            autorange: false,  // Prevent autoranging on reset
            constrain: 'domain'  // Prevent panning beyond the range
        },
        yaxis: { 
            title: 'Frequency',
            fixedrange: true   // Prevent zoom on y-axis
        },
        legend: {
            x: 1,
            xanchor: 'right',
            y: 1
        },
        dragmode: 'pan'      // Set pan as default interaction mode
    };

    const config = {
        displayModeBar: true,
        displaylogo: false,
        responsive: true,
        scrollZoom: true,     // Enable scroll wheel zooming
        modeBarButtonsToRemove: [
            'autoScale2d', 
            'lasso2d', 
            'select2d',
            'toImage',  // Remove default download button
            'pan2d',    // Remove pan button (since it's default)
            'toggleSpikelines',
            'hoverClosestCartesian',
            'hoverCompareCartesian'
        ],
        modeBarButtons: [
            ['zoomIn2d', 'zoomOut2d', 'resetScale2d'] // Keep zoom +/- and reset
        ]
    };

    const handleClick = (event) => {
        if (event.points && event.points[0]) {
            const point = event.points[0];
            const word = point.data.name;
            const year = Math.round(point.x);
            
            // Create the National Library search URL
            const params = new URLSearchParams({
                q: `"${word}"`,
                fromDate: year.toString(),
                toDate: year.toString(),
                mediatype: corpus
            });
            const url = `https://www.nb.no/search?${params.toString()}`;
            
            // Open in new tab
            window.open(url, '_blank');
        }
    };

    return (
        <Plot
            data={plotData}
            layout={layout}
            config={config}
            onClick={handleClick}
        />
    );
};

export default NgramChartPlotly;

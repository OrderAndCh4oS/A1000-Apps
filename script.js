// Some universal basics
// Input is all the inputs & should be  a SelectorAll with both input and select but ...

// The few lines needed once everything else has loaded
window.onload = function() {
    // Uncomment to prevent loading of stored values.
    restoreDefaultValues();

    // We need to set up buttons in this onload section
    document.getElementById('ClickMe').addEventListener('click', function() {
        alert('ClickMe was clicked');
    });
    Main();
};

// Main() is hard wired as THE place to start calculating when inputs change
// It does no calculations itself, it merely sets them up, sends off variables, gets results and, if necessary, plots them.
function Main() {
    // Save settings every time you calculate, so they're always ready on a reload
    saveSettings();
    // Send all the inputs as a structured object
    // If you need to convert to, say, SI units, do it here!
    const inputs = {
        linVal: sliders.SlideLin.value,
        logVal: sliders.SlideLog.value,
        multiplier: parseFloat(document.getElementById('Multiplier').value),
        useOne: document.getElementById('Equ1').checked, //No need to check Equ2!
        useBoth: document.getElementById('Both').checked,
    };

    // Get all the resonses as a map via set/get
    const result = CalcIt(inputs);

    // Set all the text box outputs
    document.getElementById('First').value = result.first;
    document.getElementById('Second').value = result.second;
    // Do all relevant plots - if there's no plot, nothing happens
    if(result.plots) {
        for(let i = 0; i < result.plots.length; i++) {
            PlotIt(result.plots[i], result.canvas[i]);
        }
    }

    // You might have some other stuff to do here, but for most apps that's it for Main!
}

// Here's the app calculation
// Unbundle the inputs into the local variables
// By convention they are provided with the correct units within Main
function CalcIt({linVal, logVal, multiplier, useOne, useBoth}) {
    // Now we create some plots
    const plotOne = [], plotTwo = [];
    let xval, y1, y2;
    for(let i = 0; i <= 100; i++) {
        xval = 3 * i;
        y1 = multiplier * linVal * Math.sin(logVal * xval / 50);
        y2 = multiplier * linVal * Math.cos(logVal * xval / 50);
        // All graph data consists of x:xval, y:yval pairs in curly brackets
        // Pushed onto the plot data
        plotOne.push({x: xval, y: y1});
        plotTwo.push({x: xval, y: y2});
    }

    // Now set up all the graphing data. It's very tedious but much better than the alternative
    // We use the amazing Open Source Chart.js, https://www.chartjs.org/
    // A lot of the sophistication is addressed directly here
    // But if you need something more, read the Chart.js documentation or search Stack Overflow
    let xAxisInfo, yAxisInfo, y2AxisInfo; //If there's no 2nd axis, this stays null, which is what we want
    // We put an & before the units. This is used for the mouse readout and is removed in the real axis display

    xAxisInfo = 'x values&x-units';
    yAxisInfo = 'y values&y-units';
    const plotData = [], lineLabels = [], yPos = [];
    // We might have many lines to go on a graph. Each is just "pushed" into plotData
    // If you only have one line, this seems odd, but it's great to have the general capability
    // Each time we push a set of plot data, we also need to push the name of that line into lineLabels
    if(useBoth) {
        plotData.push(plotOne);
        lineLabels.push('First');
        plotData.push(plotTwo);
        lineLabels.push('Second');
    } else {
        if(useOne) {
            plotData.push(plotOne);
            lineLabels.push('First');
        } else {
            plotData.push(plotTwo);
            lineLabels.push('Second');
        }
    }
    yPos.push(1);

    // Need to configure for multiple plots, even if we happen to have just one
    plot = {
        yPos: yPos,
        plotData: plotData,
        xLabel: xAxisInfo,
        yLabel: yAxisInfo,
        logX: false,
        xTicks: undefined,
        logY: false,
        yTicks: undefined,
        lineLabels: lineLabels,
        legendPosition: 'top',
        xMinMax: [],
        yMinMax: [],
    };

    // Where we store all the calculated and plotted values
    // Obviously we'd do some real calculations for the outputs, but this is just a demo
    // It's a bore to set up the plot and canvas name here for a single plot
    // But this allows us to have multiple plots very easily
    return {
        first: linVal.toFixed(1),
        second: logVal.toPrecision(3),
        plots: [plot],
        canvas: ['canvas'],
    };

}

// It's a lot of work to plot anything and it seems all very bothersome setting it up
// But doing it this way is MUCH easier than doing it unstructured as I'd done before
// With luck, you'll not have to tweak plotIt if you've provided all the right inputs
function PlotIt(plots, canvas) {
    Chart.defaults.global.animation.duration = 0;
    const data = [], labels = [];
    for(let i = 0; i < plots.plotData.length; i++) {
        data.push(plots.plotData[i]);
        labels.push(plots.lineLabels[i]);
    }
    let xLabel, yLabel, y2Label;
    const xInfo = plots.xLabel;
    xLabel = xInfo.replace('&', ' ');
    const yInfo = plots.yLabel[0];
    yLabel = yInfo.replace('&', ' ');
    const y2Info = plots.yLabel[1];
    if(y2Info) y2Label = y2Info.replace('&', ' ');
    const loglinX = plots.logX ? 'logarithmic' : 'linear';
    const loglinY = plots.logY ? 'logarithmic' : 'linear';
    const minX = plots.xMinMax[0];
    const maxX = plots.xMinMax[1];
    const minY = plots.yMinMax[0];
    const maxY = plots.yMinMax[1];
    const legendPosition = plots.legendPosition;
    const theData = [];
    const theColors = ['#edc240', '#afd8f8', '#cb4b4b', '#4da74d', '#9440ed'];
    const theXSigFigs = 1;
    const theYSigFigs = [0, 0];
    const xPre = xInfo.split('&'), yPre = yInfo.split('&');
    let y2Pre = []; // Todo: Check this it is not used
    if(y2Info) {
        y2Pre = y2Info.split('&');
        yPre[0] += ' = ';
        yPre[1] = ' ' + yPre[1];
    }
    const theXPrefix = 'At ' + xPre[0] + ' = ', theXPostfix = ' ' + xPre[1];
    const theYPrefix = yPre[0] + ' = ', theYPostfix = ' ' + yPre[1];
    for(let i = 0; i < data.length; i++) {
        theData.push({
            label: labels[i],
            // backgroundColor: theColors[i],
            borderColor: theColors[i],
            borderWidth: 3, // The default - feel free to tweak
            data: data[i],
            fill: false,
            showLine: true,
            pointRadius: 0,
        });
    }

    const config = {
        type: 'scatter',
        data: {
            datasets: theData,
        },
        options: {
            responsive: true,
            legend: {position: legendPosition},
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        let label = data.datasets[tooltipItem.datasetIndex].label ||
                            '';

                        if(label) {
                            label += ': ';
                        }
                        label += theXPrefix + parseFloat(tooltipItem.xLabel)
                                .toFixed(theXSigFigs) + theXPostfix + ', ' +
                            theYPrefix + parseFloat(tooltipItem.yLabel)
                                .toFixed(
                                    theYSigFigs[tooltipItem.datasetIndex]) +
                            theYPostfix;
                        return label;
                    },
                },
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true,
            },
            scales: {
                xAxes: [
                    {
                        type: loglinX,
                        ticks: {
                            min: minX, max: maxX,
                        },
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: xLabel,
                        },
                    }],
                yAxes: [
                    {
                        ticks: {min: minY, max: maxY},
                        type: loglinY,
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: yLabel,
                        },
                    }],
            },
        },
    };
    const ctx = document.getElementById(canvas).getContext('2d');
    // Chart.js has a curious requirement to be destroyed each time
    // If you have multiple graphs you need to call them, say, canvas0, canvas1 etc.
    // Though the first or only canvas can just be called canvas, without the 0
    let id = 0;
    if(!isNaN(canvas.slice(-1))) id = Number(canvas.slice(-1));
    if(!window.myLine) window.myLine = Array(10);
    if(window.myLine[id]) window.myLine[id].destroy();
    window.myLine[id] = new Chart(ctx, config);
}

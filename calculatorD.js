///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// CALCULATOR D /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// calculator type D inputs
var calculatorTypeDInputs = {
    population:1,
    surveillanceScale:'National',
    confidenceLevel1:95,
    fluSampleSize2:1,
    detectionThreshold3:5,
    confidenceInterval3:80,
    falseNegativeTolerance3:10,
    falsePositiveTolerance3:25,
};

// tooltip text
var tooltipTypeDTotalPopulation = "This is the total population size under surveillance. For labs representing entire states, simply select the name of the state. This will automatically provide the 2012 census projection of the state population. For labs collecting specimens from subsets of state populations or populations that cross multiple states, choose 'Other' and enter the estimated size of the entire population under consideration.";
var tooltipTypeDConfidenceLevel = "The desired confidence that the sample will contain at least one AVR+ when the prevalence of an antiviral resistant influenza reaches the specified limit of detection. For example, if the PHL choose a confidence level of 95% and a detection threshold of 1/700, then the resulting minimum sample size should be sufficient to detect an antiviral resistant influenza when it reaches a prevalence of 1/700 AVR+/Flu+, 95% of the time. Intuitively, a high confidence level and a low detection threshold requires many samples, while low confidence and a high detection threshold results in fewer samples.";
var tooltipTypeDDetectionThreshold = "The detection threshold for an antiviral resistant influenza is the prevalence of the antiviral resistant influenza (out of all Flu+ cases) at which the first antiviral resistant influenza specimens are expected to appear in the lab. For example, a detection threshold of 1/700 means that antiviral resistant influenza should be detected by the lab when it rises to a prevalence of one out of every 700 cases of influenza.";
var tooltipTypeDMinimumFluSampleSize = "The minimum number of Flu+ specimens required to detect an antiviral resistant influenza when its prevalence (AVR+/Flu+) reaches the specified detection threshold, with the specified level of confidence.";
var tooltipTypeDFluSampleSize = "The number of Flu+ specimens to be tested.";
var tooltipTypeDSurveillanceScale = "This is the scale of the surveillance effort. The default is national, meaning that all states are contributing to a national surveillance effort proportional to their population size.  The number of samples that a state PHL needs to test is apportioned based on population size. The calculator also provides the option for states to calculate the number of specimens to test for detection of an antiviral resistant influenza event at a specific threshold within their state; however, the sample size for an individual state at the same threshold (e.g. 1/500 or 1/700) will be significantly larger than that needed for the national threshold.";

// type D2 tooltips, for investigation:
var tooltipTypeD2DetectionThreshold = "detection threshold tooltip"
var tooltipTypeD2ConfidenceInterval = "confidence interval tooltip";
var tooltipTypeD2FalseNegativeTolerance = "false negative tolerance tooltip";
var tooltipTypeD2FalsePositiveTolerance = "false positive tolerance tooltip";

// active tab index
var calculatorTypeDActiveTabIndex = 0;

function evaluateTypeD_FluSampleSize_vs_detectionThreshold(detectionThreshold)
{
    // this object contains parameter values

    var sampleSize = Math.log(1. - this.confidenceLevel/100.) / Math.log(1. - detectionThreshold/100.);

    if(this.surveillanceScale == "State")
    {
        // finite population correction
        sampleSize = sampleSize * Math.sqrt((this.population - sampleSize) / (this.population - 1.));
    }

    if(this.surveillanceScale == "National")
    {
        sampleSize = sampleSize * this.population / nationalPopulation;
    }

    return Math.ceil(sampleSize);
}

function evaluateTypeD_detectionThreshold_vs_confidenceLevel(confidenceLevel)
{
    var idealFluSampleSize = this.fluSampleSize;

    if(this.surveillanceScale == "State")
    {
        // finite population correction (inverse)
        // note the division instead of multiplication here
        idealFluSampleSize = idealFluSampleSize / Math.sqrt((this.population - idealFluSampleSize) / (this.population - 1.));
    }

    var detectionThreshold = 0;

    if(this.surveillanceScale == "National")
    {
        detectionThreshold = 100.*( 1. - Math.pow(1. - confidenceLevel/100., this.population / (idealFluSampleSize * nationalPopulation)) );
    }
    else if(this.surveillanceScale == "State")
    {
        detectionThreshold = 100.*( 1. - Math.pow(1. - confidenceLevel/100., 1. / idealFluSampleSize) );
    }

    // no rounding, since we need 0.606% case...
    return detectionThreshold;
}

function evaluateTypeD_confidenceLevel_vs_detectionThreshold(detectionThreshold)
{
    var idealFluSampleSize = this.fluSampleSize;

    if(this.surveillanceScale == "State")
    {
        // finite population correction (inverse)
        // note the division instead of multiplication here
        idealFluSampleSize = idealFluSampleSize / Math.sqrt((this.population - idealFluSampleSize) / (this.population - 1.));
    }

    var confidenceLevel = 0;

    if(this.surveillanceScale == "National")
    {
        confidenceLevel = 100.*( 1. - Math.pow(1. - detectionThreshold/100., (idealFluSampleSize * nationalPopulation) / this.population) );
    }
    else if(this.surveillanceScale == "State")
    {
        confidenceLevel = 100.*( 1. - Math.pow(1. - detectionThreshold/100., idealFluSampleSize) );
    }

    // no rounding, since we need 0.606% case...
    return confidenceLevel;
}


// type D2 evaluations, for investigation:

function phiInverse(value)
{
    return Math.sqrt(2.) * erfinv(2.*value - 1.);
}

function evaluateTypeD2_prevalenceLB_vs_fluSampleSize(fluSampleSize)
{
    // this object contains parameter values
    var P_T = this.population;
    var P_S;

    if(this.surveillanceScale == "National")
    {
        P_S = nationalPopulation;
    }
    else if(this.surveillanceScale == "State")
    {
        P_S = P_T;
    }
    else
    {
        alert("unknown surveillance scale");
    }

    var c = this.detectionThreshold / 100.;
    var lambda = this.confidenceInterval / 100.;
    var FNRmax = this.falseNegativeTolerance / 100.;
    var FPRmax = this.falsePositiveTolerance / 100.;

    if(FPRmax < lambda)
    {
        var n = P_S / P_T * fluSampleSize;
        var K = (phiInverse(1. - FPRmax) + phiInverse(lambda)) / Math.sqrt(n);

        var value = ( (2.*c + K*K) - Math.abs(K) * Math.sqrt(K*K + 4.*c*(1. - c)) ) / ( 2.*(1. + K*K) ) * 100.;

        return Math.round(value * 100.) / 100.;
    }
    else
    {
        return c * 100.;
    }
}

function evaluateTypeD2_prevalenceUB_vs_fluSampleSize(fluSampleSize)
{
    // this object contains parameter values
    var P_T = this.population;
    var P_S;

    if(this.surveillanceScale == "National")
    {
        P_S = nationalPopulation;
    }
    else if(this.surveillanceScale == "State")
    {
        P_S = P_T;
    }
    else
    {
        alert("unknown surveillance scale");
    }

    var c = this.detectionThreshold / 100.;
    var lambda = this.confidenceInterval / 100.;
    var FNRmax = this.falseNegativeTolerance / 100.;
    var FPRmax = this.falsePositiveTolerance / 100.;

    if(FNRmax < 1. - lambda)
    {
        var n = P_S / P_T * fluSampleSize;
        var L = (phiInverse(FNRmax) + phiInverse(lambda)) / Math.sqrt(n);

        var value = ( (2.*c + L*L) + Math.abs(L) * Math.sqrt(L*L + 4.*c*(1. - c)) ) / ( 2.*(1. + L*L) ) * 100.;

        return Math.round(value * 100.) / 100.;
    }
    else
    {
        return c * 100.;
    }
}

// draw chart and table given labels, x series, y series
function drawTypeDTab1()
{
    var labels = ['Detection Threshold (AVR+/Flu+)', 'Minimum Flu+ Sample Size'];
    var x = [];
    var xChartLabelMap = {};
    var xTableLabelMap = {};
    var y;

    // range: detection threshhold (increments of 0.1)
    var min = 0.1;
    var max = 5;
    var numValues = 50;

    for(var i=0; i<numValues; i++)
    {
        // round to the nearest 100th
        var value = Math.round((min + i/(numValues-1)*(max-min)) * 100) / 100;

        // we need the 1/165 case
        if(value == 0.6)
        {
            value = 0.606;
        }

        x.push(value);

        // labels
        xChartLabelMap[value] = "Detection Threshhold: " + value + "% (1/" + Math.round(100. / value) + ")";
        xTableLabelMap[value] = value + "% (1/" + Math.round(100. / value) + ")";

        if(value == 0.1)
        {
            // also get other special cases...
            // the label code is identical to above
            value = 0.1429;
            x.push(value);
            xChartLabelMap[value] = "Detection Threshhold: " + value + "% (1/" + Math.round(100. / value) + ")";
            xTableLabelMap[value] = value + "% (1/" + Math.round(100. / value) + ")";

            value = 0.1667;
            x.push(value);
            xChartLabelMap[value] = "Detection Threshhold: " + value + "% (1/" + Math.round(100. / value) + ")";
            xTableLabelMap[value] = value + "% (1/" + Math.round(100. / value) + ")";
        }
    }

    // use a parameters object to pass in any other input parameters to the evaluation function
    var parameters = new Object();
    parameters.population = calculatorTypeDInputs.population;
    parameters.surveillanceScale = calculatorTypeDInputs.surveillanceScale;
    parameters.confidenceLevel = calculatorTypeDInputs.confidenceLevel1;

    // evaluation for each x
    y = x.map(evaluateTypeD_FluSampleSize_vs_detectionThreshold, parameters);

    // separate DataTable objects for chart / table to allow for formatting
    var dataChart = arraysToDataTable(labels, [x, y]);
    var dataTable = dataChart.clone();

    // chart: use xChartLabelMap as the x label
    var formatterChart = new labelFormatter(xChartLabelMap);
    formatterChart.format(dataChart, 0);

    // table: use xTableLabelMap as the x label
    var formatterChart = new labelFormatter(xTableLabelMap);
    formatterChart.format(dataTable, 0);

    var optionsChart = {
        title: '',
        hAxis : { title: labels[0], format: "#.##'%'" },
        vAxis : { title: labels[1] },
        legend : { position: 'none' },
        fontSize : chartFontSize
    };

    // need to specify width here (rather than in CSS) for IE
    var optionsTable = {
        width: '225px'
    };

    $("#calculatorD1_chart_table_description_div").html("<span class='calculatorTooltip' title='" + tooltipTypeDMinimumFluSampleSize + "'>Minimum sample size (of Flu+ specimens)</span> required to detect an antiviral resistant (AVR+) influenza at a specified <span class='calculatorTooltip' title='" + tooltipTypeDDetectionThreshold + "'>detection threshold (AVR+/Flu+)</span>, with a confidence of " + formatTextParameter(parameters.confidenceLevel + "%") + ". These calculations assume a total population of " + formatTextParameter(numberWithCommas(parameters.population)) + ". Use the mouse to view values in the sample size graph and scroll through sample size table.");

    var chart = new google.visualization.LineChart(document.getElementById('calculatorD1_chart_div'));
    chart.draw(dataChart, optionsChart);

    var table = new google.visualization.Table(document.getElementById('calculatorD1_table_div'));
    table.draw(dataTable, optionsTable);

    // selection handling
    var thisObj = drawTypeDTab1;

    google.visualization.events.addListener(chart, 'select', chartSelectHandler);
    google.visualization.events.addListener(table, 'select', tableSelectHandler);

    function chartSelectHandler(e) { thisObj.selectHandler(chart.getSelection()); }
    function tableSelectHandler(e) { thisObj.selectHandler(table.getSelection()); }

    thisObj.selectHandler = function(selectionArray)
    {
        if(selectionArray.length > 0 && selectionArray[0].row != null)
        {
            thisObj.selectedRow = selectionArray[0].row;

            // make sure row is valid
            if(thisObj.selectedRow >= x.length)
            {
                thisObj.selectedRow = 0;
            }

            // form new array with only this entry (to avoid multiple selections)
            var newSelectionArray = [{row:selectionArray[0].row}];

            // select element in chart and table
            chart.setSelection(newSelectionArray);
            table.setSelection(newSelectionArray);

            var noteText = "Note: Historical PHL data suggest that a 1/700 AVR+/Flu+ threshold is appropriate during the peak of the season, a 1/55 threshold during moderate periods of influenza activity, and 1/3.5 during out-of-season (summer) months to achieve detection with 85-95% confidence.";

            if(parameters.surveillanceScale == "National")
            {
                $("#calculatorD1_chart_table_report_div").html("To be " + formatTextParameter(parameters.confidenceLevel + "%") + " confident of detecting 1 or more antiviral resistant influenza events at a prevalence of " + formatTextParameter(xTableLabelMap[x[thisObj.selectedRow]]) + " at a national level, the PHL must test " + formatTextParameter(numberWithCommas(y[thisObj.selectedRow])) + " Flu+ specimens." + "<p>" + noteText + "</p>");
            }
            else
            {
                $("#calculatorD1_chart_table_report_div").html("To be " + formatTextParameter(parameters.confidenceLevel + "%") + " confident of detecting 1 or more antiviral resistant influenza events at a prevalence of " + formatTextParameter(xTableLabelMap[x[thisObj.selectedRow]]) + " (within the population under surveillance), the PHL must test " + formatTextParameter(numberWithCommas(y[thisObj.selectedRow])) + " Flu+ specimens." + "<p>" + noteText + "</p>");
            }
        }
    }

    thisObj.selectHandler([{row:thisObj.selectedRow ? thisObj.selectedRow : 0}]);
}

// draw chart and table given labels, x series, y series
function drawTypeDTab2()
{
    var labels = ['Confidence Level', 'Detection Threshold (AVR+/Flu+)'];
    var x = [];
    var y;
    var yLabelMap = {};

    // use a parameters object to pass in any other input parameters to the evaluation function
    var parameters = new Object();
    parameters.population = calculatorTypeDInputs.population;
    parameters.surveillanceScale = calculatorTypeDInputs.surveillanceScale;
    parameters.fluSampleSize = calculatorTypeDInputs.fluSampleSize2;

    // range: confidence level (%)
    // dynamically determine such that it contains resulting detection thresholds of 1/1000, 1/700, 1/600, 1/500, 1/200, 1/165, and 5%
    var detectionThresholdValues = [];

    detectionThresholdValues.push(100.*1./1000.);
    detectionThresholdValues.push(100.*1./700.);
    detectionThresholdValues.push(100.*1./600.);
    detectionThresholdValues.push(100.*1./500.);
    detectionThresholdValues.push(100.*1./200.);
    detectionThresholdValues.push(100.*1./165.);
    detectionThresholdValues.push(100.*0.05);

    var confidenceLevelValues = [];

    for(var i=0; i<detectionThresholdValues.length; i++)
    {
        confidenceLevelValues.push(evaluateTypeD_confidenceLevel_vs_detectionThreshold.call(parameters, detectionThresholdValues[i]));
    }

    // make sure we have valid values; otherwise set to 0
    for(var i=0; i<confidenceLevelValues.length; i++)
    {
        if((confidenceLevelValues[i] > 0. && confidenceLevelValues[i] < 99.9) != true)
        {
            confidenceLevelValues[i] = 0.;
        }
    }

    var min = 70;
    var max = 99;

    if(confidenceLevelValues[0] != 0. && confidenceLevelValues[0] < min)
    {
        min = confidenceLevelValues[0];
    }

    if(confidenceLevelValues[confidenceLevelValues.length-1] != 0. && confidenceLevelValues[confidenceLevelValues.length-1] > max)
    {
        max = confidenceLevelValues[confidenceLevelValues.length-1];
    }

    var numValues = 30;

    for(var i=0; i<numValues; i++)
    {
        var value = min + i/(numValues-1)*(max-min);

        // round to the nearest 100th
        x.push(Math.round(value*100)/100);
    }

    // add 99.9%
    x.push(99.9);

    // make sure confidence levels of interest are present
    for(var i=0; i<confidenceLevelValues.length; i++)
    {
        if(confidenceLevelValues[i] != 0. && min != confidenceLevelValues[i] && max != confidenceLevelValues[i])
        {
            x.push(confidenceLevelValues[i]);
        }
    }

    // sort numerically
    x = x.sort(function (a, b) { return a > b ? 1 : a < b ? -1 : 0; });

    // evaluation for each x
    y = x.map(evaluateTypeD_detectionThreshold_vs_confidenceLevel, parameters);

    // determine y labels
    for(var i=0; i<y.length; i++)
    {
        yLabelMap[y[i]] = Math.round(y[i]*100.)/100. + "% (1/" + Math.round(100. / y[i]) + ")";
    }

    // separate DataTable objects for chart / table to allow for formatting
    var dataChart = arraysToDataTable(labels, [x, y]);

    // if we have bad values for the confidence levels of interest, add them in a special way
    // for the table only!
    for(var i=0; i<confidenceLevelValues.length; i++)
    {
        if(confidenceLevelValues[i] == 0.)
        {
            x.push(99.99);
            y.push(detectionThresholdValues[i]);
            yLabelMap[detectionThresholdValues[i]] = Math.round(detectionThresholdValues[i]*100.)/100. + "% (1/" + Math.round(100. / detectionThresholdValues[i]) + ")";
        }
    }

    // before this was just dataChart.clone();
    var dataTable = arraysToDataTable(labels, [x, y]);

    // chart: format first column as percentage with prefix
    var formatterChart = new google.visualization.NumberFormat( {pattern: "Confidence Level: #.##'%'"} );
    formatterChart.format(dataChart, 0);

    // table: format first column as percentage
    var formatterTable = new google.visualization.NumberFormat( {pattern: "#.##'%'"} );
    formatterTable.format(dataTable, 0);

    // format y value with label
    var formatterY = new labelFormatter(yLabelMap);
    formatterY.format(dataChart, 1);
    formatterY.format(dataTable, 1);

    var optionsChart = {
        title: '',
        hAxis : { title: labels[0], format: "#.##'%'", gridlines : { count : 6 } },
        vAxis : { title: labels[1], format: "#.##'%'" },
        legend : { position: 'none' },
        fontSize : chartFontSize
    };

    // need to specify width here (rather than in CSS) for IE
    var optionsTable = {
        width: '225px'
    };

    $("#calculatorD2_chart_table_description_div").html("Enter the PHL's sample sizes in the boxes above (number of Flu+ specimens to be tested). The graph and table show the best combinations of <span class='calculatorTooltip' title='" + tooltipTypeDDetectionThreshold + "'>detection threshold</span> and <span class='calculatorTooltip' title='" + tooltipTypeDConfidenceLevel + "'>confidence level</span> achievable with " + formatTextParameter(numberWithCommas(parameters.fluSampleSize)) + " Flu+ specimens. This calculation assumes a total population of " + formatTextParameter(numberWithCommas(parameters.population)) + ". There is a trade-off between detection threshold and confidence level. Intuitively, the lower the prevalence of an antiviral resistant virus, the less likely it will be detected, and vice versa. Use the mouse to view values in the graph and scroll through the table.");

    var chart = new google.visualization.LineChart(document.getElementById('calculatorD2_chart_div'));
    chart.draw(dataChart, optionsChart);

    var table = new google.visualization.Table(document.getElementById('calculatorD2_table_div'));
    table.draw(dataTable, optionsTable);

    // selection handling
    var thisObj = drawTypeDTab2;

    google.visualization.events.addListener(chart, 'select', chartSelectHandler);
    google.visualization.events.addListener(table, 'select', tableSelectHandler);

    function chartSelectHandler(e) { thisObj.selectHandler(chart.getSelection()); }
    function tableSelectHandler(e) { thisObj.selectHandler(table.getSelection()); }

    thisObj.selectHandler = function(selectionArray)
    {
        if(selectionArray.length > 0 && selectionArray[0].row != null)
        {
            thisObj.selectedRow = selectionArray[0].row;

            // make sure row is valid
            if(thisObj.selectedRow >= x.length)
            {
                thisObj.selectedRow = 0;
            }

            // form new array with only this entry (to avoid multiple selections)
            var newSelectionArray = [{row:selectionArray[0].row}];

            // select element in chart and table
            chart.setSelection(newSelectionArray);
            table.setSelection(newSelectionArray);

            var noteText = "Note: Historical PHL data suggest that a 1/700 AVR+/Flu+ threshold is appropriate during the peak of the season, a 1/55 threshold during moderate periods of influenza activity, and 1/3.5 during out-of-season (summer) months to achieve detection with 85-95% confidence.";

            if(parameters.surveillanceScale == "National")
            {
                $("#calculatorD2_chart_table_report_div").html("If the laboratory tested " + formatTextParameter(numberWithCommas(parameters.fluSampleSize)) + " Flu+ specimens, the PHL can be " + formatTextParameter(Math.round(x[thisObj.selectedRow]*100.)/100. + "%") + " confident that the antiviral resistant influenza would be detected at a prevalence of " + formatTextParameter(yLabelMap[y[thisObj.selectedRow]]) + " at a national level." + "<p>" + noteText + "</p>");
            }
            else
            {
                $("#calculatorD2_chart_table_report_div").html("If the laboratory tested " + formatTextParameter(numberWithCommas(parameters.fluSampleSize)) + " Flu+ specimens, the PHL can be " + formatTextParameter(Math.round(x[thisObj.selectedRow]*100.)/100. + "%") + " confident that the antiviral resistant influenza would be detected at a prevalence of " + formatTextParameter(yLabelMap[y[thisObj.selectedRow]]) + " (within the population under surveillance)." + "<p>" + noteText + "</p>");
            }
        }
    }

    thisObj.selectHandler([{row:thisObj.selectedRow ? thisObj.selectedRow : 0}]);
}

function drawTypeDTab3()
{
    var labels = ['Flu+ sample size', 'lower bound', 'upper bound'];
    var x = [];
    var y;

    // use a parameters object to pass in any other input parameters to the evaluation function
    var parameters = new Object();
    parameters.population = calculatorTypeDInputs.population;
    parameters.surveillanceScale = calculatorTypeDInputs.surveillanceScale;
    parameters.detectionThreshold = calculatorTypeDInputs.detectionThreshold3;
    parameters.confidenceInterval = calculatorTypeDInputs.confidenceInterval3;
    parameters.falseNegativeTolerance = calculatorTypeDInputs.falseNegativeTolerance3;
    parameters.falsePositiveTolerance = calculatorTypeDInputs.falsePositiveTolerance3;

    // range: Flu+ sample size
    // compute based on an n value of 1 to 1000
    // however, we will at least go up to 100 Flu+ samples...
    var P_T = parameters.population;
    var P_S;

    if(parameters.surveillanceScale == "National")
    {
        P_S = nationalPopulation;
    }
    else if(parameters.surveillanceScale == "State")
    {
        P_S = P_T;
    }
    else
    {
        alert("unknown surveillance scale");
    }

    var maxFluSampleSize = 1000. * P_T / P_S;

    var min = 1;
    var max = Math.max(100, Math.ceil(maxFluSampleSize));
    var numValues = Math.round((max - min) / 1.0 + 1.);

    for(var i=0; i<numValues; i++)
    {
        var value = min + i/(numValues-1)*(max-min);

        // round to the nearest 100th
        x.push(Math.round(value*100)/100);
    }

    // evaluation for each x
    yLB = x.map(evaluateTypeD2_prevalenceLB_vs_fluSampleSize, parameters);
    yUB = x.map(evaluateTypeD2_prevalenceUB_vs_fluSampleSize, parameters);

    // separate DataTable objects for chart / table to allow for formatting
    var dataChart = arraysToDataTable(labels, [x, yLB, yUB]);
    var dataTable = dataChart.clone();

    // modify legend for just the chart
    dataChart.setColumnLabel(1, "False positive boundary");
    dataChart.setColumnLabel(2, "False negative boundary");

    // chart: format first column as percentage with prefix
    var formatterChart0 = new google.visualization.NumberFormat( {pattern: "Flu+ sample size: #"} );
    var formatterChart1 = new google.visualization.NumberFormat( {pattern: "#.##'%'"} );
    formatterChart0.format(dataChart, 0);
    formatterChart1.format(dataChart, 1);
    formatterChart1.format(dataChart, 2);

    // table: format second column as percentage
    var formatterTable = new google.visualization.NumberFormat( {pattern: "#.##'%'"} );
    formatterTable.format(dataTable, 1);
    formatterTable.format(dataTable, 2);

    var optionsChart = {
        title: '',
        hAxis : { title: labels[0] }, // logScale: true
        vAxis : { title: "Prevalence of antiviral resistance", format: "#.##'%'" },
        legend : { position: 'top' },
        fontSize : chartFontSize
    };

    // need to specify width here (rather than in CSS) for IE
    var optionsTable = {
        width: '225px'
    };

    $("#calculatorD3_chart_table_description_div").html("Based these inputs, an antiviral resistance alarm will be triggered when the " + formatTextParameter(parameters.confidenceInterval + "%") + " confidence interval for antiviral prevalence includes the value " + formatTextParameter(parameters.detectionThreshold + "%") + ". As sample size increases, this threshold can be more precisely determined, and the probabilities of triggering the alarm too early or too late decrease. The graph and table below show the ranges of antiviral prevalence around the " + formatTextParameter(parameters.detectionThreshold + "%") + " threshold where the false positive rate is below the specified " + formatTextParameter(parameters.falsePositiveTolerance + "%") + " tolerance (region below blue line) and the false negative rate is below the specified " + formatTextParameter(parameters.falseNegativeTolerance + "%") + " tolerance (region above the red line). For a given sample size, when the true prevalence of antiviral resistance lies between the blue and red curves, surveillance data is likely to trigger the antiviral resistance alarm. These calculations assume a total population of " + formatTextParameter(numberWithCommas(parameters.population)) + ". Use the mouse to view values in the sample size graph and scroll through sample size table.");

    var chart = new google.visualization.LineChart(document.getElementById('calculatorD3_chart_div'));
    chart.draw(dataChart, optionsChart);

    var table = new google.visualization.Table(document.getElementById('calculatorD3_table_div'));
    table.draw(dataTable, optionsTable);

    // selection handling
    var thisObj = drawTypeDTab3;

    google.visualization.events.addListener(chart, 'select', chartSelectHandler);
    google.visualization.events.addListener(table, 'select', tableSelectHandler);

    function chartSelectHandler(e) { thisObj.selectHandler(chart.getSelection()); }
    function tableSelectHandler(e) { thisObj.selectHandler(table.getSelection()); }

    thisObj.selectHandler = function(selectionArray)
    {
        if(selectionArray.length > 0 && selectionArray[0].row != null)
        {
            thisObj.selectedRow = selectionArray[0].row;

            // make sure row is valid
            if(thisObj.selectedRow >= x.length)
            {
                thisObj.selectedRow = 0;
            }

            // form new array with only this entry (to avoid multiple selections)
            var newSelectionArray = [{row:selectionArray[0].row}];

            // select element in chart and table
            chart.setSelection(newSelectionArray);
            table.setSelection(newSelectionArray);

            if(parameters.surveillanceScale == "National")
            {
                $("#calculatorD3_chart_table_report_div").html("To detect when antiviral resistance reaches a threshold prevalence of " + formatTextParameter(parameters.detectionThreshold + "%") + ", while limiting the probability of a false alarm to less than than " + formatTextParameter(parameters.falsePositiveTolerance + "%") + " when the prevalence is lower than " + formatTextParameter(yLB[thisObj.selectedRow] + "%") + " and limiting the probability of a missed alarm to less than " + formatTextParameter(parameters.falseNegativeTolerance + "%") + " when the prevalence is higher than " + formatTextParameter(yUB[thisObj.selectedRow] + "%") + " <i>at a national level</i>, the PHL must test " + formatTextParameter(numberWithCommas(x[thisObj.selectedRow])) + " Flu+ specimens of the given type and subtype or lineage.");
            }
            else
            {
                $("#calculatorD3_chart_table_report_div").html("To detect when antiviral resistance reaches a threshold prevalence of " + formatTextParameter(parameters.detectionThreshold + "%") + ", while limiting the probability of a false alarm to less than than " + formatTextParameter(parameters.falsePositiveTolerance + "%") + " when the prevalence is lower than " + formatTextParameter(yLB[thisObj.selectedRow] + "%") + " and limiting the probability of a missed alarm to less than " + formatTextParameter(parameters.falseNegativeTolerance + "%") + " when the prevalence is higher than " + formatTextParameter(yUB[thisObj.selectedRow] + "%") + ", the PHL must test " + formatTextParameter(numberWithCommas(x[thisObj.selectedRow])) + " Flu+ specimens of the given type and subtype or lineage.");
            }
        }
    }

    thisObj.selectHandler([{row:thisObj.selectedRow ? thisObj.selectedRow : 0}]);
}

function calculatorTypeDInitialize()
{
    // initialize UI elements and events

    // tooltips
    $(".tooltipTypeDTotalPopulation").attr("title", tooltipTypeDTotalPopulation);
    $(".tooltipTypeDConfidenceLevel").attr("title", tooltipTypeDConfidenceLevel);
    $(".tooltipTypeDDetectionThreshold").attr("title", tooltipTypeDDetectionThreshold);
    $(".tooltipTypeDMinimumFluSampleSize").attr("title", tooltipTypeDMinimumFluSampleSize);
    $(".tooltipTypeDFluSampleSize").attr("title", tooltipTypeDFluSampleSize);
    $(".tooltipTypeDSurveillanceScale").attr("title", tooltipTypeDSurveillanceScale);

    $(".tooltipTypeD2DetectionThreshold").attr("title", tooltipTypeD2DetectionThreshold);
    $(".tooltipTypeD2ConfidenceInterval").attr("title", tooltipTypeD2ConfidenceInterval);
    $(".tooltipTypeD2FalseNegativeTolerance").attr("title", tooltipTypeD2FalseNegativeTolerance);
    $(".tooltipTypeD2FalsePositiveTolerance").attr("title", tooltipTypeD2FalsePositiveTolerance);

    // population options
    var populationOptions = $("#calculatorD_select_population");

    $.each(statePopulations, function(key, value) {
        populationOptions.append($("<option />").val(key).text(key));
    });

    populationOptions.append($("<option />").val("Other").text("Other"));

    // population selection
    $("#calculatorD_select_population, #calculatorD_input_population").bind('keyup mouseup change', function(e) {
        // selected state and population for that state
        var state = $("#calculatorD_select_population :selected").val();
        var population = 0;

        if(state == "Other")
        {
            // hide number label and show number input
            $("#calculatorD_select_population_number_label").hide();
            $("#calculatorD_input_population").show();

            population = $("#calculatorD_input_population").val();
        }
        else
        {
            // show number label and hide number input
            $("#calculatorD_select_population_number_label").show();
            $("#calculatorD_input_population").hide();

            population = statePopulations[state];

            // update the number label
            $("#calculatorD_select_population_number_label").html(numberWithCommas(population));
        }

        // save the value
        calculatorTypeDInputs.population = population;

        // update the surveillane scale "state" option text
        $("#calculatorD_select_surveillance_scale option:last-child").text($("#calculatorD_select_population :selected").val());

        // refresh
        calculatorTypeDRefresh();
    });

    // force an initial update event (since we have no current value for population)
    $("#calculatorD_select_population").change();

    // surveillance scale selection
    $("#calculatorD_select_surveillance_scale").bind('keyup mouseup change', function(e) {
        // make sure we have a valid value
        var value = $("#calculatorD_select_surveillance_scale :selected").val();

        if(value != "National" && value != "State")
        {
            alert("invalid surveillance scale value");
            return;
        }

        // save the value
        calculatorTypeDInputs.surveillanceScale = value;

        // refresh
        calculatorTypeDRefresh();
    });

    // force an initial update event (since we have no current value for population)
    $("#calculatorD_select_surveillance_scale").change();

    // tab 1: confidence level slider
    $("#calculatorD1_input_confidence_level_slider").slider({
        value:calculatorTypeDInputs.confidenceLevel1,
        min: 80,
        max: 99,
        step: 1,
        slide: function(event, ui) {
            $("#calculatorD1_input_confidence_level").val(ui.value + "%");
            calculatorTypeDInputs.confidenceLevel1 = parseFloat($("#calculatorD1_input_confidence_level").val());
            calculatorTypeDRefresh();
        }
    });

    $("#calculatorD1_input_confidence_level").val($("#calculatorD1_input_confidence_level_slider").slider("value") + "%");

    // tab 2: Flu+ sample size
    $("#calculatorD2_input_flu_sample_size").bind('keyup mouseup change', function(e) {
        calculatorTypeDInputs.fluSampleSize2 = parseFloat($("#calculatorD2_input_flu_sample_size").val());
        calculatorTypeDRefresh();
    });

    $("#calculatorD2_input_flu_sample_size").val(calculatorTypeDInputs.fluSampleSize2);

    // tab 3: AVR+/Flu+ detection threshold slider
    $("#calculatorD3_input_detection_threshold_slider").slider({
        value:calculatorTypeDInputs.detectionThreshold3,
        min: 1,
        max: 50,
        step: 1,
        slide: function(event, ui) {
            $("#calculatorD3_input_detection_threshold").val(ui.value + "%");
            calculatorTypeDInputs.detectionThreshold3 = parseFloat($("#calculatorD3_input_detection_threshold").val());
            calculatorTypeDRefresh();
        }
    });

    $("#calculatorD3_input_detection_threshold").val($("#calculatorD3_input_detection_threshold_slider").slider("value") + "%");

    // tab 3: confidence interval slider
    $("#calculatorD3_input_confidence_interval_slider").slider({
        value:calculatorTypeDInputs.confidenceInterval3,
        min: 80,
        max: 99,
        step: 1,
        slide: function(event, ui) {
            $("#calculatorD3_input_confidence_interval").val(ui.value + "%");
            calculatorTypeDInputs.confidenceInterval3 = parseFloat($("#calculatorD3_input_confidence_interval").val());
            calculatorTypeDRefresh();
        }
    });

    $("#calculatorD3_input_confidence_interval").val($("#calculatorD3_input_confidence_interval_slider").slider("value") + "%");

    // tab 3: false negative tolerance slider
    $("#calculatorD3_input_false_negative_tolerance_slider").slider({
        value:calculatorTypeDInputs.falseNegativeTolerance3,
        min: 1,
        max: 50,
        step: 1,
        slide: function(event, ui) {
            $("#calculatorD3_input_false_negative_tolerance").val(ui.value + "%");
            calculatorTypeDInputs.falseNegativeTolerance3 = parseFloat($("#calculatorD3_input_false_negative_tolerance").val());
            calculatorTypeDRefresh();
        }
    });

    $("#calculatorD3_input_false_negative_tolerance").val($("#calculatorD3_input_false_negative_tolerance_slider").slider("value") + "%");

    // tab 3: false positive tolerance slider
    $("#calculatorD3_input_false_positive_tolerance_slider").slider({
        value:calculatorTypeDInputs.falsePositiveTolerance3,
        min: 1,
        max: 50,
        step: 1,
        slide: function(event, ui) {
            $("#calculatorD3_input_false_positive_tolerance").val(ui.value + "%");
            calculatorTypeDInputs.falsePositiveTolerance3 = parseFloat($("#calculatorD3_input_false_positive_tolerance").val());
            calculatorTypeDRefresh();
        }
    });

    $("#calculatorD3_input_false_positive_tolerance").val($("#calculatorD3_input_false_positive_tolerance_slider").slider("value") + "%");
}

function calculatorTypeDRefresh()
{
    if(calculatorTypeDActiveTabIndex == 0)
    {
        drawTypeDTab1();
    }
    else if(calculatorTypeDActiveTabIndex == 1)
    {
        drawTypeDTab2();
    }
    else if(calculatorTypeDActiveTabIndex == 2)
    {
        drawTypeDTab3();
    }
    else
    {
        alert("error, unknown tab index " + calculatorTypeDActiveTabIndex);
    }
}

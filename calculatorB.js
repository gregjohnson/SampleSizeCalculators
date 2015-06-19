///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// CALCULATOR B /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// calculator type B inputs
var calculatorTypeBInputs = {
    population:1,
    surveillanceScale:'National',
    confidenceLevel1:95,
    tableMode1:"simple",
    confidenceLevel2:95,
    p2:10,
    tableMode2:"simple",
    confidenceLevel3:95,
    p3:10,
    detectionThreshold3:1,
    fluSampleSize4:1,
    MAILISampleSize4:0,
    p4:10
};

// tooltip text
var tooltipTypeBTotalPopulation = "This is the total population size under surveillance. For labs representing entire states, simply select the name of the state. This will automatically provide the 2012 census projection of the state population. For labs collecting specimens from subsets of state populations or populations that cross multiple states, choose 'Other' and enter the estimated size of the entire population under consideration.";
var tooltipTypeBConfidenceLevel = "The desired confidence that the sample will contain at least one Rare+ when the prevalence of rare/novel influenza reaches the specified limit of detection. Sample sizes can be calculated for unscreened MA-ILI or screened Flu+, or a combination of both types of specimens. For example, if the PHL choose a confidence level of 95% and a detection threshold of 1/700, then the resulting minimum sample size should be sufficient to detect a rare/novel influenza when it reaches a prevalence of 1/700 Rare+/Flu+, 95% of the time. Intuitively, a high confidence level and a low detection threshold requires many samples, while low confidence and a high detection threshold results in fewer samples.";
var tooltipTypeBExpectedFluMAILI = "This is the PHL's surveillance target; the level of Flu+/MA-ILI the PHL would like to estimate. For example, if the PHL would like to detect when Flu+/MA-ILI crosses the 10% threshold at the beginning of the influenza season, then move the slider to 10%. If, instead, the PHL plans to use the data to estimate Flu+/MA-ILI later in the season, when it is closer to 30%, then move the slider closer to 30%. Although the actual fraction of Flu+ over MA-ILI may differ from the value chosen, this approximation still provides an important baseline for determining sample sizes.";
var tooltipTypeBDetectionThreshold = "The detection threshold for a rare/novel influenza is the prevalence of the rare/novel influenza (out of all Flu+ cases) at which the first rare/novel influenza specimens are expected to appear in the lab. For example, a detection threshold of 1/700 means that rare/novel influenza should be detected by the lab when it rises to a prevalence of one out of every 700 cases of influenza.";
var tooltipTypeBMinimumFluSampleSize = "The minimum number of Flu+ specimens required to detect a rare/novel influenza when its prevalence (Rare+/Flu+) reaches the specified detection threshold, with the specified level of confidence.";
var tooltipTypeBMinimumMAILISampleSize = "The minimum number of unscreened MA-ILI specimens required to detect a rare/novel influenza when its prevalence (Rare+/Flu+) reaches the specified detection threshold, with the specified level of confidence.";
var tooltipTypeBFluSampleSize = "The number of Flu+ specimens to be tested.";
var tooltipTypeBMAILISampleSize = "The number of unscreened MA-ILI specimens to be tested. Both Flu+ and unscreened MA-ILI specimens can be used to detect rare/novel influenza specimens. However, many more unscreened MA-ILI specimens are typically required than Flu+ specimens to achieve the same power of detection, particularly when the overall prevalence of influenza (Flu+/MA-ILI) is low.";
var tooltipTypeBSurveillanceScale = "This is the scale of the surveillance effort. The default is national, meaning that all states are contributing to a national surveillance effort proportional to their population size.  The number of samples that a state PHL needs to test is apportioned based on population size. The calculator also provides the option for states to calculate the number of specimens to test for detection of a rare/novel influenza event at a specific threshold within their state; however, the sample size for an individual state at the same threshold (e.g. 1/500 or 1/700) will be significantly larger than that needed for the national threshold.";

// active tab index
var calculatorTypeBActiveTabIndex = 0;

function evaluateTypeB_FluSampleSize_vs_detectionThreshold(detectionThreshold)
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

function evaluateTypeB_MAILISampleSize_vs_detectionThreshold(detectionThreshold)
{
    // this object contains parameter values

    var sampleSize = Math.log(1. - this.confidenceLevel/100.) / Math.log(1. - detectionThreshold/100.);

    if(this.surveillanceScale == "State")
    {
        // finite population correction
        sampleSize = sampleSize * Math.sqrt((this.population - sampleSize) / (this.population - 1.));
    }

    // to MA-ILI+ samples
    sampleSize = sampleSize * (100. / this.p);

    if(this.surveillanceScale == "National")
    {
        sampleSize = sampleSize * this.population / nationalPopulation;
    }

    return Math.ceil(sampleSize);
}

function evaluateTypeB_MAILISampleSize_vs_FluSampleSize(fluSampleSize)
{
    var idealFluSampleSize = Math.log(1. - this.confidenceLevel/100.) / Math.log(1. - this.detectionThreshold/100.);

    if(this.surveillanceScale == "State")
    {
        // finite population correction
        idealFluSampleSize = idealFluSampleSize * Math.sqrt((this.population - idealFluSampleSize) / (this.population - 1.));
    }

    if(this.surveillanceScale == "National")
    {
        idealFluSampleSize = idealFluSampleSize * this.population / nationalPopulation;
    }

    var neededAdditionalFluSampleSize = idealFluSampleSize - fluSampleSize;

    if(neededAdditionalFluSampleSize <= 0.)
    {
        return 0.;
    }

    return Math.ceil(neededAdditionalFluSampleSize * (100. / this.p));
}

function evaluateTypeB_detectionThreshold_vs_confidenceLevel(confidenceLevel)
{
    var idealFluSampleSize = this.fluSampleSize + this.p/100. * this.MAILISampleSize;

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

function evaluateTypeB_confidenceLevel_vs_detectionThreshold(detectionThreshold)
{
    var idealFluSampleSize = this.fluSampleSize + this.p/100. * this.MAILISampleSize;

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

// draw chart and table given labels, x series, y series
function drawTypeBTab1()
{
    var labels = ['Detection Threshold (Rare+/Flu+)', 'Minimum Flu+ Sample Size'];
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

    // final value for threshold 1/4
    value = 25.0;
    x.push(value);
    xChartLabelMap[value] = "Detection Threshhold: " + value + "% (1/" + Math.round(100. / value) + ")";
    xTableLabelMap[value] = value + "% (1/" + Math.round(100. / value) + ")";

    // use a parameters object to pass in any other input parameters to the evaluation function
    var parameters = new Object();
    parameters.population = calculatorTypeBInputs.population;
    parameters.surveillanceScale = calculatorTypeBInputs.surveillanceScale;
    parameters.confidenceLevel = calculatorTypeBInputs.confidenceLevel1;

    // evaluation for each x
    y = x.map(evaluateTypeB_FluSampleSize_vs_detectionThreshold, parameters);

    // separate DataTable objects for chart / table to allow for formatting
    var dataChart = arraysToDataTable(labels, [x, y]);
    var dataTable = dataChart.clone();

    // remove last row (1/4 threshold) from chart, since we don't want it drawn there...
    dataChart.removeRow(52);

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

    $("#calculatorB1_chart_table_description_div").html("<span class='calculatorTooltip' title='" + tooltipTypeBMinimumFluSampleSize + "'>Minimum sample size (of Flu+ specimens)</span> required to detect a rare/novel influenza at a specified <span class='calculatorTooltip' title='" + tooltipTypeBDetectionThreshold + "'>detection threshold (Rare+/Flu+)</span>, with a confidence of " + formatTextParameter(parameters.confidenceLevel + "%") + ". These calculations assume a total population of " + formatTextParameter(numberWithCommas(parameters.population)) + ". Use the mouse to view values in the sample size graph and scroll through sample size table.");

    var chart = new google.visualization.LineChart(document.getElementById('calculatorB1_chart_div'));
    chart.draw(dataChart, optionsChart);

    var table = new google.visualization.Table(document.getElementById('calculatorB1_table_div'));
    var tableDataView = new google.visualization.DataView(dataTable);

    if(calculatorTypeBInputs.tableMode1 == "simple")
    {
        tableDataView.setRows([1,6,52]);
    }

    table.draw(tableDataView, optionsTable);

    // selection handling
    var thisObj = drawTypeBTab1;

    google.visualization.events.addListener(chart, 'select', chartSelectHandler);
    google.visualization.events.addListener(table, 'select', tableSelectHandler);

    function chartSelectHandler(e) { thisObj.selectHandler(chart.getSelection(), "chart"); }
    function tableSelectHandler(e) { thisObj.selectHandler(table.getSelection(), "table"); }

    thisObj.selectHandler = function(selectionArray, source)
    {
        if(selectionArray.length > 0 && selectionArray[0].row != null)
        {
            thisObj.selectedRow = selectionArray[0].row;

            if(source == "table")
            {
                // map to selected row in underyling data table
                thisObj.selectedRow = tableDataView.getTableRowIndex(thisObj.selectedRow);
            }

            // make sure row is valid
            if(thisObj.selectedRow >= x.length)
            {
                thisObj.selectedRow = 0;
            }

            // form new array with only this entry (to avoid multiple selections)
            // selection arrays are different between the chart and table...
            var newSelectionArrayChart = [{row:thisObj.selectedRow}];
            var newSelectionArrayTable = [{row:tableDataView.getViewRowIndex(thisObj.selectedRow)}];

            // select element in chart and table
            chart.setSelection(newSelectionArrayChart);
            table.setSelection(newSelectionArrayTable);

            if(parameters.surveillanceScale == "National")
            {
                $("#calculatorB1_chart_table_report_div").html("To be " + formatTextParameter(parameters.confidenceLevel + "%") + " confident of detecting 1 or more rare/novel influenza events at a prevalence of " + formatTextParameter(xTableLabelMap[x[thisObj.selectedRow]]) + " at a national level, the PHL must test " + formatTextParameter(numberWithCommas(y[thisObj.selectedRow])) + " Flu+ specimens.");
            }
            else
            {
                $("#calculatorB1_chart_table_report_div").html("To be " + formatTextParameter(parameters.confidenceLevel + "%") + " confident of detecting 1 or more rare/novel influenza events at a prevalence of " + formatTextParameter(xTableLabelMap[x[thisObj.selectedRow]]) + " (within the population under surveillance), the PHL must test " + formatTextParameter(numberWithCommas(y[thisObj.selectedRow])) + " Flu+ specimens.");
            }
        }
    }

    thisObj.selectHandler([{row:thisObj.selectedRow ? thisObj.selectedRow : 0}]);
}

// draw chart and table given labels, x series, y series
function drawTypeBTab2()
{
    var labels = ['Detection Threshold (Rare+/Flu+)', 'Minimum MA-ILI Sample Size'];
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

        // round to the nearest 100th
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

    // final value for threshold 1/4
    value = 25.0;
    x.push(value);
    xChartLabelMap[value] = "Detection Threshhold: " + value + "% (1/" + Math.round(100. / value) + ")";
    xTableLabelMap[value] = value + "% (1/" + Math.round(100. / value) + ")";

    // use a parameters object to pass in any other input parameters to the evaluation function
    var parameters = new Object();
    parameters.population = calculatorTypeBInputs.population;
    parameters.surveillanceScale = calculatorTypeBInputs.surveillanceScale;
    parameters.confidenceLevel = calculatorTypeBInputs.confidenceLevel2;
    parameters.p = calculatorTypeBInputs.p2;

    // evaluation for each x
    y = x.map(evaluateTypeB_MAILISampleSize_vs_detectionThreshold, parameters);

    // separate DataTable objects for chart / table to allow for formatting
    var dataChart = arraysToDataTable(labels, [x, y]);
    var dataTable = dataChart.clone();

    // remove last row (1/4 threshold) from chart, since we don't want it drawn there...
    dataChart.removeRow(52);

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

    $("#calculatorB2_chart_table_description_div").html("<span class='calculatorTooltip' title='" + tooltipTypeBMinimumMAILISampleSize + "'>Minimum sample size (of unscreened MA-ILI specimens)</span> required to detect a rare/novel influenza of influenza at the specified <span class='calculatorTooltip' title='" + tooltipTypeBDetectionThreshold + "'>detection threshold (Rare+/Flu+)</span>, with a confidence of " + formatTextParameter(parameters.confidenceLevel + "%") + ". These calculations assume a total population of " + formatTextParameter(numberWithCommas(parameters.population)) + " and a Flu+/MA-ILI prevalence of " + formatTextParameter(parameters.p + "%") + ". Use the mouse to view values in the sample size graph and scroll through sample size table.");

    var chart = new google.visualization.LineChart(document.getElementById('calculatorB2_chart_div'));
    chart.draw(dataChart, optionsChart);

    var table = new google.visualization.Table(document.getElementById('calculatorB2_table_div'));
    var tableDataView = new google.visualization.DataView(dataTable);

    if(calculatorTypeBInputs.tableMode2 == "simple")
    {
        tableDataView.setRows([1,6,52]);
    }

    table.draw(tableDataView, optionsTable);

    // selection handling
    var thisObj = drawTypeBTab2;

    google.visualization.events.addListener(chart, 'select', chartSelectHandler);
    google.visualization.events.addListener(table, 'select', tableSelectHandler);

    function chartSelectHandler(e) { thisObj.selectHandler(chart.getSelection(), "chart"); }
    function tableSelectHandler(e) { thisObj.selectHandler(table.getSelection(), "table"); }

    thisObj.selectHandler = function(selectionArray, source)
    {
        if(selectionArray.length > 0 && selectionArray[0].row != null)
        {
            thisObj.selectedRow = selectionArray[0].row;

            if(source == "table")
            {
                // map to selected row in underyling data table
                thisObj.selectedRow = tableDataView.getTableRowIndex(thisObj.selectedRow);
            }

            // make sure row is valid
            if(thisObj.selectedRow >= x.length)
            {
                thisObj.selectedRow = 0;
            }

            // form new array with only this entry (to avoid multiple selections)
            // selection arrays are different between the chart and table...
            var newSelectionArrayChart = [{row:thisObj.selectedRow}];
            var newSelectionArrayTable = [{row:tableDataView.getViewRowIndex(thisObj.selectedRow)}];

            // select element in chart and table
            chart.setSelection(newSelectionArrayChart);
            table.setSelection(newSelectionArrayTable);

            if(parameters.surveillanceScale == "National")
            {
                $("#calculatorB2_chart_table_report_div").html("To be " + formatTextParameter(parameters.confidenceLevel + "%") + " confident of detecting 1 or more rare/novel influenza events at a prevalence of " + formatTextParameter(xTableLabelMap[x[thisObj.selectedRow]]) + " at a national level, the PHL must test " + formatTextParameter(numberWithCommas(y[thisObj.selectedRow])) + " MA-ILI specimens.");
            }
            else
            {
                $("#calculatorB2_chart_table_report_div").html("To be " + formatTextParameter(parameters.confidenceLevel + "%") + " confident of detecting 1 or more rare/novel influenza events at a prevalence of " + formatTextParameter(xTableLabelMap[x[thisObj.selectedRow]]) + " (within the population under surveillance), the PHL must test " + formatTextParameter(numberWithCommas(y[thisObj.selectedRow])) + " MA-ILI specimens.");
            }
        }
    }

    thisObj.selectHandler([{row:thisObj.selectedRow ? thisObj.selectedRow : 0}]);
}

// draw chart and table given labels, x series, y series
function drawTypeBTab3()
{
    var labels = ['Flu+ Sample Size', 'MA-ILI Sample Size'];
    var x = [];
    var y;

    // use a parameters object to pass in any other input parameters to the evaluation function
    var parameters = new Object();
    parameters.population = calculatorTypeBInputs.population;
    parameters.surveillanceScale = calculatorTypeBInputs.surveillanceScale;
    parameters.confidenceLevel = calculatorTypeBInputs.confidenceLevel3;
    parameters.p = calculatorTypeBInputs.p3;
    parameters.detectionThreshold = calculatorTypeBInputs.detectionThreshold3;

    // dynamically set range based on parameters
    var idealFluSampleSize = Math.log(1. - parameters.confidenceLevel/100.) / Math.log(1. - parameters.detectionThreshold/100.);

    if(parameters.surveillanceScale == "State")
    {
        // finite population correction
        idealFluSampleSize = idealFluSampleSize * Math.sqrt((parameters.population - idealFluSampleSize) / (parameters.population - 1.));
    }

    if(parameters.surveillanceScale == "National")
    {
        idealFluSampleSize = idealFluSampleSize * parameters.population / nationalPopulation;
    }

    // range: Flu+ sample size
    var min = 0;
    var max = Math.ceil(idealFluSampleSize);
    var numValues = max - min + 1;

    // limit number of values
    if(numValues > 100)
    {
        numValues = 100;
    }

    for(var i=0; i<numValues; i++)
    {
        var value = min + i/(numValues-1)*(max-min);

        // round to the nearest integer
        x.push(Math.round(value));
    }

    // evaluation for each x
    y = x.map(evaluateTypeB_MAILISampleSize_vs_FluSampleSize, parameters);

    // labels with percentages
    xLabelMap = {};
    yLabelMap = {};

    for(var i=0; i<y.length; i++)
    {
        // round to nearest tenth of a percent
        xLabelMap[x[i]] = x[i] + " (" + Math.round(x[i]/(x[i]+y[i])*100.*10.)/10. + "%)";
        yLabelMap[y[i]] = y[i] + " (" + Math.round(y[i]/(x[i]+y[i])*100.*10.)/10. + "%)";
    }

    // separate DataTable objects for chart / table to allow for formatting
    var dataChart = arraysToDataTable(labels, [x, y]);
    var dataTable = dataChart.clone();

    // chart: use x label in tooltip
    var formatterChart = new google.visualization.NumberFormat( {pattern: "Flu+ Sample Size: #"} );
    formatterChart.format(dataChart, 0);

    var optionsChart = {
        title: '',
        hAxis : { title: labels[0] },
        vAxis : { title: labels[1] },
        legend : { position: 'none' },
        fontSize : chartFontSize
    };

    // table: user labels with percentages
    var formatterTableX = new labelFormatter(xLabelMap);
    var formatterTableY = new labelFormatter(yLabelMap);

    formatterTableX.format(dataTable, 0);
    formatterTableY.format(dataTable, 1);

    // need to specify width here (rather than in CSS) for IE
    var optionsTable = {
        width: '225px'
    };

    $("#calculatorB3_chart_table_description_div").html("Combinations of <span class='calculatorTooltip' title='" + tooltipTypeBFluSampleSize + "'>Flu+</span> and <span class='calculatorTooltip' title='" + tooltipTypeBMAILISampleSize + "'>unscreened MA-ILI</span> sample sizes may be required to detect a rare/novel influenza specimen with prevalence (Rare+/Flu+) that has reached the detection threshold of " + formatTextParameter(parameters.detectionThreshold + "% (1/" + Math.round(100. / parameters.detectionThreshold) + ")") + ", with a confidence of " + formatTextParameter(parameters.confidenceLevel + "%") + ". These calculations assume a total population of " + formatTextParameter(numberWithCommas(parameters.population)) + " and a Flu+/MA-ILI prevalence of " + formatTextParameter(parameters.p + "%") + ". Many more unscreened MA-ILI specimens are typically required than Flu+ specimens to achieve the same power of detection, particularly when the overall prevalence of influenza (Flu+/MA-ILI) is low.");

    var chart = new google.visualization.LineChart(document.getElementById('calculatorB3_chart_div'));
    chart.draw(dataChart, optionsChart);

    var table = new google.visualization.Table(document.getElementById('calculatorB3_table_div'));
    table.draw(dataTable, optionsTable);

    // selection handling
    var thisObj = drawTypeBTab3;

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
                $("#calculatorB3_chart_table_report_div").html("To be " + formatTextParameter(parameters.confidenceLevel + "%") + " confident of detecting 1 or more rare/novel influenza events at a prevalence of " + formatTextParameter(parameters.detectionThreshold + "% (1/" + Math.round(100. / parameters.detectionThreshold) + ")") + " at a national level, the PHL must test " + formatTextParameter(numberWithCommas(y[thisObj.selectedRow])) + " MA-ILI and " + formatTextParameter(numberWithCommas(x[thisObj.selectedRow])) + " Flu+ specimens (with " + formatTextParameter(parameters.p + "%") + " Flu+/MA-ILI prevalence).");
            }
            else
            {
                $("#calculatorB3_chart_table_report_div").html("To be " + formatTextParameter(parameters.confidenceLevel + "%") + " confident of detecting 1 or more rare/novel influenza events at a prevalence of " + formatTextParameter(parameters.detectionThreshold + "% (1/" + Math.round(100. / parameters.detectionThreshold) + ")") + " (within the population under surveillance), the PHL must test " + formatTextParameter(numberWithCommas(y[thisObj.selectedRow])) + " MA-ILI and " + formatTextParameter(numberWithCommas(x[thisObj.selectedRow])) + " Flu+ specimens (with " + formatTextParameter(parameters.p + "%") + " Flu+/MA-ILI prevalence).");
            }
        }
    }

    thisObj.selectHandler([{row:thisObj.selectedRow ? thisObj.selectedRow : 0}]);
}

// draw chart and table given labels, x series, y series
function drawTypeBTab4()
{
    var labels = ['Confidence Level', 'Detection Threshold (Rare+/Flu+)'];
    var x = [];
    var y;
    var yLabelMap = {};

    // use a parameters object to pass in any other input parameters to the evaluation function
    var parameters = new Object();
    parameters.population = calculatorTypeBInputs.population;
    parameters.surveillanceScale = calculatorTypeBInputs.surveillanceScale;
    parameters.fluSampleSize = calculatorTypeBInputs.fluSampleSize4;
    parameters.MAILISampleSize = calculatorTypeBInputs.MAILISampleSize4;
    parameters.p = calculatorTypeBInputs.p4;

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
    detectionThresholdValues.push(100.*1./4.);

    var confidenceLevelValues = [];

    for(var i=0; i<detectionThresholdValues.length; i++)
    {
        confidenceLevelValues.push(evaluateTypeB_confidenceLevel_vs_detectionThreshold.call(parameters, detectionThresholdValues[i]));
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
    y = x.map(evaluateTypeB_detectionThreshold_vs_confidenceLevel, parameters);

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

    $("#calculatorB4_chart_table_description_div").html("Enter the PHL's sample size in the box above (number of Flu+ specimens to be tested). The graph and table show the best combinations of <span class='calculatorTooltip' title='" + tooltipTypeBDetectionThreshold + "'>detection threshold</span> and <span class='calculatorTooltip' title='" + tooltipTypeBConfidenceLevel + "'>confidence level</span> achievable with " + formatTextParameter(numberWithCommas(parameters.fluSampleSize)) + " Flu+ specimens. This calculation assumes a total population of " + formatTextParameter(numberWithCommas(parameters.population)) + ". There is a trade-off between detection threshold and confidence level. Intuitively, the lower the prevalence of a rare/novel influenza, the less likely it will be detected, and vice versa. Use the mouse to view values in the graph and scroll through the table.");

    var chart = new google.visualization.LineChart(document.getElementById('calculatorB4_chart_div'));
    chart.draw(dataChart, optionsChart);

    var table = new google.visualization.Table(document.getElementById('calculatorB4_table_div'));
    table.draw(dataTable, optionsTable);

    // selection handling
    var thisObj = drawTypeBTab4;

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
                $("#calculatorB4_chart_table_report_div").html("If the laboratory tested " + formatTextParameter(numberWithCommas(parameters.fluSampleSize)) + " Flu+ specimens, the PHL can be " + formatTextParameter(Math.round(x[thisObj.selectedRow]*100.)/100. + "%") + " confident that the rare/novel influenza would be detected at a prevalence of " + formatTextParameter(yLabelMap[y[thisObj.selectedRow]]) + " at a national level.");
            }
            else
            {
                $("#calculatorB4_chart_table_report_div").html("If the laboratory tested " + formatTextParameter(numberWithCommas(parameters.fluSampleSize)) + " Flu+ specimens, the PHL can be " + formatTextParameter(Math.round(x[thisObj.selectedRow]*100.)/100. + "%") + " confident that the rare/novel influenza would be detected at a prevalence of " + formatTextParameter(yLabelMap[y[thisObj.selectedRow]]) + " (within the population under surveillance).");
            }
        }
    }

    thisObj.selectHandler([{row:thisObj.selectedRow ? thisObj.selectedRow : 0}]);
}

function calculatorTypeBInitialize()
{
    // initialize UI elements and events

    // tooltips
    $(".tooltipTypeBTotalPopulation").attr("title", tooltipTypeBTotalPopulation);
    $(".tooltipTypeBConfidenceLevel").attr("title", tooltipTypeBConfidenceLevel);
    $(".tooltipTypeBExpectedFluMAILI").attr("title", tooltipTypeBExpectedFluMAILI);
    $(".tooltipTypeBDetectionThreshold").attr("title", tooltipTypeBDetectionThreshold);
    $(".tooltipTypeBMinimumFluSampleSize").attr("title", tooltipTypeBMinimumFluSampleSize);
    $(".tooltipTypeBMinimumMAILISampleSize").attr("title", tooltipTypeBMinimumMAILISampleSize);
    $(".tooltipTypeBFluSampleSize").attr("title", tooltipTypeBFluSampleSize);
    $(".tooltipTypeBMAILISampleSize").attr("title", tooltipTypeBMAILISampleSize);
    $(".tooltipTypeBSurveillanceScale").attr("title", tooltipTypeBSurveillanceScale);

    // population options
    var populationOptions = $("#calculatorB_select_population");

    $.each(statePopulations, function(key, value) {
        populationOptions.append($("<option />").val(key).text(key));
    });

    populationOptions.append($("<option />").val("Other").text("Other"));

    // population selection
    $("#calculatorB_select_population, #calculatorB_input_population").bind('keyup mouseup change', function(e) {
        // selected state and population for that state
        var state = $("#calculatorB_select_population :selected").val();
        var population = 0;

        if(state == "Other")
        {
            // hide number label and show number input
            $("#calculatorB_select_population_number_label").hide();
            $("#calculatorB_input_population").show();

            population = $("#calculatorB_input_population").val();
        }
        else
        {
            // show number label and hide number input
            $("#calculatorB_select_population_number_label").show();
            $("#calculatorB_input_population").hide();

            population = statePopulations[state];

            // update the number label
            $("#calculatorB_select_population_number_label").html(numberWithCommas(population));
        }

        // save the value
        calculatorTypeBInputs.population = population;

        // update the surveillane scale "state" option text
        $("#calculatorB_select_surveillance_scale option:last-child").text($("#calculatorB_select_population :selected").val());

        // refresh
        calculatorTypeBRefresh();
    });

    // force an initial update event (since we have no current value for population)
    $("#calculatorB_select_population").change();

    // surveillance scale selection
    $("#calculatorB_select_surveillance_scale").bind('keyup mouseup change', function(e) {
        // make sure we have a valid value
        var value = $("#calculatorB_select_surveillance_scale :selected").val();

        if(value != "National" && value != "State")
        {
            alert("invalid surveillance scale value");
            return;
        }

        // save the value
        calculatorTypeBInputs.surveillanceScale = value;

        // refresh
        calculatorTypeBRefresh();
    });

    // force an initial update event (since we have no current value for population)
    $("#calculatorB_select_surveillance_scale").change();

    // tab 1: confidence level slider
    $("#calculatorB1_input_confidence_level_slider").slider({
        value:calculatorTypeBInputs.confidenceLevel1,
        min: 80,
        max: 99,
        step: 1,
        slide: function(event, ui) {
            $("#calculatorB1_input_confidence_level").val(ui.value + "%");
            calculatorTypeBInputs.confidenceLevel1 = parseFloat($("#calculatorB1_input_confidence_level").val());
            calculatorTypeBRefresh();
        }
    });

    $("#calculatorB1_input_confidence_level").val($("#calculatorB1_input_confidence_level_slider").slider("value") + "%");

    // tab 1: table toggle
    $("#calculatorB1_table_toggle").change(function() {
        if(this.checked)
        {
            calculatorTypeBInputs.tableMode1 = "full";
        }
        else
        {
            calculatorTypeBInputs.tableMode1 = "simple";
        }

        calculatorTypeBRefresh();
    });

    // tab 2: confidence level slider
    $("#calculatorB2_input_confidence_level_slider").slider({
        value:calculatorTypeBInputs.confidenceLevel2,
        min: 80,
        max: 99,
        step: 1,
        slide: function(event, ui) {
            $("#calculatorB2_input_confidence_level").val(ui.value + "%");
            calculatorTypeBInputs.confidenceLevel2 = parseFloat($("#calculatorB2_input_confidence_level").val());
            calculatorTypeBRefresh();
        }
    });

    $("#calculatorB2_input_confidence_level").val($("#calculatorB2_input_confidence_level_slider").slider("value") + "%");

    // tab 2: assumed prevalence slider
    $("#calculatorB2_input_p_slider").slider({
        value:calculatorTypeBInputs.p2,
        min: 1,
        max: 100,
        step: 1,
        slide: function(event, ui) {
            $("#calculatorB2_input_p").val(ui.value + "%");
            calculatorTypeBInputs.p2 = parseFloat($("#calculatorB2_input_p").val());
            calculatorTypeBRefresh();
        }
    });

    $("#calculatorB2_input_p").val($("#calculatorB2_input_p_slider").slider("value") + "%");

    // tab 2: table toggle
    $("#calculatorB2_table_toggle").change(function() {
        if(this.checked)
        {
            calculatorTypeBInputs.tableMode2 = "full";
        }
        else
        {
            calculatorTypeBInputs.tableMode2 = "simple";
        }

        calculatorTypeBRefresh();
    });

    // tab 3: confidence level slider
    $("#calculatorB3_input_confidence_level_slider").slider({
        value:calculatorTypeBInputs.confidenceLevel3,
        min: 80,
        max: 99,
        step: 1,
        slide: function(event, ui) {
            $("#calculatorB3_input_confidence_level").val(ui.value + "%");
            calculatorTypeBInputs.confidenceLevel3 = parseFloat($("#calculatorB3_input_confidence_level").val());
            calculatorTypeBRefresh();
        }
    });

    $("#calculatorB3_input_confidence_level").val($("#calculatorB3_input_confidence_level_slider").slider("value") + "%");

    // tab 3: assumed prevalence slider
    $("#calculatorB3_input_p_slider").slider({
        value:calculatorTypeBInputs.p3,
        min: 1,
        max: 100,
        step: 1,
        slide: function(event, ui) {
            $("#calculatorB3_input_p").val(ui.value + "%");
            calculatorTypeBInputs.p3 = parseFloat($("#calculatorB3_input_p").val());
            calculatorTypeBRefresh();
        }
    });

    $("#calculatorB3_input_p").val($("#calculatorB3_input_p_slider").slider("value") + "%");

    // tab 3: detection threshold slider
    $("#calculatorB3_input_detection_threshold_slider").slider({
        value:calculatorTypeBInputs.detectionThreshold3,
        min: -0.1,
        max: 5.1,
        step: 0.1,
        slide: function(event, ui) {
            // we need to remap values to capture the 1/1000, 1/700, 1/600 cases
            if(ui.value == -0.1)
            {
                ui.value = 0.1;
            }
            else if(ui.value == 0.0)
            {
                ui.value = 0.1429;
            }
            else if(ui.value == 0.1)
            {
                ui.value = 0.1667;
            }

            // we need the 1/165 case
            if(ui.value == 0.6)
            {
                ui.value = 0.606;
            }

            // and the 1/4 case
            if(ui.value == 5.1)
            {
                ui.value = 25.;
            }

            $("#calculatorB3_input_detection_threshold").val(ui.value + "% (1/" + Math.round(100. / ui.value) + ")");
            calculatorTypeBInputs.detectionThreshold3 = parseFloat($("#calculatorB3_input_detection_threshold").val());
            calculatorTypeBRefresh();
        }
    });

    $("#calculatorB3_input_detection_threshold").val($("#calculatorB3_input_detection_threshold_slider").slider("value") + "% (1/" + Math.round(100. / $("#calculatorB3_input_detection_threshold_slider").slider("value")) + ")");

    // tab 4: Flu+ sample size
    $("#calculatorB4_input_flu_sample_size").bind('keyup mouseup change', function(e) {
        calculatorTypeBInputs.fluSampleSize4 = parseFloat($("#calculatorB4_input_flu_sample_size").val());
        calculatorTypeBRefresh();
    });

    $("#calculatorB4_input_flu_sample_size").val(calculatorTypeBInputs.fluSampleSize4);

    // tab 4: MA-ILI+ sample size
    $("#calculatorB4_input_maili_sample_size").bind('keyup mouseup change', function(e) {
        calculatorTypeBInputs.MAILISampleSize4 = parseFloat($("#calculatorB4_input_maili_sample_size").val());
        calculatorTypeBRefresh();
    });

    $("#calculatorB4_input_maili_sample_size").val(calculatorTypeBInputs.MAILISampleSize4);

    // tab 4: assumed prevalence slider
    $("#calculatorB4_input_p_slider").slider({
        value:calculatorTypeBInputs.p4,
        min: 1,
        max: 100,
        step: 1,
        slide: function(event, ui) {
            $("#calculatorB4_input_p").val(ui.value + "%");
            calculatorTypeBInputs.p4 = parseFloat($("#calculatorB4_input_p").val());
            calculatorTypeBRefresh();
        }
    });

    $("#calculatorB4_input_p").val($("#calculatorB4_input_p_slider").slider("value") + "%");
}

function calculatorTypeBRefresh()
{
    if(calculatorTypeBActiveTabIndex == 0)
    {
        drawTypeBTab1();
    }
    else if(calculatorTypeBActiveTabIndex == 1)
    {
        drawTypeBTab4();
    }
    else
    {
        alert("error, unknown tab index " + calculatorTypeBActiveTabIndex);
    }
}

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// CALCULATOR C /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

var calculatorTypeCRangeMaxRareFluP = 7.;
var calculatorTypeCRareFluPBuffer = 0.5;

// calculator type C inputs
var calculatorTypeCInputs = {
    population:1,
    surveillanceScale:'State',
    rareFluP:1,
    confidenceLevel1:95,
    confidenceLevel2:95,
    p2:10,
    confidenceLevel3:95,
    p3:10,
    prevalenceThreshold3:1. + calculatorTypeCRareFluPBuffer,
    fluSampleSize4:2,
    MAILISampleSize4:0,
    p4:10
};

// tooltip text
var tooltipTypeCTotalPopulation = tooltipTypeATotalPopulation;
var tooltipTypeCSurveillanceScale = "This is the scale of the surveillance effort. The default is state, meaning that states will be able to calculate the number of specimens to test for detection of a rare/novel event at a specific threshold within their state. National level means that all states are contributing to a national surveillance effort proportional to their population size. The sample size for an individual state at the same threshold (e.g. 1/500 or 1/700) will be significantly larger than that needed for the national threshold.";
var tooltipTypeCRareFluP = "This is the estimated prevalence of the rare/novel influenza among all Flu+ specimens (Rare+/Flu+). Although the actual prevalence of the rare/novel influenza may differ from the value chosen, this approximation still provides an important baseline for determining sample sizes.";
var tooltipTypeCConfidenceLevel = "The desired confidence level for testing that the prevalence of the rare/novel influenza (Rare+/Flu+) does not exceed the prevalence threshold. The number of samples required will increase as the desired confidence level increases and as the prevalence threshold decreases. For example, determining that a rare/novel influenza has prevalence less than 2% is more difficult than determining its prevalence is less than 4%, and establishing a low prevalence with 99% confidence is more difficult than doing so with 90% confidence.";
var tooltipTypeCExpectedFluMAILI = "This is the PHL's surveillance target; the level of Flu+/MA-ILI the PHL would like to be able estimate accurately. For example, if the PHL would like to detect when Flu+/MA-ILI crosses the 10% threshold at the beginning of the influenza season, then move the slider to 10%. If, instead, the PHL plans to use the data to estimate Flu+/MA-ILI later in the season, when it is closer to 30%, then move the slider closer to 30%. Although the actual fraction of Flu+ over MA-ILI may differ from the value chosen, this approximation still provides an important baseline for determining sample sizes.";
var tooltipTypeCPrevalenceThreshold = "This is the highest value for the prevalence of the rare/novel influenza (Rare+/Flu+) that the PHL hopes to establish with the specified level of confidence.";
var tooltipTypeCPrevalenceThreshold4 = "An upper bound (highest value) for the prevalence of the rare type (Rare+/Flu+) that you hope to establish.";
var tooltipTypeCMinimumFluSampleSize = "This is the minimum number of Flu+ specimens required to confirm that the prevalence of a rare/novel influenza is below a specified prevalence threshold, with the specified level of confidence.";
var tooltipTypeCMinimumMAILISampleSize = "The minimum number of unscreened MA-ILI specimens required to confirm that the prevalence of a rare/novel influenza is below a specified prevalence threshold, with the specified level of confidence.";
var tooltipTypeCFluSampleSize = "The number of Flu+ specimens to be tested. Both Flu+ and unscreened MA-ILI specimens can be used to estimate the prevalence of rare types of influenza. However, many more unscreened MA-ILI specimens are typically required than Flu+ specimens to achieve the same statistical power, particularly when the overall prevalence of influenza (Flu+/MA-ILI) is low.";
var tooltipTypeCFluSampleSize3 = "The minimum number of Flu+ specimens required, in combination with a specified number of unscreened MA-ILI specimens, to confirm that the prevalence of a rare/novel influenza is below a specified prevalence threshold, with the specified level of confidence.";
var tooltipTypeCMAILISampleSize = "The number of unscreened MA-ILI specimens to be tested. Both Flu+ and unscreened MA-ILI specimens can be used to estimate the prevalence of rare types of influenza. However, many more unscreened MA-ILI specimens are typically required than Flu+ specimens to achieve the same statistical power, particularly when the overall prevalence of influenza (Flu+/MA-ILI) is low.";
var tooltipTypeCMAILISampleSize3 = "The minimum number of unscreened MA-ILI specimens required, in combination with a specified number of Flu+ specimens, to confirm that the prevalence of a rare/novel influenza is below a specified prevalence threshold, with the specified level of confidence.";

// active tab index
var calculatorTypeCActiveTabIndex = 0;

// helper function so we only have to define this once.
// must call this with a parameters object as "this"... use function.call(parameters, arg)
function typeC_getFluSampleSize(prevalenceThreshold)
{
    // this object contains parameter values

    var errorPercentile = 100. - this.confidenceLevel;
    var alpha = 1. - errorPercentile/100.;

    // this is the inverse cumulative distribution function
    var z = Math.sqrt(2.) * erfinv(2.*alpha - 1.);

    var p = this.rareFluP / 100.;
    var puHat = prevalenceThreshold / 100.;

    // using equation from mathematica screenshot
    var psi = 2. * ( 3.*p*p - 6.*puHat*p + 3.*puHat*puHat );
    var firstTerm = -p + 5.*p*p + p*z*z + p*p*z*z + puHat - 8.*p*puHat + 2.*z*z*puHat - 4*p*z*z*puHat + 3.*puHat*puHat;
    var secondTerm = Math.sqrt( Math.pow(p - 5.*p*p - p*z*z - p*p*z*z - puHat + 8.*p*puHat - 2.*z*z*puHat + 4.*p*z*z*puHat - 3.*puHat*puHat, 2) - 4.*(-p + 2.*p*p - 2.*p*z*z + 4*p*p*z*z + puHat - 2.*p*puHat + 2*z*z*puHat - 4.*p*z*z*puHat) * (3*p*p - 6.*p*puHat + 3.*puHat*puHat) );

    var n = 1./psi * ( firstTerm  + secondTerm );

    if(this.surveillanceScale == "National")
    {
        n = n * this.population / nationalPopulation;
    }

    return n;
}

function evaluateTypeC_FluSampleSize_vs_prevalenceThreshold(prevalenceThreshold)
{
    // this object contains parameter values

    var n = typeC_getFluSampleSize.call(this, prevalenceThreshold);

    return Math.ceil(n);
}

function evaluateTypeC_MAILISampleSize_vs_prevalenceThreshold(prevalenceThreshold)
{
    // this object contains parameter values

    var n = typeC_getFluSampleSize.call(this, prevalenceThreshold);

    // to MA-ILI+ samples
    n = n * (100. / this.p);

    return Math.ceil(n);
}

function evaluateTypeC_MAILISampleSize_vs_FluSampleSize(fluSampleSize)
{
    var idealFluSampleSize = typeC_getFluSampleSize.call(this, this.prevalenceThreshold);

    var neededAdditionalFluSampleSize = idealFluSampleSize - fluSampleSize;

    if(neededAdditionalFluSampleSize <= 0.)
    {
        return 0.;
    }

    return Math.ceil(neededAdditionalFluSampleSize * (100. / this.p));
}

function evaluateTypeC_prevalenceThreshold_vs_confidenceLevel(confidenceLevel)
{
    // this object contains parameter values
    var errorPercentile = 100. - confidenceLevel;
    var alpha = 1. - errorPercentile/100.;

    // this is the inverse cumulative distribution function
    var z = Math.sqrt(2.) * erfinv(2.*alpha - 1.);

    var p = this.rareFluP / 100.;
    var n = this.fluSampleSize + this.MAILISampleSize * (this.p / 100.);

    if(this.surveillanceScale == "National")
    {
        n = n * nationalPopulation / this.population;
    }

    var delta = (z*z/3. + 1./6.) * (1.-2.*p) / n;
    var v = p*(1.-p)/(n-1.);

    var puHat = p + delta + Math.sqrt(z*z*v + delta*delta);

    // bound puHat (prevalence threshold) to 100%
    if(puHat > 1.)
    {
        puHat = 1.;
    }

    return Math.round(puHat * 100. * 100.)/100.;
}

function drawTypeCTab1()
{
    var labels = ['Prevalence Threshold (Rare+/Flu+)', 'Minimum Flu+ Sample Size'];
    var x = [];
    var y;

    // use a parameters object to pass in any other input parameters to the evaluation function
    var parameters = new Object();
    parameters.population = calculatorTypeCInputs.population;
    parameters.surveillanceScale = calculatorTypeCInputs.surveillanceScale;
    parameters.rareFluP = calculatorTypeCInputs.rareFluP;
    parameters.confidenceLevel = calculatorTypeCInputs.confidenceLevel1;

    // range: prevalence threshhold
    var min = parameters.rareFluP + calculatorTypeCRareFluPBuffer;
    var max = calculatorTypeCRangeMaxRareFluP;
    var numValues = Math.round((max - min) / 0.1 + 1.);

    for(var i=0; i<numValues; i++)
    {
        var value = min + i/(numValues-1)*(max-min);

        // round to the nearest 100th
        x.push(Math.round(value*100)/100);
    }

    // evaluation for each x
    y = x.map(evaluateTypeC_FluSampleSize_vs_prevalenceThreshold, parameters);

    // separate DataTable objects for chart / table to allow for formatting
    var dataChart = arraysToDataTable(labels, [x, y]);
    var dataTable = dataChart.clone();

    // chart: format first column as percentage with prefix
    var formatterChart = new google.visualization.NumberFormat( {pattern: "Prevalence Threshold (Rare+/Flu+): #.##'%'"} );
    formatterChart.format(dataChart, 0);

    // table: format first column as percentage
    var formatterTable = new google.visualization.NumberFormat( {pattern: "#.##'%'"} );
    formatterTable.format(dataTable, 0);

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

    $("#calculatorC1_chart_table_description_div").html("<span class='calculatorTooltip' title='" + tooltipTypeCMinimumFluSampleSize + "'>Minimum sample size (of Flu+ specimens)</span> required to determine that the prevalence of a rare/novel influenza (Rare+/Flu+) does not exceed a specified <span class='calculatorTooltip' title='" + tooltipTypeCPrevalenceThreshold + "'>prevalence threshold (Rare+/Flu+)</span>, with a confidence of " + formatTextParameter(parameters.confidenceLevel + "%") + ". These calculations assume that the estimated prevalence of the rare/novel influenza event (Rare+/Flu+) will be close to " + formatTextParameter(parameters.rareFluP + "%") + ". Use the mouse to view values in the sample size graph and scroll through sample size table.");

    var chart = new google.visualization.LineChart(document.getElementById('calculatorC1_chart_div'));
    chart.draw(dataChart, optionsChart);

    var table = new google.visualization.Table(document.getElementById('calculatorC1_table_div'));
    table.draw(dataTable, optionsTable);

    // selection handling
    var thisObj = drawTypeCTab1;

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
                $("#calculatorC1_chart_table_report_div").html("To be " + formatTextParameter(parameters.confidenceLevel + "%") + " confident that the actual prevalence of the novel virus does not exceed " + formatTextParameter(x[thisObj.selectedRow] + "%") + " of Flu+ specimens,  the PHL must test " + formatTextParameter(numberWithCommas(y[thisObj.selectedRow])) + " Flu+ specimens at a national level.");
            }
            else
            {
                $("#calculatorC1_chart_table_report_div").html("To be " + formatTextParameter(parameters.confidenceLevel + "%") + " confident that the actual prevalence of the novel virus does not exceed " + formatTextParameter(x[thisObj.selectedRow] + "%") + " of Flu+ specimens (within the population under surveillance),  the PHL must test " + formatTextParameter(numberWithCommas(y[thisObj.selectedRow])) + " Flu+ specimens.");
            }
        }
    }

    thisObj.selectHandler([{row:thisObj.selectedRow ? thisObj.selectedRow : 0}]);
}

function drawTypeCTab2()
{
    var labels = ['Prevalence Threshold (Rare+/Flu+)', 'Minimum MA-ILI Sample Size'];
    var x = [];
    var y;

    // use a parameters object to pass in any other input parameters to the evaluation function
    var parameters = new Object();
    parameters.population = calculatorTypeCInputs.population;
    parameters.surveillanceScale = calculatorTypeCInputs.surveillanceScale;
    parameters.rareFluP = calculatorTypeCInputs.rareFluP;
    parameters.confidenceLevel = calculatorTypeCInputs.confidenceLevel2;
    parameters.p = calculatorTypeCInputs.p2;

    // range: prevalence threshhold
    var min = parameters.rareFluP + calculatorTypeCRareFluPBuffer;
    var max = calculatorTypeCRangeMaxRareFluP;
    var numValues = Math.round((max - min) / 0.1 + 1.);

    for(var i=0; i<numValues; i++)
    {
        var value = min + i/(numValues-1)*(max-min);

        // round to the nearest 100th
        x.push(Math.round(value*100)/100);
    }

    // evaluation for each x
    y = x.map(evaluateTypeC_MAILISampleSize_vs_prevalenceThreshold, parameters);

    // separate DataTable objects for chart / table to allow for formatting
    var dataChart = arraysToDataTable(labels, [x, y]);
    var dataTable = dataChart.clone();

    // chart: format first column as percentage with prefix
    var formatterChart = new google.visualization.NumberFormat( {pattern: "Prevalence Threshold (Rare+/Flu+): #.##'%'"} );
    formatterChart.format(dataChart, 0);

    // table: format first column as percentage
    var formatterTable = new google.visualization.NumberFormat( {pattern: "#.##'%'"} );
    formatterTable.format(dataTable, 0);

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

    $("#calculatorC2_chart_table_description_div").html("<span class='calculatorTooltip' title='" + tooltipTypeCMinimumMAILISampleSize + "'>Minimum sample size (of unscreened MA-ILI specimens)</span> required to determine that the prevalence of a rare/novel influenza (Rare+/Flu+) does not exceed a specified <span class='calculatorTooltip' title='" + tooltipTypeCPrevalenceThreshold + "'>prevalence threshold (Rare+/Flu+)</span>, with a confidence of " + formatTextParameter(parameters.confidenceLevel + "%") + ". These calculations assume that the estimated prevalence of the rare/novel influenza event (Rare+/Flu+) will be close to " + formatTextParameter(parameters.rareFluP + "%") + ", and the prevalence of Flu+/MA-ILI is " + formatTextParameter(parameters.p + "%") + ". Use the mouse to view values in the sample size graph and scroll through sample size table.");

    var chart = new google.visualization.LineChart(document.getElementById('calculatorC2_chart_div'));
    chart.draw(dataChart, optionsChart);

    var table = new google.visualization.Table(document.getElementById('calculatorC2_table_div'));
    table.draw(dataTable, optionsTable);

    // selection handling
    var thisObj = drawTypeCTab2;

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
                $("#calculatorC2_chart_table_report_div").html("To be " + formatTextParameter(parameters.confidenceLevel + "%") + " confident that the actual prevalence of the novel virus does not exceed " + formatTextParameter(x[thisObj.selectedRow] + "%") + " of Flu+ specimens, the PHL must test " + formatTextParameter(numberWithCommas(y[thisObj.selectedRow])) + " MA-ILI specimens at a national level.");
            }
            else
            {
                $("#calculatorC2_chart_table_report_div").html("To be " + formatTextParameter(parameters.confidenceLevel + "%") + " confident that the actual prevalence of the novel virus does not exceed " + formatTextParameter(x[thisObj.selectedRow] + "%") + " of Flu+ specimens (within the population under surveillance), the PHL must test " + formatTextParameter(numberWithCommas(y[thisObj.selectedRow])) + " MA-ILI specimens.");
            }
        }
    }

    thisObj.selectHandler([{row:thisObj.selectedRow ? thisObj.selectedRow : 0}]);
}

function drawTypeCTab3()
{
    var labels = ['Flu+ Sample Size', 'MA-ILI Sample Size'];
    var x = [];
    var y;

    // use a parameters object to pass in any other input parameters to the evaluation function
    var parameters = new Object();
    parameters.population = calculatorTypeCInputs.population;
    parameters.surveillanceScale = calculatorTypeCInputs.surveillanceScale;
    parameters.rareFluP = calculatorTypeCInputs.rareFluP;
    parameters.confidenceLevel = calculatorTypeCInputs.confidenceLevel3;
    parameters.p = calculatorTypeCInputs.p3;
    parameters.prevalenceThreshold = calculatorTypeCInputs.prevalenceThreshold3;

    // dynamically set range based on parameters
    var idealFluSampleSize = typeC_getFluSampleSize.call(parameters, parameters.prevalenceThreshold);

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
    y = x.map(evaluateTypeC_MAILISampleSize_vs_FluSampleSize, parameters);

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

    $("#calculatorC3_chart_table_description_div").html("Acceptable combinations of <span class='calculatorTooltip' title='" + tooltipTypeCFluSampleSize3 + "'>Flu+</span> and <span class='calculatorTooltip' title='" + tooltipTypeCMAILISampleSize3 + "'>unscreened MA-ILI</span> sample sizes required to detect a rare/novel influenza with prevalence (Rare+/Flu+) that has reached the detection threshold of " + formatTextParameter(parameters.prevalenceThreshold + "%") + ", with a confidence of " + formatTextParameter(parameters.confidenceLevel + "%") + ". These calculations assume a total population of " + formatTextParameter(numberWithCommas(parameters.population)) + " and a Flu+/MA-ILI prevalence of " + formatTextParameter(parameters.p + "%") + ". Many more unscreened MA-ILI specimens are typically required than Flu+ specimens to achieve the same power of detection, particularly when the overall prevalence of influenza (Flu+/MA-ILI) is low.");

    var chart = new google.visualization.LineChart(document.getElementById('calculatorC3_chart_div'));
    chart.draw(dataChart, optionsChart);

    var table = new google.visualization.Table(document.getElementById('calculatorC3_table_div'));
    table.draw(dataTable, optionsTable);

    // selection handling
    var thisObj = drawTypeCTab3;

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
                $("#calculatorC3_chart_table_report_div").html("To be " + formatTextParameter(parameters.confidenceLevel + "%") + " confident that the true prevalence of the rare/novel influenza  does not exceed " + formatTextParameter(parameters.prevalenceThreshold + "%") + " of Flu+ specimens, the PHL must test " + formatTextParameter(numberWithCommas(y[thisObj.selectedRow])) + " MA-ILI and " + formatTextParameter(numberWithCommas(x[thisObj.selectedRow])) + " Flu+ specimens (with " + formatTextParameter(parameters.p + "%") + " Flu+/MA-ILI prevalence) at a national level. This assumes an estimated prevalence of the rare type among all flu specimens (Rare+/Flu+) is " + formatTextParameter(parameters.rareFluP + "%") + ".");
            }
            else
            {
                $("#calculatorC3_chart_table_report_div").html("To be " + formatTextParameter(parameters.confidenceLevel + "%") + " confident that the true prevalence of the rare/novel influenza  does not exceed " + formatTextParameter(parameters.prevalenceThreshold + "%") + " of Flu+ specimens (within the population under surveillance), the PHL must test " + formatTextParameter(numberWithCommas(y[thisObj.selectedRow])) + " MA-ILI and " + formatTextParameter(numberWithCommas(x[thisObj.selectedRow])) + " Flu+ specimens (with " + formatTextParameter(parameters.p + "%") + " Flu+/MA-ILI prevalence). This assumes an estimated prevalence of the rare type among all flu specimens (Rare+/Flu+) is " + formatTextParameter(parameters.rareFluP + "%") + ".");
            }
        }
    }

    thisObj.selectHandler([{row:thisObj.selectedRow ? thisObj.selectedRow : 0}]);
}

function drawTypeCTab4()
{
    var labels = ['Confidence Level', 'Prevalence Threshold (Rare+/Flu+)'];
    var x = [];
    var y;

    // range: confidence level (%)
    var min = 50;
    var max = 99;
    var numValues = 30;

    for(var i=0; i<numValues; i++)
    {
        var value = min + i/(numValues-1)*(max-min);

        // round to the nearest 100th
        x.push(Math.round(value*100)/100);
    }

    // add 99.9%
    x.push(99.9);

    // use a parameters object to pass in any other input parameters to the evaluation function
    var parameters = new Object();
    parameters.population = calculatorTypeCInputs.population;
    parameters.surveillanceScale = calculatorTypeCInputs.surveillanceScale;
    parameters.rareFluP = calculatorTypeCInputs.rareFluP;
    parameters.fluSampleSize = calculatorTypeCInputs.fluSampleSize4;
    parameters.MAILISampleSize = calculatorTypeCInputs.MAILISampleSize4;
    parameters.p = calculatorTypeCInputs.p4;

    // evaluation for each x
    y = x.map(evaluateTypeC_prevalenceThreshold_vs_confidenceLevel, parameters);

    // separate DataTable objects for chart / table to allow for formatting
    var dataChart = arraysToDataTable(labels, [x, y]);
    var dataTable = dataChart.clone();

    // chart: format first column as percentage with prefix
    var formatterChart = new google.visualization.NumberFormat( {pattern: "Confidence Level: #.##'%'"} );
    formatterChart.format(dataChart, 0);

    // table: format first column as percentage
    var formatterPercentage = new google.visualization.NumberFormat( {pattern: "#.##'%'"} );
    formatterPercentage.format(dataTable, 0);

    // format y value as percentage
    formatterPercentage.format(dataChart, 1);
    formatterPercentage.format(dataTable, 1);

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

    $("#calculatorC4_chart_table_description_div").html("Enter the PHLs sample sizes in the boxes above (number of Flu+ and unscreened MA-ILI specimens to be tested). The graph and table show the best combinations of <span class='calculatorTooltip' title='" + tooltipTypeCPrevalenceThreshold4 + "'>prevalence threshold</span> and <span class='calculatorTooltip' title='" + tooltipTypeCConfidenceLevel + "'>confidence level</span> achievable with " + formatTextParameter(numberWithCommas(parameters.fluSampleSize)) + " Flu+ specimens and " + formatTextParameter(numberWithCommas(parameters.MAILISampleSize)) + " unscreened MA-ILI specimens. This calculation assumes that the prevalence of Rare+/Flu+ is close to " + formatTextParameter(parameters.rareFluP + "%") + ", and the prevalence of Flu+/MA-ILI is " + formatTextParameter(parameters.p + "%") + ". There is a trade-off between confidence level and prevalence threshold. The lower the prevalence threshold, the smaller the confidence, and vice versa. Use the mouse to view values in the graph and scroll through the table.");

    var chart = new google.visualization.LineChart(document.getElementById('calculatorC4_chart_div'));
    chart.draw(dataChart, optionsChart);

    var table = new google.visualization.Table(document.getElementById('calculatorC4_table_div'));
    table.draw(dataTable, optionsTable);

    // selection handling
    var thisObj = drawTypeCTab4;

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
                $("#calculatorC4_chart_table_report_div").html("If a combination of " + formatTextParameter(numberWithCommas(parameters.fluSampleSize)) + " Flu+ specimens and " + formatTextParameter(numberWithCommas(parameters.MAILISampleSize)) + " unscreened MA-ILI specimens were tested, and the estimated prevalence of the rare/novel influenza virus among all flu positive specimens (Rare+/Flu+) is " + formatTextParameter(parameters.rareFluP + "%") + " (within the population under surveillance),  the PHL can be " + formatTextParameter(x[thisObj.selectedRow] + "%") + " confident that the actual prevalence does not exceed " + formatTextParameter(y[thisObj.selectedRow] + "%") + " at a national level. This assumes that " + formatTextParameter(parameters.p + "%") + " of MA-ILI patients are Flu+.");
            }
            else
            {
                $("#calculatorC4_chart_table_report_div").html("If a combination of " + formatTextParameter(numberWithCommas(parameters.fluSampleSize)) + " Flu+ specimens and " + formatTextParameter(numberWithCommas(parameters.MAILISampleSize)) + " unscreened MA-ILI specimens were tested, and the estimated prevalence of the rare/novel influenza virus among all flu positive specimens (Rare+/Flu+) is " + formatTextParameter(parameters.rareFluP + "%") + ",  the PHL can be " + formatTextParameter(x[thisObj.selectedRow] + "%") + " confident that the actual prevalence does not exceed " + formatTextParameter(y[thisObj.selectedRow] + "%") + " within the population under surveillance. This assumes that " + formatTextParameter(parameters.p + "%") + " of MA-ILI patients are Flu+.");
            }
        }
    }

    thisObj.selectHandler([{row:thisObj.selectedRow ? thisObj.selectedRow : 0}]);
}

function calculatorTypeCInitialize()
{
    // initialize UI elements and events

    // tooltips
    $(".tooltipTypeCTotalPopulation").attr("title", tooltipTypeCTotalPopulation);
    $(".tooltipTypeCSurveillanceScale").attr("title", tooltipTypeCSurveillanceScale);
    $(".tooltipTypeCRareFluP").attr("title", tooltipTypeCRareFluP);
    $(".tooltipTypeCConfidenceLevel").attr("title", tooltipTypeCConfidenceLevel);
    $(".tooltipTypeCExpectedFluMAILI").attr("title", tooltipTypeCExpectedFluMAILI);
    $(".tooltipTypeCPrevalenceThreshold").attr("title", tooltipTypeCPrevalenceThreshold);
    $(".tooltipTypeCPrevalenceThreshold4").attr("title", tooltipTypeCPrevalenceThreshold4);
    $(".tooltipTypeCMinimumFluSampleSize").attr("title", tooltipTypeCMinimumFluSampleSize);
    $(".tooltipTypeCMinimumMAILISampleSize").attr("title", tooltipTypeCMinimumMAILISampleSize);
    $(".tooltipTypeCFluSampleSize").attr("title", tooltipTypeCFluSampleSize);
    $(".tooltipTypeCFluSampleSize3").attr("title", tooltipTypeCFluSampleSize3);
    $(".tooltipTypeCMAILISampleSize").attr("title", tooltipTypeCMAILISampleSize);
    $(".tooltipTypeCMAILISampleSize3").attr("title", tooltipTypeCMAILISampleSize3);

    // population options
    var populationOptions = $("#calculatorC_select_population");

    $.each(statePopulations, function(key, value) {
        populationOptions.append($("<option />").val(key).text(key));
    });

    populationOptions.append($("<option />").val("Other").text("Other"));

    // population selection
    $("#calculatorC_select_population, #calculatorC_input_population").bind('keyup mouseup change', function(e) {
        // selected state and population for that state
        var state = $("#calculatorC_select_population :selected").val();
        var population = 0;

        if(state == "Other")
        {
            // hide number label and show number input
            $("#calculatorC_select_population_number_label").hide();
            $("#calculatorC_input_population").show();

            population = $("#calculatorC_input_population").val();
        }
        else
        {
            // show number label and hide number input
            $("#calculatorC_select_population_number_label").show();
            $("#calculatorC_input_population").hide();

            population = statePopulations[state];

            // update the number label
            $("#calculatorC_select_population_number_label").html(numberWithCommas(population));
        }

        // save the value
        calculatorTypeCInputs.population = population;

        // update the surveillane scale "state" option text
        $("#calculatorC_select_surveillance_scale option:last-child").text($("#calculatorC_select_population :selected").val());

        // refresh
        calculatorTypeCRefresh();
    });

    // force an initial update event (since we have no current value for population)
    $("#calculatorC_select_population").change();

    // surveillance scale selection
    $("#calculatorC_select_surveillance_scale").bind('keyup mouseup change', function(e) {
        // make sure we have a valid value
        var value = $("#calculatorC_select_surveillance_scale :selected").val();

        if(value != "National" && value != "State")
        {
            alert("invalid surveillance scale value");
            return;
        }

        // save the value
        calculatorTypeCInputs.surveillanceScale = value;

        // refresh
        calculatorTypeCRefresh();
    });

    // force an initial update event (since we have no current value for population)
    $("#calculatorC_select_surveillance_scale").change();

    // expected Rare+/Flu+ slider
    $("#calculatorC_input_rare_flu_p_slider").slider({
        value:calculatorTypeCInputs.rareFluP,
        min: 0.2,
        max: 5,
        step: 0.1,
        slide: function(event, ui) {
            $("#calculatorC_input_rare_flu_p").val(ui.value + "%");
            calculatorTypeCInputs.rareFluP = parseFloat($("#calculatorC_input_rare_flu_p").val());

            // other sliders use this value as a minimum
            var newMin = calculatorTypeCInputs.rareFluP + calculatorTypeCRareFluPBuffer;

            $("#calculatorC3_input_prevalence_threshold_slider").slider("option", "min", newMin);

            if($("#calculatorC3_input_prevalence_threshold_slider").slider("value") <= newMin)
            {
                $("#calculatorC3_input_prevalence_threshold_slider").slider("value", newMin);
            }

            calculatorTypeCRefresh();
        }
    });

    $("#calculatorC_input_rare_flu_p").val($("#calculatorC_input_rare_flu_p_slider").slider("value") + "%");

    // tab 1: confidence level slider
    $("#calculatorC1_input_confidence_level_slider").slider({
        value:calculatorTypeCInputs.confidenceLevel1,
        min: 80,
        max: 99,
        step: 1,
        slide: function(event, ui) {
            $("#calculatorC1_input_confidence_level").val(ui.value + "%");
            calculatorTypeCInputs.confidenceLevel1 = parseFloat($("#calculatorC1_input_confidence_level").val());
            calculatorTypeCRefresh();
        }
    });

    $("#calculatorC1_input_confidence_level").val($("#calculatorC1_input_confidence_level_slider").slider("value") + "%");

    // tab 2: confidence level slider
    $("#calculatorC2_input_confidence_level_slider").slider({
        value:calculatorTypeCInputs.confidenceLevel2,
        min: 80,
        max: 99,
        step: 1,
        slide: function(event, ui) {
            $("#calculatorC2_input_confidence_level").val(ui.value + "%");
            calculatorTypeCInputs.confidenceLevel2 = parseFloat($("#calculatorC2_input_confidence_level").val());
            calculatorTypeCRefresh();
        }
    });

    $("#calculatorC2_input_confidence_level").val($("#calculatorC2_input_confidence_level_slider").slider("value") + "%");

    // tab 2: assumed prevalence slider
    $("#calculatorC2_input_p_slider").slider({
        value:calculatorTypeCInputs.p2,
        min: 1,
        max: 100,
        step: 1,
        slide: function(event, ui) {
            $("#calculatorC2_input_p").val(ui.value + "%");
            calculatorTypeCInputs.p2 = parseFloat($("#calculatorC2_input_p").val());
            calculatorTypeCRefresh();
        }
    });

    $("#calculatorC2_input_p").val($("#calculatorC2_input_p_slider").slider("value") + "%");

    // tab 3: confidence level slider
    $("#calculatorC3_input_confidence_level_slider").slider({
        value:calculatorTypeCInputs.confidenceLevel3,
        min: 80,
        max: 99,
        step: 1,
        slide: function(event, ui) {
            $("#calculatorC3_input_confidence_level").val(ui.value + "%");
            calculatorTypeCInputs.confidenceLevel3 = parseFloat($("#calculatorC3_input_confidence_level").val());
            calculatorTypeCRefresh();
        }
    });

    $("#calculatorC3_input_confidence_level").val($("#calculatorC3_input_confidence_level_slider").slider("value") + "%");

    // tab 3: assumed prevalence slider
    $("#calculatorC3_input_p_slider").slider({
        value:calculatorTypeCInputs.p3,
        min: 1,
        max: 100,
        step: 1,
        slide: function(event, ui) {
            $("#calculatorC3_input_p").val(ui.value + "%");
            calculatorTypeCInputs.p3 = parseFloat($("#calculatorC3_input_p").val());
            calculatorTypeCRefresh();
        }
    });

    $("#calculatorC3_input_p").val($("#calculatorC3_input_p_slider").slider("value") + "%");

    // tab 3: prevalence threshold slider
    $("#calculatorC3_input_prevalence_threshold_slider").slider({
        value:calculatorTypeCInputs.prevalenceThreshold3,
        min: 1. + calculatorTypeCRareFluPBuffer,
        max: calculatorTypeCRangeMaxRareFluP,
        step: 0.1,
        slide: function(event, ui) {
            $("#calculatorC3_input_prevalence_threshold").val(ui.value + "%");
            calculatorTypeCInputs.prevalenceThreshold3 = parseFloat($("#calculatorC3_input_prevalence_threshold").val());
            calculatorTypeCRefresh();
        },
        change: function(event, ui) {
            // also need change() to catch .value() changes
            $("#calculatorC3_input_prevalence_threshold").val(ui.value + "%");
            calculatorTypeCInputs.prevalenceThreshold3 = parseFloat($("#calculatorC3_input_prevalence_threshold").val());
            calculatorTypeCRefresh();
        }
    });

    $("#calculatorC3_input_prevalence_threshold").val($("#calculatorC3_input_prevalence_threshold_slider").slider("value") + "%");

    // tab 4: Flu+ sample size
    $("#calculatorC4_input_flu_sample_size").bind('keyup mouseup change', function(e) {
        calculatorTypeCInputs.fluSampleSize4 = parseFloat($("#calculatorC4_input_flu_sample_size").val());
        calculatorTypeCRefresh();
    });

    $("#calculatorC4_input_flu_sample_size").val(calculatorTypeCInputs.fluSampleSize4);

    // tab 4: MA-ILI+ sample size
    $("#calculatorC4_input_maili_sample_size").bind('keyup mouseup change', function(e) {
        calculatorTypeCInputs.MAILISampleSize4 = parseFloat($("#calculatorC4_input_maili_sample_size").val());
        calculatorTypeCRefresh();
    });

    $("#calculatorC4_input_maili_sample_size").val(calculatorTypeCInputs.MAILISampleSize4);

    // tab 4: assumed prevalence slider
    $("#calculatorC4_input_p_slider").slider({
        value:calculatorTypeCInputs.p4,
        min: 1,
        max: 100,
        step: 1,
        slide: function(event, ui) {
            $("#calculatorC4_input_p").val(ui.value + "%");
            calculatorTypeCInputs.p4 = parseFloat($("#calculatorC4_input_p").val());
            calculatorTypeCRefresh();
        }
    });

    $("#calculatorC4_input_p").val($("#calculatorC4_input_p_slider").slider("value") + "%");
}

function calculatorTypeCRefresh()
{
    if(calculatorTypeCActiveTabIndex == 0)
    {
        drawTypeCTab1();
    }
    else if(calculatorTypeCActiveTabIndex == 1)
    {
        drawTypeCTab2();
    }
    else if(calculatorTypeCActiveTabIndex == 2)
    {
        drawTypeCTab3();
    }
    else if(calculatorTypeCActiveTabIndex == 3)
    {
        drawTypeCTab4();
    }
    else
    {
        alert("error, unknown tab index " + calculatorTypeCActiveTabIndex);
    }
}

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// CALCULATOR A /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// calculator type A inputs
var calculatorTypeAInputs = {
    population:1,
    p:10,
    confidenceLevel:95,
    sampleSize:100
};

// tooltip text
var tooltipTypeATotalPopulation = "The total population size under surveillance. For labs representing entire states, simply select the name of the state. This will automatically provide the 2012 census projection of the state population. For labs collecting specimens from subsets of state populations or populations that cross multiple states, choose 'Other' and enter the estimated size of the entire population under consideration. The calculator uses population size to estimate the weekly number of MA-ILI cases in the PHL's jurisdiction.";

var tooltipTypeAExpectedFluMAILI = "This is the PHL's surveillance target; the level of Flu+/MA-ILI the PHL would like to be able estimate accurately. For example, if the PHL would like to detect when Flu+/MA-ILI crosses the 10% threshold at the beginning of the influenza season, then move the slider to 10%. If, instead, the PHL plans to use the data to estimate Flu+/MA-ILI later in the season, when it is closer to 30%, then move the slider closer to 30%. Although the actual fraction of Flu+ over MA-ILI may differ from the value chosen, this approximation still provides an important baseline for determining sample sizes.";

var tooltipTypeAMinimumSampleSize = "The minimum number of unscreened samples to collect from the MA-ILI population to produce sample size estimates of Flu+/MA-ILI with a desired confidence level and margin of error.";

var tooltipTypeAMarginOfError = "This is the amount of error that can be tolerated. When using laboratory samples to estimate Flu+/MA-ILI, the PHL will calculate an expected value plus or minus a margin of error. For example, the PHL might calculate 10% plus or minus 2%, which means that the Flu+/MA-ILI estimate will fall somewhere between 8% to 12%. The smaller the margin of error, the more precise the PHL estimate of Flu+/MA-ILI. Intuitively, high confidence levels and small margins of error require many samples, while low confidence levels or large margins of error require fewer samples.";

var tooltipTypeAConfidenceLevel = "This is the amount of certainty that the true prevalence is equivalent to the estimated prevalence.   The higher the confidence level, the more confident the PHL can be that the true level of Flu+/MA-ILI in the PHLs population falls within the estimated level of Flu+/MA-ILI. Intuitively, high confidence levels and small margins of error require many samples, while low confidence levels or large margins of error require fewer samples.";

var tooltipTypeASampleSize = "The number of unscreened samples collected from the medically attended influenza-like-illness population (MA-ILI).";

// active tab index
var calculatorTypeAActiveTabIndex = 0;

function evaluateTypeA_SampleSize_vs_epsilon(epsilon)
{
    // this object contains parameter values

    var errorPercentile = 100. - this.confidenceLevel;
    var alpha = 1. - 0.5*errorPercentile/100.;

    // this is the inverse cumulative distribution function
    var z = Math.sqrt(2.) * erfinv(2.*alpha - 1.);

    var episilonDecimal = epsilon / 100.;
    var pDecimal = this.p / 100.;

    var sampleSize = (pDecimal*z*z - pDecimal*pDecimal*z*z) / (episilonDecimal*episilonDecimal);

    // finite population correction
    var populationILI = this.population * (populationToILIFactorBase * inputMAILIPercentage);
    var sampleSizeStar = (sampleSize * populationILI) / (sampleSize + populationILI - 1.);

    return Math.round(sampleSizeStar);
}

function evaluateTypeA_ConfidenceLevel_vs_epsilon(epsilon)
{
    // this object contains parameter values
    var sampleSizeStar = this.sampleSize;
    var p = this.p / 100.;

    var epsilonDecimal = epsilon / 100.;

    // finite population correction (inverse)
    var populationILI = this.population * (populationToILIFactorBase * inputMAILIPercentage);

    // equations not valid when we have more samples than our population
    // return 100% confidence in this case
    if(sampleSizeStar >= populationILI)
    {
        return 100.;
    }

    var sampleSize = sampleSizeStar*(populationILI - 1.) / (populationILI - sampleSizeStar);

    return Math.round(100. * erf( Math.sqrt(sampleSize*epsilonDecimal*epsilonDecimal/(2.*(p-p*p))) ));
}

function evaluateTypeA_epsilon_vs_ConfidenceLevel(confidenceLevel)
{
    // this object contains parameter values
    var sampleSizeStar = this.sampleSize;
    var p = this.p / 100.;

    // finite population correction (inverse)
    var populationILI = this.population * (populationToILIFactorBase * inputMAILIPercentage);

    // equations not valid when we have more samples than our population
    // return 0% margin of error in this case
    if(sampleSizeStar >= populationILI)
    {
        return 0.;
    }

    var sampleSize = sampleSizeStar*(populationILI - 1.) / (populationILI - sampleSizeStar);

    return 100. * Math.sqrt(2.*(p-p*p) / sampleSize) * erfinv(confidenceLevel/100.);
}

// draw chart and table given labels, x series, y series
function drawTypeATab1()
{
    var labels = ['Margin of Error', 'Minimum Sample Size'];
    var x = [];
    var y;

    // range: epsilon (0.25% increments)
    var min = 1;
    var max = 10;
    var numValues = 37;

    for(var i=0; i<numValues; i++)
    {
        var value = min + i/(numValues-1)*(max-min);

        // round to the nearest 100th
        x.push(Math.round(value*100)/100);
    }

    // use a parameters object to pass in any other input parameters to the evaluation function
    var parameters = new Object();
    parameters.population = calculatorTypeAInputs.population;
    parameters.p = calculatorTypeAInputs.p;
    parameters.confidenceLevel = calculatorTypeAInputs.confidenceLevel;

    // evaluation for each x
    y = x.map(evaluateTypeA_SampleSize_vs_epsilon, parameters);

    // separate DataTable objects for chart / table to allow for formatting
    var dataChart = arraysToDataTable(labels, [x, y]);
    var dataTable = dataChart.clone();

    // chart: format first column as percentage with prefix
    var formatterChart = new google.visualization.NumberFormat( {pattern: "Margin of Error: #.##'%'"} );
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

    $("#calculatorA_chart_table_description_div").html("The graph, table, and output language below describe the <span class='calculatorTooltip' title='" + tooltipTypeAMinimumSampleSize + "'>minimum sample size</span> (of unscreened MA-ILI specimens) needed to estimate the fraction of Flu+/MA-ILI with a specified <span class='calculatorTooltip' title='" + tooltipTypeAMarginOfError + "'>margin of error</span> and confidence level of " + formatTextParameter(parameters.confidenceLevel + "%") + ". This calculation is based on the estimated inputs provided above and assumes that the estimated level of Flu+/MA-ILI will be close to " + formatTextParameter(parameters.p + "%") + " and the total population under surveillance is " + formatTextParameter(numberWithCommas(parameters.population)) + ". Use the mouse to view values in the sample size graph and scroll through sample size table.");

    var chart = new google.visualization.LineChart(document.getElementById('calculatorA_chart_div'));
    chart.draw(dataChart, optionsChart);

    var table = new google.visualization.Table(document.getElementById('calculatorA_table_div'));
    table.draw(dataTable, optionsTable);

    // selection handling
    var thisObj = drawTypeATab1;

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

            $("#calculatorA_chart_table_report_div").html("A sample size of " + formatTextParameter(numberWithCommas(y[thisObj.selectedRow])) + " unscreened MA-ILI specimens is needed in order to be " + formatTextParameter(parameters.confidenceLevel + "%") + " confident that the true prevalence of Flu+/MA-ILI is " + formatTextParameter(parameters.p + "%") + " (+/- " + formatTextParameter(x[thisObj.selectedRow] + "%") + ").");
        }
    }

    thisObj.selectHandler([{row:thisObj.selectedRow ? thisObj.selectedRow : 0}]);
}

function drawTypeATab2()
{
    var epsilons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var confidenceLevels = [99, 95, 90, 85, 80, 75, 70];
    var confidenceLevelsLabels = ['99%', '95%', '90%', '85%', '80%', '75%', '70%'];

    var dataArrays = []

    dataArrays[0] = epsilons;

    for(var c=0; c<confidenceLevels.length; c++)
    {
        // use a parameters object to pass in any other input parameters to the evaluation function
        var parameters = new Object();
        parameters.population = calculatorTypeAInputs.population;
        parameters.p = calculatorTypeAInputs.p;
        parameters.confidenceLevel = confidenceLevels[c];

        dataArray = epsilons.map(evaluateTypeA_SampleSize_vs_epsilon, parameters);

        dataArrays[c+1] = dataArray;
    }

    var columnLabels = ['Margin of Error / Confidence Level'].concat(confidenceLevelsLabels);

    var data = arraysToDataTable(columnLabels, dataArrays);

    // format first column as percentage
    var formatter = new google.visualization.NumberFormat( {pattern: "#.##'%'"} );
    formatter.format(data, 0);

    $("#calculatorA_big_table_description_div").html("<p>Instructions: To change the output calculations in the text below the table, click on the desired row on the table.</p> <span class='calculatorTooltip' title='" + tooltipTypeAMinimumSampleSize + "'>Minimum sample sizes</span> (of unscreened MA-ILI specimens) needed to estimate the fraction of Flu+/MA-ILI with a specified <span class='calculatorTooltip' title='" + tooltipTypeAMarginOfError + "'>margin of error</span> (rows) and <span class='calculatorTooltip' title='" + tooltipTypeAConfidenceLevel + "'>confidence level</span> (columns). This calculation assumes that the estimated level of Flu+/MA-ILI will be close to " + formatTextParameter(calculatorTypeAInputs.p + "%") + " and the total population under surveillance is " + formatTextParameter(numberWithCommas(calculatorTypeAInputs.population)) + ".");

    var table = new google.visualization.Table(document.getElementById('calculatorA_big_table_div'));
    table.draw(data);

    // selection handling
    var thisObj = drawTypeATab2;

    google.visualization.events.addListener(table, 'select', tableSelectHandler);

    function tableSelectHandler(e) { thisObj.selectHandler(table.getSelection()); }

    thisObj.selectHandler = function(selectionArray)
    {
        if(selectionArray.length > 0 && selectionArray[0].row != null)
        {
            thisObj.selectedRow = selectionArray[0].row;

            // make sure row is valid
            if(thisObj.selectedRow >= epsilons.length)
            {
                thisObj.selectedRow = 0;
            }

            // form new array with only this entry (to avoid multiple selections)
            var newSelectionArray = [{row:selectionArray[0].row}];

            // select element in chart and table
            table.setSelection(newSelectionArray);

            $("#calculatorA_big_table_report_div").html("This table describes the minimum sample size (of unscreened MA-ILI specimens) that are required to estimate the fraction of Flu+/MA-ILI with a specified margin of  error and confidence level. This assumes that Flu+/MA-ILI is approximately " + formatTextParameter(parameters.p + "%") + ". For example, at least " + formatTextParameter(numberWithCommas(dataArrays[1][thisObj.selectedRow])) + " MA-ILI specimens are required to estimate the actual Flu+/MA-ILI fraction with 99% confidence within a margin of error of +/-" + formatTextParameter(epsilons[thisObj.selectedRow] + "%") + ", but only " + formatTextParameter(numberWithCommas(dataArrays[3][thisObj.selectedRow])) + " specimens are needed for 90% confidence within a margin of error of +/-" + formatTextParameter(epsilons[thisObj.selectedRow] + "%") + ".");
        }
    }

    thisObj.selectHandler([{row:thisObj.selectedRow ? thisObj.selectedRow : 0}]);
}

// draw chart and table given labels, x series, y series
function drawTypeATab3()
{
    var labels = ['Confidence Level', 'Margin of Error'];
    var x = [];
    var y;

    // use a parameters object to pass in any other input parameters to the evaluation function
    var parameters = new Object();
    parameters.population = calculatorTypeAInputs.population;
    parameters.p = calculatorTypeAInputs.p;
    parameters.sampleSize = calculatorTypeAInputs.sampleSize;

    var min = 70;
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

    // evaluation for each x
    y = x.map(evaluateTypeA_epsilon_vs_ConfidenceLevel, parameters);

    // separate DataTable objects for chart / table to allow for formatting
    var dataChart = arraysToDataTable(labels, [x, y]);
    var dataTable = dataChart.clone();

    // format columns of chart and table, using confidence level prefix as needed
    var formatterConfidenceLevel = new google.visualization.NumberFormat( {pattern: "Confidence Level: #.##'%'"} );
    var formatterPercentage = new google.visualization.NumberFormat( {pattern: "#.##'%'"} );

    formatterConfidenceLevel.format(dataChart, 0);
    formatterPercentage.format(dataChart, 1);

    formatterPercentage.format(dataTable, 0);
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

    $("#calculatorA_chart_table_2_description_div").html("Enter the PHL's sample size in the box above (number of unscreened MA-ILI specimens to be tested). The graph and table show the best combinations of <span class='calculatorTooltip' title='" + tooltipTypeAMarginOfError + "'>margin of error</span> and <span class='calculatorTooltip' title='" + tooltipTypeAConfidenceLevel + "'>confidence level</span> achievable with " + formatTextParameter(numberWithCommas(parameters.sampleSize)) + " unscreened MA-ILI specimens. This calculation assumes that the estimated level of Flu+/MA-ILI will be close to " + formatTextParameter(parameters.p + "%") + " and the total population under surveillance is " + formatTextParameter(numberWithCommas(parameters.population)) + ".");

    var chart = new google.visualization.LineChart(document.getElementById('calculatorA_chart_2_div'));
    chart.draw(dataChart, optionsChart);

    var table = new google.visualization.Table(document.getElementById('calculatorA_table_2_div'));
    table.draw(dataTable, optionsTable);

    // selection handling
    var thisObj = drawTypeATab3;

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

            $("#calculatorA_chart_table_2_report_div").html("If " + formatTextParameter(numberWithCommas(parameters.sampleSize)) + "  MA-ILI specimens were tested and the estimated prevalence is " + formatTextParameter(parameters.p + "%") + ", the PHL can be " + formatTextParameter(x[thisObj.selectedRow] + "%") + " (+/- " + formatTextParameter(Math.round(y[thisObj.selectedRow]*100.)/100. + "%") + ") confident that the true prevalence is " + formatTextParameter(parameters.p + "%") + ".");
        }
    }

    thisObj.selectHandler([{row:thisObj.selectedRow ? thisObj.selectedRow : 0}]);
}

function calculatorTypeAInitialize()
{
    // initialize UI elements and events

    // tooltips
    $(".tooltipTypeATotalPopulation").attr("title", tooltipTypeATotalPopulation);
    $(".tooltipTypeAExpectedFluMAILI").attr("title", tooltipTypeAExpectedFluMAILI);
    $(".tooltipTypeAConfidenceLevel").attr("title", tooltipTypeAConfidenceLevel);
    $(".tooltipTypeASampleSize").attr("title", tooltipTypeASampleSize);

    // population options
    var populationOptions = $("#calculatorA_select_population");

    $.each(statePopulations, function(key, value) {
        populationOptions.append($("<option />").val(key).text(key));
    });

    populationOptions.append($("<option />").val("Other").text("Other"));

    // population selection
    $("#calculatorA_select_population, #calculatorA_input_population").bind('keyup mouseup change', function(e) {
        // selected state and population for that state
        var state = $("#calculatorA_select_population :selected").val();
        var population = 0;

        if(state == "Other")
        {
            // hide number label and show number input
            $("#calculatorA_select_population_number_label").hide();
            $("#calculatorA_input_population").show();

            population = $("#calculatorA_input_population").val();
        }
        else
        {
            // show number label and hide number input
            $("#calculatorA_select_population_number_label").show();
            $("#calculatorA_input_population").hide();

            population = statePopulations[state];

            // update the number label
            $("#calculatorA_select_population_number_label").html(numberWithCommas(population));
        }

        // save the value
        calculatorTypeAInputs.population = population;

        // refresh
        calculatorTypeARefresh();
    });

    // force an initial update event (since we have no current value for population)
    $("#calculatorA_select_population").change();


    // assumed prevalence slider
    // the maximum here is 99.9% since at 100% the required sample size is 0
    // note the range is [0.1, 1.0] by 0.1 increments; [1.0, 99.0] by 1.0 increments, [99.0, 99.9] by 0.1 increments
    $("#calculatorA_input_p_slider").slider({
        value:calculatorTypeAInputs.p,
        min: -8,
        max: 108,
        step: 1,
        slide: function(event, ui) {
            var value = parseFloat(ui.value);

            // transform values outside of [1.0, 99.0] for 0.1 increments
            if(value < 1.0)
                value = 1.0 + (value - 1.0) / 10.0;
            else if(value > 99.0)
                value = 99.0 + (value - 99.0) / 10.0;

            // round to the nearest tenth to avoid floating point math errors
            value = Math.round(value*10) / 10.0;

            $("#calculatorA_input_p").val(value + "%");
            calculatorTypeAInputs.p = parseFloat($("#calculatorA_input_p").val());
            calculatorTypeARefresh();
        }
    });

    $("#calculatorA_input_p").val($("#calculatorA_input_p_slider").slider("value") + "%");


    // confidence level slider
    $("#calculatorA_input_confidence_level_slider").slider({
        value:calculatorTypeAInputs.confidenceLevel,
        min: 80,
        max: 99,
        step: 1,
        slide: function(event, ui) {
            $("#calculatorA_input_confidence_level").val(ui.value + "%");
            calculatorTypeAInputs.confidenceLevel = parseFloat($("#calculatorA_input_confidence_level").val());
            calculatorTypeARefresh();
        }
    });

    $("#calculatorA_input_confidence_level").val($("#calculatorA_input_confidence_level_slider").slider("value") + "%");


    // num samples input
    $("#calculatorA_input_sample_size").bind('keyup mouseup change', function(e) {
        calculatorTypeAInputs.sampleSize = parseFloat($("#calculatorA_input_sample_size").val());
        calculatorTypeARefresh();
    });

    $("#calculatorA_input_sample_size").val(calculatorTypeAInputs.sampleSize);
}

function calculatorTypeARefresh()
{
    if(calculatorTypeAActiveTabIndex == 0)
    {
        drawTypeATab1();
    }
    else if(calculatorTypeAActiveTabIndex == 1)
    {
        drawTypeATab2();
    }
    else if(calculatorTypeAActiveTabIndex == 2)
    {
        drawTypeATab3();
    }
    else
    {
        alert("error, unknown tab index " + calculatorTypeAActiveTabIndex);
    }
}

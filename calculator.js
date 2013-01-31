
// load required google visualization packages
google.load("visualization", "1", {packages:["corechart", "table"]});

// set the on load callback
google.setOnLoadCallback(onLoad);

// calculator type A inputs: population, assumed prevalence p (%), confidence level (%)
var calculatorTypeAInputs = {
    population:1,
    p:10,
    confidenceLevel:95
};

// data
var statePopulations = {
        "texas": 26059203,
        "oklahoma": 3814820
    };

// return number with commas added
// from: http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function numberWithCommas(x)
{
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

// from http://stackoverflow.com/questions/12556685/is-there-a-javascript-implementation-of-the-inverse-error-function-akin-to-matl
function erfinv(x)
{
    var z;
    var a = 0.147;
    var the_sign_of_x;
    if(0 == x)
    {
        the_sign_of_x = 0;
    }
    else if(x > 0)
    {
        the_sign_of_x = 1;
    }
    else
    {
        the_sign_of_x = -1;
    }

    if(0 != x)
    {
        var ln_1minus_x_sqrd = Math.log(1-x*x);
        var ln_1minusxx_by_a = ln_1minus_x_sqrd / a;
        var ln_1minusxx_by_2 = ln_1minus_x_sqrd / 2;
        var ln_etc_by2_plus2 = ln_1minusxx_by_2 + (2/(Math.PI * a));
        var first_sqrt = Math.sqrt((ln_etc_by2_plus2*ln_etc_by2_plus2)-ln_1minusxx_by_a);
        var second_sqrt = Math.sqrt(first_sqrt - ln_etc_by2_plus2);
        z = second_sqrt * the_sign_of_x;
    }
    else
    {
        // x is zero
        z = 0;
    }

    return z;
}

// converts labels and array data to Google Data Table
function arraysToDataTable(labels, arrays)
{
    var dataTableArray = [ labels ];

    // assume each array in arrays is the same length and that we have a label for each array
    for(var i=0; i<arrays[0].length; i++)
    {
        var row = [];

        for(var j=0; j<labels.length; j++)
        {
            row.push(arrays[j][i]);
        }

        dataTableArray.push(row);
    }

    return google.visualization.arrayToDataTable(dataTableArray);
}

function evaluateTypeA_n_vs_epsilon(epsilon)
{
    // this object contains parameter values

    var errorPercentile = 100. - this.confidenceLevel;
    var alpha = 1. - 0.5*errorPercentile/100.;

    // this is the inverse cumulative distribution function
    var z = Math.sqrt(2.) * erfinv(2.*alpha - 1.)

    var episilonDecimal = epsilon / 100.;
    var pDecimal = this.p / 100.;

    var n = (pDecimal*z*z - pDecimal*pDecimal*z*z) / (episilonDecimal*episilonDecimal);

    return Math.round(n);
}

// draw chart and table given labels, x series, y series
function drawTypeAChartAndTable()
{
    var labels = ['Margin of Error', 'Target Number of Samples'];
    var x = [];
    var y;

    // range: epsilon
    var min = 1;
    var max = 10;
    var numValues = 91;

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
    y = x.map(evaluateTypeA_n_vs_epsilon, parameters);

    var data = arraysToDataTable(labels, [x, y]);

    // format first column as percentage
    var formatter = new google.visualization.NumberFormat( {pattern: "#.##'%'"} );
    formatter.format(data, 0);

    var options = {
        title: 'Target Number of Samples',
        hAxis : { title: labels[0], format: "#.##'%'" },
        vAxis : { title: labels[1] },
        legend : { position: 'none' }
    };

    $("#calculatorA_chart_table_description_div").html("The chart and table below are shown for a population of " + numberWithCommas(parameters.population) + ", assumed prevalance of " + parameters.p + "% and a confidence level of " + parameters.confidenceLevel + "%. More explanation text here. More explanation text here. More explanation text here. More explanation text here. More explanation text here.");

    var chart = new google.visualization.LineChart(document.getElementById('calculatorA_chart_div'));
    chart.draw(data, options);

    var table = new google.visualization.Table(document.getElementById('calculatorA_table_div'));
    table.draw(data);
}

function drawTypeABigTable()
{
    var epsilons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var confidenceLevels = [95, 90, 85, 80, 75, 70];
    var confidenceLevelsLabels = ['95%', '90%', '85%', '80%', '75%', '70%'];

    var dataArrays = []

    dataArrays[0] = epsilons;

    for(var c=0; c<confidenceLevels.length; c++)
    {
        // use a parameters object to pass in any other input parameters to the evaluation function
        var parameters = new Object();
        parameters.population = calculatorTypeAInputs.population;
        parameters.p = calculatorTypeAInputs.p;
        parameters.confidenceLevel = confidenceLevels[c];

        dataArray = epsilons.map(evaluateTypeA_n_vs_epsilon, parameters);

        dataArrays[c+1] = dataArray;
    }

    var columnLabels = ['Margin of Error / Confidence'].concat(confidenceLevelsLabels);

    var data = arraysToDataTable(columnLabels, dataArrays);

    // format first column as percentage
    var formatter = new google.visualization.NumberFormat( {pattern: "#.##'%'"} );
    formatter.format(data, 0);

    $("#calculatorA_big_table_description_div").html("The table below is shown for a population of " + numberWithCommas(calculatorTypeAInputs.population) + " and assumed prevalance of " + calculatorTypeAInputs.p + "%. More explanation text here. More explanation text here. More explanation text here. More explanation text here. More explanation text here.");

    var table = new google.visualization.Table(document.getElementById('calculatorA_big_table_div'));
    table.draw(data);
}

function calculatorTypeAInitialize()
{
    // initialize UI elements and events

    // population selection
    $("#calculatorA_select_population, #calculatorA_input_population").change(function() {
        // selected state and population for that state
        var state = $("#calculatorA_select_population :selected").val();
        var population = 0;

        if(state == "other")
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
    $("#calculatorA_input_p_slider").slider({
        value:calculatorTypeAInputs.p,
        min: 1,
        max: 30,
        step: 1,
        slide: function(event, ui) {
            $("#calculatorA_input_p").val(ui.value + "%");
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
}

function calculatorTypeARefresh()
{
    drawTypeAChartAndTable();
    drawTypeABigTable();
}

function onLoad()
{
    // create accordion
    $("#calculator_accordion").accordion({ heightStyle: "content" });

    // create calculator A tabs; trigger a refresh on activation so charts are correctly sized
    $("#calculatorA_tabs").tabs({ activate: function(event, ui) { calculatorTypeARefresh(); } });

    // create tooltips
    $(document).tooltip();

    // initialize and refresh calculator A
    calculatorTypeAInitialize();
    calculatorTypeARefresh();
}
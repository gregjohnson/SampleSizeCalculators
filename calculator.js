
google.load("visualization", "1", {packages:["corechart", "table"]});

google.setOnLoadCallback(onLoad);


// calculator type
var calculatorType = 'a';

// input: assumed prevalence p (%)
var calculatorInputP = 10;

// input: confidence level (%)
var calculatorInputConfidenceLevel = 95;

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

// draw chart and table given labels, x series, y series
function drawChartAndTable(labels, x, y)
{
    var data = arraysToDataTable(labels, [x, y]);

    // format first column as percentage
    var formatter = new google.visualization.NumberFormat( {pattern: "#.##'%'"} );
    formatter.format(data, 0);

    var options = {
        title: labels[1] + ' vs ' + labels[0],
        hAxis : { title: labels[0], format: "#.##'%'" },
        vAxis : { title: labels[1] },
        legend : { position: 'none' }
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(data, options);

    var table = new google.visualization.Table(document.getElementById('table_div'));
    table.draw(data);
}

function drawBigTable()
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
        parameters.confidenceLevel = confidenceLevels[c];
        parameters.p = calculatorInputP;

        dataArray = epsilons.map(evaluateTypeA_n_vs_epsilon, parameters);

        dataArrays[c+1] = dataArray;
    }

    var columnLabels = ['Margin of Error / Confidence'].concat(confidenceLevelsLabels);

    var data = arraysToDataTable(columnLabels, dataArrays);

    // format first column as percentage
    var formatter = new google.visualization.NumberFormat( {pattern: "#.##'%'"} );
    formatter.format(data, 0);

    $("#big_table_description_div").html("The table below is shown for an assumed prevalance of " + calculatorInputP + "%. More explanation text here. More explanation text here. More explanation text here. More explanation text here. More explanation text here.");

    var table = new google.visualization.Table(document.getElementById('big_table_div'));
    table.draw(data);
}

function evaluateTypeA_n_vs_epsilon(epsilon)
{
    // this object contains parameter values

    var errorPercentile = 100. - this.confidenceLevel;
    var alpha = 1. - 0.5*errorPercentile/100.;

    // this is the inverse cumulative distribution function
    var z = Math.sqrt(2.) * erfinv(2.*alpha - 1.)

    var episilonDecimal = epsilon / 100.;
    var calculatorInputPDecimal = this.p / 100.;

    var n = (calculatorInputPDecimal*z*z - calculatorInputPDecimal*calculatorInputPDecimal*z*z) / (episilonDecimal*episilonDecimal);

    return Math.round(n);
}

function calculatorRefresh()
{
    var calculatorLabels;
    var calculatorX = [];
    var calculatorY;

    if(calculatorType == 'a')
    {
        calculatorLabels = ['Margin of Error', 'Target Number of Samples'];

        // range: epsilon
        var min = 1;
        var max = 10;
        var numValues = 91;

        for(var i=0; i<numValues; i++)
        {
            var value = min + i/(numValues-1)*(max-min);

            // round to the nearest 100th
            calculatorX.push(Math.round(value*100)/100);
        }

        // use a parameters object to pass in any other input parameters to the evaluation function
        var parameters = new Object();
        parameters.confidenceLevel = calculatorInputConfidenceLevel;
        parameters.p = calculatorInputP;

        calculatorY = calculatorX.map(evaluateTypeA_n_vs_epsilon, parameters);

        $("#chart_table_description_div").html("The chart and table below are shown for an assumed prevalance of " + parameters.p + "% and a confidence level of " + parameters.confidenceLevel + "%. More explanation text here. More explanation text here. More explanation text here. More explanation text here. More explanation text here.");
    }
    else
    {
        alert("unknown calculator type");
        return;
    }

    drawChartAndTable(calculatorLabels, calculatorX, calculatorY);

    drawBigTable();
}

function onLoad()
{
    // create tooltips
    $(document).tooltip();

    // create tabs; trigger a refresh on activation so charts are correctly sized
    $("#tabs").tabs({ activate: function(event, ui) { calculatorRefresh(); } });

    // first refresh of calculator
    calculatorRefresh();
}
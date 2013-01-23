
google.load("visualization", "1", {packages:["corechart", "table"]});

google.setOnLoadCallback(calculatorRefresh);

// calculator type
var calculatorType = 'a';

// input: assumed prevalence p
var calculatorInputP = 0.1;

// second input
var calculatorSecondInput = 0.95;

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

    var options = {
        title: labels[1] + ' vs ' + labels[0],
        hAxis : { title: labels[0] },
        vAxis : { title: labels[1] },
        legend : { position: 'none' }
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(data, options);

    var table = new google.visualization.Table(document.getElementById('table_div'));
    table.draw(data);
}

function evaluateTypeA_n_vs_epsilon(epsilon)
{
    // calculatorSecondInput => confidence level
    var errorPercentile = 1. - calculatorSecondInput
    var alpha = 1. - 0.5*errorPercentile;

    // this is the inverse cumulative distribution function
    var z = Math.sqrt(2.) * erfinv(2.*alpha - 1.)

    var n = (calculatorInputP*z*z - calculatorInputP*calculatorInputP*z*z) / (epsilon*epsilon);

    return Math.round(n);
}

function calculatorRefresh()
{
    var calculatorLabels;
    var calculatorX = [];
    var calculatorY;

    if(calculatorType == 'a')
    {
        calculatorLabels = ['Error Interval', 'Number of Samples'];

        // range: epsilon
        var min = 0.01;
        var max = 0.10;
        var numValues = 91;

        for(var i=0; i<numValues; i++)
        {
            var value = min + i/(numValues-1)*(max-min);

            calculatorX.push(Math.round(value*1000)/1000);
        }

        calculatorY = calculatorX.map(evaluateTypeA_n_vs_epsilon);
    }
    else
    {
        alert("unknown calculator type");
        return;
    }

    drawChartAndTable(calculatorLabels, calculatorX, calculatorY);
}

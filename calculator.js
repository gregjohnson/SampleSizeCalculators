
google.load("visualization", "1", {packages:["corechart", "table"]});

google.setOnLoadCallback(calculatorRefresh);

// calculator type
var calculatorType = 'a';

// input: assumed prevalence p
var calculatorInputP = 0.1;

// second input
var calculatorSecondInput = 0.95;

// based on http://stackoverflow.com/questions/5259421/cumulative-distribution-function-in-javascript
function normalCDF(to) 
{
    var mean = 0.0;
    var sigma = 1.0;

    var z = (to-mean)/Math.sqrt(2*sigma*sigma);
    var t = 1/(1+0.3275911*Math.abs(z));
    var a1 =  0.254829592;
    var a2 = -0.284496736;
    var a3 =  1.421413741;
    var a4 = -1.453152027;
    var a5 =  1.061405429;
    var erf = 1-(((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-z*z);

    var sign = 1;

    if(z < 0)
    {
        sign = -1;
    }

    return (1/2)*(1+sign*erf);
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
    var alpha = 1. - calculatorSecondInput;
    var z = 1. / normalCDF(alpha*0.5)
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

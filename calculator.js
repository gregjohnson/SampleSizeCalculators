
// add support for the map function for browsers that don't support it (like IE)
if(!('map' in Array.prototype)) {
    Array.prototype.map = function(mapper, that /*opt*/) {
        var other = new Array(this.length);
        for(var i=0, n=this.length; i<n; i++)
            if(i in this)
                other[i] = mapper.call(that, this[i], i, this);
        return other;
    };
}

// load required google visualization packages
google.load("visualization", "1", {packages:["corechart", "table"]});

// set the on load callback
google.setOnLoadCallback(onLoad);

// calculator type A inputs: population, assumed prevalence p (%), confidence level (%)
var calculatorTypeAInputs = {
    population:1,
    p:10,
    confidenceLevel:95,
    sampleSize:100
};

// data
var populationToILIFactor = 0.00084615;

// tooltip text
var tooltipTypeATotalPopulation = "The total population size under surveillance. For labs representing entire states, simply select the name of the state. This will automatically provide the 2012 census projection of the state population. For labs collecting specimens from subsets of state populations or populations that cross multiple states, choose 'Other' and enter the estimated size of the entire population under consideration. The calculator uses these numbers to estimate the weekly number of medically attended ILI cases in your jurisdiction (MA-ILI+).";

var tooltipTypeAExpectedFluMAILI = "This is your surveillance target: the level of Flu+/MA-ILI+ you would like to be able estimate accurately. For example, if you would like to detect when Flu+/MA-ILI+ crosses the 10% threshold at the beginning of the flu season, then move the slider to 10%. If, instead, you plan to use the data to estimate Flu+/MA-ILI+ later in the season, when it is closer to 30%, then move the slider closer to 30%. Although the actual fraction of Flu+ over MA-ILI+ may differ from the value you choose, this approximation still provides an important baseline for determining sample sizes.";

var tooltipTypeAMinimumSampleSize = "The minimum number of non-prescreened samples to collect from the medically attended influenza-like-illness population (MA-ILI+) to produce estimates of Flu+/MA-ILI+ with the desired confidence level and margin of error.";

var tooltipTypeAMarginOfError = "The desired margin of error (or width of the confidence interval) around the estimated value of Flu+/MA-ILI+. When using laboratory samples to estimate Flu+/MA-ILI+, you will calculate an expected value plus or minus a margin of error. For example, you might calculate 10% plus or minus 2%, which means that you estimate Flu+/MA-ILI+ to fall somewhere between 8% to 12%). The smaller the margin of error, the more precise your estimate of Flu+/MA-ILI+. Intuitively, high confidence levels and small margins of error require many samples, while low confidence levels or large margins of error require fewer samples.";

var tooltipTypeAConfidenceLevel = "The desired confidence that the sample will yield an estimated level of Flu+/MA-ILI+ that is close to the true value. When using laboratory samples to estimate Flu+/MA-ILI+, you will calculate an expected value plus or minus a margin of error. For example, you might calculate 10% plus or minus 2%, which means that you estimate Flu+/MA-ILI+ to fall somewhere between 8% to 12%. The higher the confidence level, the more confident you can be that the true level of Flu+/MA-ILI+ in your population falls within the estimated interval. Intuitively, high confidence levels and small margins of error require many samples, while low confidence levels or large margins of error require fewer samples.";

var tooltipTypeASampleSize = "The number of non-prescreened samples collected from the medically attended influenza-like-illness population (MA-ILI+).";

var nationalPopulation = 290672938;

var statePopulations = {
        "Alabama": 4822023,
        "Alaska": 731449,
        "Arizona": 6553255,
        "Arkansas": 2949131,
        "California": 38041430,
        "Colorado": 5187582,
        "Connecticut": 3590347,
        "Delaware": 917092,
        "District Of Columbia": 632323,
        "Florida": 19317568,
        "Georgia": 9919945,
        "Hawaii": 1392313,
        "Idaho": 1595728,
        "Illinois": 12875255,
        "Indiana": 6537334,
        "Iowa": 3074186,
        "Kansas": 2885905,
        "Kentucky": 4380415,
        "Louisiana": 4601893,
        "Maine": 1329192,
        "Maryland": 5884563,
        "Massachusetts": 6646144,
        "Michigan": 9883360,
        "Minnesota": 5379139,
        "Mississippi": 2984926,
        "Missouri": 6021988,
        "Montana": 1005141,
        "Nebraska": 1855525,
        "Nevada": 2758931,
        "New Hampshire": 1320718,
        "New Jersey": 8864590,
        "New Mexico": 2085538,
        "New York": 19570261,
        "North Carolina": 9752073,
        "North Dakota": 699628,
        "Ohio": 11544225,
        "Oklahoma": 3814820,
        "Oregon": 3899353,
        "Pennsylvania": 12763536,
        "Rhode Island": 1050292,
        "South Carolina": 4723723,
        "South Dakota": 833354,
        "Tennessee": 6456243,
        "Texas": 26059203,
        "Utah": 2855287,
        "Vermont": 626011
    };

// special Google visualization formatter for different values and labels
// the labelMap specifies the label for a given value (value -> label)
var labelFormatter = function(labelMap) {
    this.labelMap = labelMap;
}

labelFormatter.prototype.format = function(dt, column) {
    for(var i=0; i<dt.getNumberOfRows(); i++)
    {
        var formattedValue = this.labelMap[dt.getValue(i, column)];
        var htmlString = formattedValue;
        dt.setFormattedValue(i, column, htmlString);
    }
}

// return number with commas added
// from: http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function numberWithCommas(x)
{
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

// format a parameter for use in text descriptions
function formatTextParameter(x)
{
    return '<span class="calculatorTextParameter">' + x + '</span>';
}

// from http://stackoverflow.com/questions/457408/is-there-an-easily-available-implementation-of-erf-for-python
function erf(x)
{
    // save the sign of x
    var sign;
    if(x >= 0)
    {
        sign = 1;
    }
    else
    {
        sign = -1;
    }

    x = Math.abs(x);

    // constants
    var a1 =  0.254829592;
    var a2 = -0.284496736;
    var a3 =  1.421413741;
    var a4 = -1.453152027;
    var a5 =  1.061405429;
    var p  =  0.3275911;

    // A&S formula 7.1.26
    t = 1.0/(1.0 + p*x);
    y = 1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-x*x);
    return sign*y; // erf(-x) = -erf(x)
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

function evaluateTypeA_SampleSize_vs_epsilon(epsilon)
{
    // this object contains parameter values

    var errorPercentile = 100. - this.confidenceLevel;
    var alpha = 1. - 0.5*errorPercentile/100.;

    // this is the inverse cumulative distribution function
    var z = Math.sqrt(2.) * erfinv(2.*alpha - 1.)

    var episilonDecimal = epsilon / 100.;
    var pDecimal = this.p / 100.;

    var sampleSize = (pDecimal*z*z - pDecimal*pDecimal*z*z) / (episilonDecimal*episilonDecimal);

    // finite population correction
    var populationILI = this.population * populationToILIFactor;
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
    var populationILI = this.population * populationToILIFactor;

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
    var populationILI = this.population * populationToILIFactor;

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
function drawTypeAChartAndTable()
{
    var labels = ['Margin of Error', 'Minimum Sample Size'];
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
        legend : { position: 'none' }
    };

    // need to specify width here (rather than in CSS) for IE
    var optionsTable = {
        width: '225px'
    };

    $("#calculatorA_chart_table_description_div").html("<span class='calculatorTooltip' title='" + tooltipTypeAMinimumSampleSize + "'>Minimum sample size</span> (of non-prescreened MA-ILI+ specimens) needed to estimate the fraction of Flu+/MA-ILI+ with a specified <span class='calculatorTooltip' title='" + tooltipTypeAMarginOfError + "'>margin of error</span> and confidence level of " + formatTextParameter(parameters.confidenceLevel + "%") + ". (This calculation assumes that the estimated level of Flu+/MA-ILI+ will be close to " + formatTextParameter(parameters.p + "%") + " and the total population under surveillance is " + formatTextParameter(numberWithCommas(parameters.population)) + "). Use your mouse to view values in the sample size graph and scroll through sample size table.");

    var chart = new google.visualization.LineChart(document.getElementById('calculatorA_chart_div'));
    chart.draw(dataChart, optionsChart);

    var table = new google.visualization.Table(document.getElementById('calculatorA_table_div'));
    table.draw(dataTable, optionsTable);
}

function drawTypeABigTable()
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

    $("#calculatorA_big_table_description_div").html("<span class='calculatorTooltip' title='" + tooltipTypeAMinimumSampleSize + "'>Minimum sample sizes</span> (of non-prescreened MA-ILI+ specimens) needed to estimate the fraction of Flu+/MA-ILI+ with a specified <span class='calculatorTooltip' title='" + tooltipTypeAMarginOfError + "'>margin of error</span> (rows) and <span class='calculatorTooltip' title='" + tooltipTypeAConfidenceLevel + "'>confidence level</span> (columns). (This calculation assumes that the estimated level of Flu+/MA-ILI+ will be close to " + formatTextParameter(calculatorTypeAInputs.p + "%") + " and the total population under surveillance is " + formatTextParameter(numberWithCommas(calculatorTypeAInputs.population)) + ".)");

    var table = new google.visualization.Table(document.getElementById('calculatorA_big_table_div'));
    table.draw(data);
}

// draw chart and table given labels, x series, y series
function drawTypeAChartAndTable2()
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
        legend : { position: 'none' }
    };

    // need to specify width here (rather than in CSS) for IE
    var optionsTable = {
        width: '225px'
    };

    $("#calculatorA_chart_table_2_description_div").html("Enter your sample size in the box above (number of non-prescreened MA-ILI+ specimens to be tested). The graph and table show the best combinations of <span class='calculatorTooltip' title='" + tooltipTypeAMarginOfError + "'>margin of error</span> and <span class='calculatorTooltip' title='" + tooltipTypeAConfidenceLevel + "'>confidence level</span> achievable with " + formatTextParameter(parameters.sampleSize) + " non-prescreened MA-ILI+ specimens. (This calculation assumes that the estimated level of Flu+/MA-ILI+ will be close to " + formatTextParameter(parameters.p + "%") + " and the total population under surveillance is " + formatTextParameter(numberWithCommas(parameters.population)) + ".) There is a trade-off between confidence level and margin of error. The higher the confidence level, the larger the margin of error, and vice versa. Use your mouse to view values in the graph and scroll through the table.");

    var chart = new google.visualization.LineChart(document.getElementById('calculatorA_chart_2_div'));
    chart.draw(dataChart, optionsChart);

    var table = new google.visualization.Table(document.getElementById('calculatorA_table_2_div'));
    table.draw(dataTable, optionsTable);
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


    // num samples input
    $("#calculatorA_input_sample_size").bind('keyup mouseup change', function(e) {
        calculatorTypeAInputs.sampleSize = parseFloat($("#calculatorA_input_sample_size").val());
        calculatorTypeARefresh();
    });

    $("#calculatorA_input_sample_size").val(calculatorTypeAInputs.sampleSize);
}

function calculatorTypeARefresh()
{
    drawTypeAChartAndTable();
    drawTypeABigTable();
    drawTypeAChartAndTable2();
}


///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// CALCULATOR B /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// calculator type B inputs: population, confidence level (%)
var calculatorTypeBInputs = {
    population:1,
    surveillanceScale:'National',
    confidenceLevel1:95,
    confidenceLevel2:95,
    p2:10,
    confidenceLevel3:95,
    p3:10,
    detectionThreshold3:1,
    fluSampleSize4:1,
    MAILISampleSize4:0,
    p4:10
};

// tooltip text
var tooltipTypeBTotalPopulation = tooltipTypeATotalPopulation;
var tooltipTypeBConfidenceLevel = "The desired confidence that the sample will contain at least one rare specimen (Rare+) when the prevalence of rare type reaches the specified limit of detection. Sample sizes can be calculated for non-prescreened MA-ILI+ or prescreened Flu+, or a combination of both types of specimens. For example, if you choose a confidence level of 95% and a detection threshold of 1/400, then the resulting minimum sample size should be sufficient to detect a rare type when it reaches a prevalence of 1/400 Rare+/Flu+, 95% of the time. Intuitively, a high confidence level and a low detection threshold requires many samples, while low confidence and a high detection threshold results in fewer samples.";
var tooltipTypeBExpectedFluMAILI = "The fraction of non-prescreened MA-ILI+ cases that are Flu+. This estimate will vary throughout the influenza season. This fraction is needed to estimate the number of non-prescreened MA-ILI+ samples required to screen a sufficient number of Flu+ specimens to detect a rare type of influenza (Rare+).";
var tooltipTypeBDetectionThreshold = "The detection threshold for a rare type of influenza is the prevalence of the rare type (out of all Flu+ cases) at which the first rare specimens are expected to appear in the lab. For example, a detection threshold of 0.25% (1/400) means that rare type should be detected by the lab when it rises to a prevalence of one out of every 400 cases of flu.";
var tooltipTypeBMinimumFluSampleSize = "The minimum number of Flu+ samples required to detect a rare type when its prevalence (Rare+/Flu+) reaches the specified detection threshold, with the specified level of confidence.";
var tooltipTypeBMinimumMAILISampleSize = "The minimum number of non-prescreened MA-ILI+ samples required to detect a rare type when its prevalence (Rare+/Flu+) reaches the specified detection threshold, with the specified level of confidence.";
var tooltipTypeBFluSampleSize = "The number of Flu+ samples to be screened. Both Flu+ and non-prescreened MA-ILI+ samples can be used to detect rare types of influenza. However, many more non-prescreened MA-ILI+ specimens are typically required than Flu+ specimens to achieve the same power of detection, particularly when the overall prevalence of influenza (Flu+/MA-ILI+) is low.";
var tooltipTypeBMAILISampleSize = "The number of non-prescreened MA-ILI+ samples. Both Flu+ and non-prescreened MA-ILI+ samples can be used to detect rare types of influenza. However, many more non-prescreened MA-ILI+ specimens are typically required than Flu+ specimens to achieve the same power of detection, particularly when the overall prevalence of influenza (Flu+/MA-ILI+) is low.";
var tooltipTypeBSurveillanceScale = "Surveillance scale description.";

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

    // round to the nearest 100th
    return Math.round(detectionThreshold*100)/100;
}

// draw chart and table given labels, x series, y series
function drawTypeBTab1()
{
    var labels = ['Detection Threshold (Rare+/Flu+)', 'Minimum Flu+ Sample Size'];
    var x = [];
    var xChartLabelMap = {};
    var xTableLabelMap = {};
    var y;

    // range: detection threshhold
    var min = 0.25;
    var max = 3;
    var numValues = 12;

    for(var i=0; i<numValues; i++)
    {
        var value = min + i/(numValues-1)*(max-min);

        // round to the nearest 100th
        x.push(Math.round(value*100)/100);

        // labels
        xChartLabelMap[value] = "Detection Threshhold: " + value + "% (1/" + Math.round(100. / value) + ")";
        xTableLabelMap[value] = value + "% (1/" + Math.round(100. / value) + ")";
    }

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
        legend : { position: 'none' }
    };

    // need to specify width here (rather than in CSS) for IE
    var optionsTable = {
        width: '225px'
    };

    $("#calculatorB1_chart_table_description_div").html("<span class='calculatorTooltip' title='" + tooltipTypeBMinimumFluSampleSize + "'>Minimum sample size (of Flu+ specimens)</span> required to detect a rare type of influenza at a specified <span class='calculatorTooltip' title='" + tooltipTypeBDetectionThreshold + "'>detection threshold (Rare+/Flu+)</span>, with a confidence of " + formatTextParameter(parameters.confidenceLevel + "%") + ". (These calculations assume a total population of " + formatTextParameter(numberWithCommas(parameters.population)) + ".) Use your mouse to view values in the sample size graph and scroll through sample size table.");

    var chart = new google.visualization.LineChart(document.getElementById('calculatorB1_chart_div'));
    chart.draw(dataChart, optionsChart);

    var table = new google.visualization.Table(document.getElementById('calculatorB1_table_div'));
    table.draw(dataTable, optionsTable);
}

// draw chart and table given labels, x series, y series
function drawTypeBTab2()
{
    var labels = ['Detection Threshold (Rare+/Flu+)', 'Minimum MA-ILI+ Sample Size'];
    var x = [];
    var xChartLabelMap = {};
    var xTableLabelMap = {};
    var y;

    // range: detection threshhold
    var min = 0.25;
    var max = 3;
    var numValues = 12;

    for(var i=0; i<numValues; i++)
    {
        var value = min + i/(numValues-1)*(max-min);

        // round to the nearest 100th
        x.push(Math.round(value*100)/100);

        // labels
        xChartLabelMap[value] = "Detection Threshhold: " + value + "% (1/" + Math.round(100. / value) + ")";
        xTableLabelMap[value] = value + "% (1/" + Math.round(100. / value) + ")";
    }

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
        legend : { position: 'none' }
    };

    // need to specify width here (rather than in CSS) for IE
    var optionsTable = {
        width: '225px'
    };

    $("#calculatorB2_chart_table_description_div").html("<span class='calculatorTooltip' title='" + tooltipTypeBMinimumMAILISampleSize + "'>Minimum sample size (of non-prescreened MA-ILI+ specimens)</span> required to detect a rare type of influenza at the specified <span class='calculatorTooltip' title='" + tooltipTypeBDetectionThreshold + "'>detection threshold (Rare+/Flu+)</span>, with a confidence of " + formatTextParameter(parameters.confidenceLevel + "%") + ". (These calculations assume a total population of " + formatTextParameter(numberWithCommas(parameters.population)) + " and a Flu+/MA-ILI+ prevalence of " + formatTextParameter(parameters.p + "%") + ".) Use your mouse to view values in the sample size graph and scroll through sample size table.");

    var chart = new google.visualization.LineChart(document.getElementById('calculatorB2_chart_div'));
    chart.draw(dataChart, optionsChart);

    var table = new google.visualization.Table(document.getElementById('calculatorB2_table_div'));
    table.draw(dataTable, optionsTable);
}

// draw chart and table given labels, x series, y series
function drawTypeBTab3()
{
    var labels = ['Flu+ Sample Size', 'MA-ILI+ Sample Size'];
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
        legend : { position: 'none' }
    };

    // need to specify width here (rather than in CSS) for IE
    var optionsTable = {
        width: '225px'
    };

    $("#calculatorB3_chart_table_description_div").html("Acceptable combinations of <span class='calculatorTooltip' title='" + tooltipTypeBFluSampleSize + "'>Flu+</span> and <span class='calculatorTooltip' title='" + tooltipTypeBMAILISampleSize + "'>non-prescreened MA-ILI+</span> sample sizes required to detect a rare type of influenza with prevalence (Rare+/Flu+) that has reached the detection threshold of " + formatTextParameter(parameters.detectionThreshold + "% (1/" + Math.round(100. / parameters.detectionThreshold) + ")") + ", with a confidence of " + formatTextParameter(parameters.confidenceLevel + "%") + ". (These calculations assume a total population of " + formatTextParameter(numberWithCommas(parameters.population)) + " and a Flu+/MA-ILI+ prevalence of " + formatTextParameter(parameters.p + "%") + ".)  Many more non-prescreened MA-ILI+ specimens are typically required than Flu+ specimens to achieve the same power of detection, particularly when the overall prevalence of influenza (Flu+/MA-ILI+) is low.");

    var chart = new google.visualization.LineChart(document.getElementById('calculatorB3_chart_div'));
    chart.draw(dataChart, optionsChart);

    var table = new google.visualization.Table(document.getElementById('calculatorB3_table_div'));
    table.draw(dataTable, optionsTable);
}

// draw chart and table given labels, x series, y series
function drawTypeBTab4()
{
    var labels = ['Confidence Level', 'Detection Threshold (Rare+/Flu+)'];
    var x = [];
    var y;
    var yLabelMap = {};

    // range: confidence level (%)
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

    // use a parameters object to pass in any other input parameters to the evaluation function
    var parameters = new Object();
    parameters.population = calculatorTypeBInputs.population;
    parameters.surveillanceScale = calculatorTypeBInputs.surveillanceScale;
    parameters.fluSampleSize = calculatorTypeBInputs.fluSampleSize4;
    parameters.MAILISampleSize = calculatorTypeBInputs.MAILISampleSize4;
    parameters.p = calculatorTypeBInputs.p4;

    // evaluation for each x
    y = x.map(evaluateTypeB_detectionThreshold_vs_confidenceLevel, parameters);

    // determine y labels
    for(var i=0; i<y.length; i++)
    {
        yLabelMap[y[i]] = y[i] + "% (1/" + Math.round(100. / y[i]) + ")";
    }

    // separate DataTable objects for chart / table to allow for formatting
    var dataChart = arraysToDataTable(labels, [x, y]);
    var dataTable = dataChart.clone();

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
        legend : { position: 'none' }
    };

    // need to specify width here (rather than in CSS) for IE
    var optionsTable = {
        width: '225px'
    };

    $("#calculatorB4_chart_table_description_div").html("Enter your sample sizes in the boxes above (number of Flu+ and non-prescreened MA-ILI+ specimens to be tested). The graph and table show the best combinations of <span class='calculatorTooltip' title='" + tooltipTypeBDetectionThreshold + "'>detection threshold</span> and <span class='calculatorTooltip' title='" + tooltipTypeBConfidenceLevel + "'>confidence level</span> achievable with " + formatTextParameter(numberWithCommas(parameters.fluSampleSize)) + " Flu+ specimens and " + formatTextParameter(numberWithCommas(parameters.MAILISampleSize)) + " non-prescreened MA-ILI+ specimens. (This calculation assumes a total population of " + formatTextParameter(numberWithCommas(parameters.population)) + " and a Flu+/MA-ILI+ prevalence of " + formatTextParameter(parameters.p + "%") + ".) There is a trade-off between detection threshold and confidence level. Intuitively, the lower the prevalence of a rare type, the less likely it will be detected, and vice versa. Use your mouse to view values in the graph and scroll through the table.");

    var chart = new google.visualization.LineChart(document.getElementById('calculatorB4_chart_div'));
    chart.draw(dataChart, optionsChart);

    var table = new google.visualization.Table(document.getElementById('calculatorB4_table_div'));
    table.draw(dataTable, optionsTable);
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
        max: 30,
        step: 1,
        slide: function(event, ui) {
            $("#calculatorB2_input_p").val(ui.value + "%");
            calculatorTypeBInputs.p2 = parseFloat($("#calculatorB2_input_p").val());
            calculatorTypeBRefresh();
        }
    });

    $("#calculatorB2_input_p").val($("#calculatorB2_input_p_slider").slider("value") + "%");

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
        max: 30,
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
        min: 0.25,
        max: 3,
        step: 0.25,
        slide: function(event, ui) {
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
        max: 30,
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
    drawTypeBTab1();
    drawTypeBTab2();
    drawTypeBTab3();
    drawTypeBTab4();
}

function onLoad()
{
    // create accordion
    $("#calculator_accordion").accordion({ heightStyle: "content", activate: function(event, ui) { calculatorTypeARefresh(); calculatorTypeBRefresh(); } } );

    // create individual calculator tabs; trigger a refresh on activation so charts are correctly sized
    $("#calculatorA_tabs").tabs({ activate: function(event, ui) { calculatorTypeARefresh(); } });
    $("#calculatorB_tabs").tabs({ activate: function(event, ui) { calculatorTypeBRefresh(); } });

    // initialize and refresh individual calculators
    calculatorTypeAInitialize();
    calculatorTypeARefresh();

    calculatorTypeBInitialize();
    calculatorTypeBRefresh();

    // create tooltips; do this last since we may set some tooltip text in the calculator initializations
    $(document).tooltip();
}
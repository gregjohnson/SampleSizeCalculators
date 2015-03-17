
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

// data
var populationToILIFactorBase = 2.5 / (52. * 100.); // corresponds to 2.5 doctor visits per year

// global input: MA-ILI percentage
var inputMAILIPercentage = 2.2;

// tooltip text
var tooltipMAILI = "The proportion of outpatient visits for ILI. If known, select the proportion related to the population/jurisdiction under surveillance. Alternatively, the PHL can visit FluView and under 'Outpatient Illness Surveillance' the PHL can see the national proportion.";

var nationalPopulation = 317581124;

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
        "Puerto Rico": 3667084,
        "Rhode Island": 1050292,
        "South Carolina": 4723723,
        "South Dakota": 833354,
        "Tennessee": 6456243,
        "Texas": 26059203,
        "Utah": 2855287,
        "Vermont": 626011,
        "Virginia": 8185867,
        "Washington": 6897012,
        "West Virginia": 1855413,
        "Wisconsin": 5726398,
        "Wyoming": 576412,
        "United States": nationalPopulation
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

// increased font size for all charts (default seems to be 11)
var chartFontSize = '12';

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

function showCalculatorPopup(calculator)
{
    $(function() {
        $("#calculator" + calculator + "_popup").dialog({
            width: 500,
            modal: true,
            buttons: {
                Ok: function() {
                    $( this ).dialog( "close" );
                }
            }
        });
    });
}

function onLoad()
{
    // create accordion
    $("#calculator_accordion").accordion({ heightStyle: "content", activate: function(event, ui) {
        // show popup when new calculator is activated; note the weird indexing...
        if(ui.newPanel.index() == 1)
        {
            showCalculatorPopup('A');
        }
        else if(ui.newPanel.index() == 3)
        {
            showCalculatorPopup('B');
        }
        else if(ui.newPanel.index() == 5)
        {
            showCalculatorPopup('C');
        }

        calculatorTypeARefresh(); calculatorTypeBRefresh(); calculatorTypeCRefresh(); calculatorTypeDRefresh();
    } });

    // create individual calculator tabs; trigger a refresh on activation so charts are correctly sized
    $("#calculatorA_tabs").tabs({ activate: function(event, ui) { calculatorTypeAActiveTabIndex = ui.newTab.index(); calculatorTypeARefresh(); } });
    $("#calculatorB_tabs").tabs({ activate: function(event, ui) { calculatorTypeBActiveTabIndex = ui.newTab.index(); calculatorTypeBRefresh(); } });
    $("#calculatorC_tabs").tabs({ activate: function(event, ui) { calculatorTypeCActiveTabIndex = ui.newTab.index(); calculatorTypeCRefresh(); } });
    $("#calculatorD_tabs").tabs({ activate: function(event, ui) { calculatorTypeDActiveTabIndex = ui.newTab.index(); calculatorTypeDRefresh(); } });

    // global tooltips
    // this was (and still could be) a global input for all calculators... so it's coded a little differently
    $(".tooltipMAILI").attr("title", tooltipMAILI);

    // global input: slider for medically attended ILI percentage
    // this was (and still could be) a global input for all calculators... so it's coded a little differently
    $("#calculators_input_MAILI_slider").slider({
        value:inputMAILIPercentage,
        min: 1,
        max: 20,
        step: 0.1,
        slide: function(event, ui) {
            $("#calculators_input_MAILI").val(ui.value + "%");
            inputMAILIPercentage = parseFloat($("#calculators_input_MAILI").val());

            // refresh all calculators since they depend on this value
            calculatorTypeARefresh();

            // for now, it does not refresh calculators B, C, D
            // calculatorTypeBRefresh();
            // calculatorTypeCRefresh();
            // calculatorTypeDRefresh();
        }
    });

    $("#calculators_input_MAILI").val($("#calculators_input_MAILI_slider").slider("value") + "%");

    // initialize and refresh individual calculators
    calculatorTypeAInitialize();
    calculatorTypeARefresh();

    calculatorTypeBInitialize();
    calculatorTypeBRefresh();

    calculatorTypeCInitialize();
    calculatorTypeCRefresh();

    calculatorTypeDInitialize();
    calculatorTypeDRefresh();

    // create tooltips; do this last since we may set some tooltip text in the calculator initializations
    $(document).tooltip();

    // activate specific calculator in accordion based on URL
    if(window.location.hash)
    {
        var hashInt = parseInt(window.location.hash.replace('#', ''));

        // right now we only have four calculators...
        if(hashInt >= 0 && hashInt < 4)
        {
            $("#calculator_accordion").accordion('option', 'active', hashInt);
        }

        if(hashInt == 0)
        {
            // show calculator A popup (since the hash won't trigger an activate event)
            showCalculatorPopup('A');
        }
    }
    else
    {
        // show calculator A popup (since the page load won't trigger an activate event)
        showCalculatorPopup('A');
    }
}

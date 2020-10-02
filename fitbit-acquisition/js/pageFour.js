// set the dimensions and margins of the graph
var margin = {top: 50, right: 25, bottom: 30, left: 120},
width = 1000 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

var scatterPlot = d3.select("#scatterPlot")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

// Read the data
d3.csv("https://raw.githubusercontent.com/vanessaaleung/rawdata/master/techma.csv", function(data) {
console.log(data);

// Filter Alphabet acquisitions
alphabet = data.filter(function (d) {
return (d['Parent Company'] == 'Alphabet') && (!isNaN(new Date(d.Date)));
});

alphabetGrouped = d3.nest()
.key(function(d) { return new Date(d.Date).getFullYear(); })
.rollup(function(v) { return v.length ; })
.entries(alphabet)
.sort(function (a, b) {
  return d3.ascending(a.key, b.key);
});

console.log(alphabetGrouped);

// Convert values into abbr
function convertValue(value) {
return Math.abs(Number(value)) >= 1.0e+9
  ? Math.abs(Number(value)) / 1.0e+9 + "B"
  : Math.abs(Number(value)) >= 1.0e+6
  ? Math.abs(Number(value)) / 1.0e+6 + "M"
  : Math.abs(Number(value)) >= 1.0e+3
  ? Math.abs(Number(value)) / 1.0e+3 + "K"
  : Math.abs(Number(value));
};

// Add X axis
var x = d3.scaleTime()
.domain(d3.extent(alphabet, function(d) {
  return new Date(d.Date);
}))
.range([ 0, width ]);

scatterPlot.append("g")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x));

// Add Y axis
var y = d3.scaleLinear()
.domain(d3.extent(alphabet, function(d) {
  return +d['Value (USD)'];
}))
.range([ height, 5 ]);

scatterPlot.append("g")
.call(d3.axisLeft(y).ticks(5))
.select(".domain").remove();

// Add Y axis label
scatterPlot.append("text")
.attr("text-anchor", "middle")  
.attr("transform", "translate("+ (-100) +","+(height/2)+")rotate(-90)") 
.text("Value (USD) (Log)");

// Scale dot size
var r = d3.scaleLinear()
.domain([1, d3.max(alphabet, function (d) { return +d['Value (USD)']; })])
.range([2, 10]);

// Set highlight action
var highlight = function() {
d3.select(this)
  .transition()
  .duration(200)
  .style("stroke", "black")
  .style("stroke-width", 5)
  .style("cursor", "pointer")
}

var notHighlight = function() {
d3.select(this)
  .transition()
  .duration(200)
  .style("stroke-width", 0)
  .style("cursor", "default")
}

// Add dots 
scatterPlot.append('g')
.selectAll("dot")
.data(alphabet)
.enter()
.append("circle")
.attr("cx", function (d) { return x(new Date(d.Date)); } )
.attr("cy", function (d) { return y(d['Value (USD)']); } ) 
.attr("r", function (d) { return r(d['Value (USD)']); } )
.style("fill", function (d) {
    year =  new Date(d.Date).getFullYear()
    return (d.Company == "Fitbit" ? "#31B4C2" : "#C7BFB7"); 
  })
.style("opacity", 0.7)
.on("mouseover", highlight)
.on("mouseleave", notHighlight);

// Add labels
label = ['Dropcam', 'HTC (portions)', 'Waze', 
        'Superpod', 'Nest Labs', 'DoubleClick', 'Fitbit', 'Android', 'Motorola Mobility', 
        'Postini', 'YouTube', 'On2', 'Apigee', 'Looker']
dataWithLabel = data.filter(function (d) { return label.indexOf(d.Company) >= 0; } )

scatterPlot.append('g')
.selectAll("dot")
.data(dataWithLabel)
.enter()
.append("text")
.text(function(d){ return d.Company; })
.attr("x", function (d) { return x(new Date(d.Date)) - 50; })
.attr("y", function (d) { return y(d['Value (USD)']) - 10; });
  
// Add table
alphabet10 = alphabet.sort(function(x, y){
return d3.descending(+x['Value (USD)'], +y['Value (USD)']);
}).slice(0, 10);

var columnNames = ['Company', 'Year of Date', 'Business', 'Value (USD)']
var table = d3.select("#pageFourTable").append("table");
var thead = table.append("thead");
var tbody = table.append("tbody");

// Add header
thead.append("tr")
  .selectAll("th")
  .data(columnNames)
  .enter()
  .append("th")
  .text(function (columnNames) { return columnNames; });

// Add rows
var rows = tbody.selectAll("tr")
  .data(alphabet10)
  .enter()
  .append("tr")

// Add cells
var cells = rows
.selectAll("td")
.data(function (row) {
    return columnNames.map(function (column) {
      if (column == "Year of Date") {
        return { column: column, value: new Date(row.Date).getFullYear() };
      }
      else if (column == "Value (USD)") {
        return { column: column, value: convertValue(+row[column]) };
      }
      else {
        return { column: column, value: row[column] };
      }
    });
})
.enter()
.append("td")
.html(function (d) { return d.value; });
});
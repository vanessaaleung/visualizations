// set the dimensions and margins of the graph
var margin = {top: 50, right: 25, bottom: 30, left: 120},
width = 1000 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#scatterPlot")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

// Read the data
d3.csv("https://raw.githubusercontent.com/vanessaaleung/rawdata/master/techma.csv", function(data) {
console.log(data);

// Add X axis
var x = d3.scaleTime()
.domain(d3.extent(data, function(d) {
  return new Date(d.Date);
}))
.range([ 0, width ]);

svg.append("g")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x));

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

// Add Y axis
var y = d3.scaleLinear()
.domain(d3.extent(data, function(d) {
  return +d['Value (USD)'];
}))
.range([ height, 0 ]);

svg.append("g")
.call(d3.axisLeft(y).ticks(3))
.select(".domain").remove();

// Add Y axis label
svg.append("text")
.attr("text-anchor", "middle")  
.attr("transform", "translate("+ (-100) +","+(height/2)+")rotate(-90)") 
.text("Value (USD)");

// Scale dot size
var r = d3.scaleLinear()
.domain([0, d3.max(data, function (d) { return +d['Value (USD)']; })])
.range([2, 35]);

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
svg.append('g')
.selectAll("dot")
.data(data)
.enter()
.append("circle")
.attr("cx", function (d) { return x(new Date(d.Date)); } )
.attr("cy", function (d) { return y(d['Value (USD)']); } ) 
.attr("r", function (d) { return r(d['Value (USD)']); } )
.style("fill", function (d) {
    year =  new Date(d.Date).getFullYear()
    return (d.Company == "Fitbit" ? "#E77779" : year < 2000 ? "#C7BFB7" : year < 2010 ? "#C6D474" : "#31B4C2"); 
  })
.style("opacity", 0.7)
.on("mouseover", highlight)
.on("mouseleave", notHighlight);

// Add labels
label = ['Red Hat', 'LinkedIn', 'WhatsApp', 'Motorola Mobility', 'GitHub', 'Fitbit', 'Broadcast.com', 'aQuantive']
dataWithLabel = data.filter(function (d) { return label.indexOf(d.Company) >= 0; } )

svg.append('g')
.selectAll("dot")
.data(dataWithLabel)
.enter()
.append("text")
.text(function(d){ return d.Company; })
.attr("x", function (d) { return x(new Date(d.Date)) - 30; })
.attr("y", function (d) { return y(d['Value (USD)']) + 5; });

// Add table
dataTop20 = data.sort(function(x, y){
return d3.descending(+x['Value (USD)'], +y['Value (USD)']);
}).slice(0, 20);

var columnNames = ['Company', 'Parent Company', 'Year of Date', 'Business', 'Value (USD)']
var table = d3.select("#table").append("table");
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
  .data(dataTop20)
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

})
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

var barChart = d3.select("#barChart")
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

filterData = data.filter(function (d) {
return (+d['Value (USD)'] > 0) && (!isNaN(new Date(d.Date)));
});

console.log(filterData);

// Add Y axis
var y = d3.scaleLog()
.domain(d3.extent(filterData, function(d) {
  return +d['Value (USD)'];
}))
.range([ height, 5 ]);

svg.append("g")
.call(d3.axisLeft(y).ticks(5))
.select(".domain").remove();

// Add Y axis label
svg.append("text")
.attr("text-anchor", "middle")  
.attr("transform", "translate("+ (-100) +","+(height/2)+")rotate(-90)") 
.text("Value (USD) (Log)");

// Scale dot size
var r = d3.scaleLog()
.domain([1, d3.max(filterData, function (d) { return +d['Value (USD)']; })])
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
svg.append('g')
.selectAll("dot")
.data(filterData)
.enter()
.append("circle")
.attr("cx", function (d) { return x(new Date(d.Date)); } )
.attr("cy", function (d) { return y(d['Value (USD)']); } ) 
.attr("r", function (d) { return r(d['Value (USD)']); } )
.style("fill", function (d) {
    year =  new Date(d.Date).getFullYear()
    return (d["Parent Company"] == "Alphabet" ? "#31B4C2" : "#C7BFB7"); 
  })
.style("opacity", 0.7)
.on("mouseover", highlight)
.on("mouseleave", notHighlight);

// Add labels
label = ['HTC (portions)', 'Waze', 'Dark Blue Labs & Vision Factory', 'Superpod', 'Nest Labs', 'DoubleClick', 'Fitbit', 'Android', 'Motorola Mobility', 'Postini', 'YouTube']
dataWithLabel = data.filter(function (d) { return label.indexOf(d.Company) >= 0; } )

svg.append('g')
.selectAll("dot")
.data(dataWithLabel)
.enter()
.append("text")
.text(function(d){ return d.Company; })
.attr("x", function (d) { return x(new Date(d.Date)) - 50; })
.attr("y", function (d) { return y(d['Value (USD)']) - 10; });
  
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

// Add X axis
var x = d3.scaleBand()
.domain(alphabetGrouped.map(function(d) { return new Date(d.key).getFullYear() + 1; }))
.range([ 0, width ])
.padding(0.1);

barChart.append("g")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x));

// Add Y axis
var y = d3.scaleLinear()
.domain([0, d3.max(alphabetGrouped, function(d) { return d.value; })])
.range([ height, 0 ]);

barChart.append("g")
.call(d3.axisLeft(y).ticks(4))
.select(".domain").remove();

// Add Y axis label
barChart.append("text")
.attr("text-anchor", "middle")  
.attr("transform", "translate("+ (-100) +","+(height/2)+")rotate(-90)") 
.text("Number of Records");

// Add rects
barChart.selectAll()
.data(alphabetGrouped)
.enter()
.append('rect')
.attr('x', function (d) { return x(new Date(d.key).getFullYear() + 1); })
.attr('y', function (d) { return y(d.value); })
.attr('height', function (d) { return height - y(d.value); })
.attr('width', x.bandwidth())
.attr('fill', function (d) { return d.key == "2014" ? "#31B4C2" : "#C7BFB7"})
.on("mouseover", highlight)
.on("mouseleave", notHighlight);

// Add labels
barChart.selectAll()
  .data(alphabetGrouped)
  .enter()
  .append("text")
  .attr("y", function (d) { return y(d.value) - 3; })
  .attr("x", function (d) { return x(new Date(d.key).getFullYear() + 1) + x.bandwidth() / 2; })
  .text(function (d) { return d.value; })
  .attr("text-anchor", "middle");

// Add annotation
barChart.append("text")
  .attr("y", function (d) { return y(34) + 15; })
  .attr("x", function (d) { return x(new Date("2014").getFullYear() + 1) + x.bandwidth() * 1.5; })
  .attr("font-size", "12px")
  .append("tspan")
  .attr("x", function (d) { return x(new Date("2014").getFullYear() + 1) + x.bandwidth() * 1.5; })
  .attr("dy", function (d) { return y(34) + 15; })
  .text("Accquired companies in 2014 include")
  .append("tspan")
  .attr("x", function (d) { return x(new Date("2014").getFullYear() + 1) + x.bandwidth() * 1.5; })
  .attr("dy", function (d) { return y(34) + 18; })
  .text("its later famous products - Firebase and Nest Labs.")
  .attr("text-anchor", "left");

});
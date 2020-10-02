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
.call(d3.axisLeft(y).ticks(3))
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
.attr("cy", function (d) { return y(+d['Value (USD)']); } ) 
.attr("r", function (d) { return r(+d['Value (USD)']); } )
.style("fill", function (d) {
    year =  new Date(d.Date).getFullYear()
    return (d.Company == "Fitbit" ? "#E77779" : year < 2000 ? "#C7BFB7" : year < 2010 ? "#C6D474" : "#31B4C2"); 
  })
.style("opacity", 0.7)
.on("mouseover", highlight)
.on("mouseleave", notHighlight);

// Add labels
label = ['Red Hat', 'LinkedIn', 'WhatsApp', 'Motorola Mobility', 'Nest Labs', 'GitHub', 'Fitbit', 'Broadcast.com', 'aQuantive']
dataWithLabel = data.filter(function (d) { return label.indexOf(d.Company) >= 0; } )

svg.append('g')
.selectAll("dot")
.data(dataWithLabel)
.enter()
.append("text")
.text(function(d){ return d.Company; })
.attr("x", function (d) { return x(new Date(d.Date)) - 50; })
.attr("y", function (d) { return y(+d['Value (USD)']) - 10; });

// Group value by parent company
var valueByCompany = d3.nest()
.key(function(d) { return d['Parent Company']; })
.rollup(function(v) { return d3.sum(v, function(d) { return d['Value (USD)']; }); })
.entries(data)
.sort(function (a, b) {
  return d3.ascending(a.value, b.value);
}); 

console.log(valueByCompany);

// Add bar chart
var barChart = d3.select("#barChart")
  .append("svg")
  .attr("width", (width + margin.left + margin.right))
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleLinear()
  .range([0, 800])
  .domain([0, d3.max(valueByCompany, function (d) {
      return d.value;
  })]);

var y = d3.scaleBand()
  .rangeRound([height, 0])
  .padding(0.1)
  .domain(valueByCompany.map(function (d) {
      return d.key;
  }));

// Add Y axis
var yAxis = d3.axisLeft()
  .scale(y)
  .tickSize(0);

var gy = barChart.append("g")
  .call(yAxis)

var bars = barChart.selectAll(".bar")
  .data(valueByCompany)
  .enter()
  .append("g")

// Set highlight action
var highlight = function() {
d3.select(this)
  .transition()
  .duration(200)
  .style("stroke", "black")
  .style("stroke-width", 2)
  .style("cursor", "pointer")
}

var notHighlight = function() {
d3.select(this)
  .transition()
  .duration(200)
  .style("stroke-width", 0)
  .style("cursor", "default")
}

// Add rects
bars.append("rect")
  .attr("y", function (d) {
      return y(d.key);
  })
  .attr("height", y.bandwidth())
  .attr("x", 0)
  .attr("width", function (d) {
      return x(d.value);
  })
  .attr("fill", function(d) { return d.key == "Alphabet" ? "#31B4C2" : "#C7BFB7"})
  .on("mouseover", highlight)
  .on("mouseleave", notHighlight);

// Add labels
bars.append("text")
  .attr("y", function (d) { return y(d.key) + y.bandwidth() / 2 + 4; })
  .attr("x", function (d) { return x(d.value) + 3; })
  .text(function (d) { return convertValue(+d.value); });

bars.append("text")
.attr("x", (width / 2))             
.attr("y", 0 - (margin.top / 2))
.attr("text-anchor", "middle")  
.style("font-size", "16px") 
.text("Total Acquisition Value");

 })
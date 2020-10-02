// set the dimensions and margins of the graph
var margin = {top: 50, right: 25, bottom: 30, left: 120},
width = 1000 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;


// Read the data
d3.csv("https://raw.githubusercontent.com/vanessaaleung/rawdata/master/techma.csv", function(data) {
console.log(data);

sortedData = data.sort(function(x, y){
return d3.ascending(x.Company, y.Company);
});

// Convert values into abbr
function convertValue(value) {
return value == 0 ? "N/A"
  : Math.abs(Number(value)) >= 1.0e+9
  ? Math.abs(Number(value)) / 1.0e+9 + "B"
  : Math.abs(Number(value)) >= 1.0e+6
  ? Math.abs(Number(value)) / 1.0e+6 + "M"
  : Math.abs(Number(value)) >= 1.0e+3
  ? Math.abs(Number(value)) / 1.0e+3 + "K"
  : Math.abs(Number(value));
};

// var searchBar = d3.select("#allTable")
//     .append("input")
//     .attr("id", "search")
//     .attr("type", "text")
//     .attr("placeholder", "Search...");
  
// Add table
var columnNames = ['Company', 'Parent Company', 'Year of Date', 'Value (USD)', 'Business']
var table = d3.select("#table").append("table");
var thead = table.append("thead")
var tbody = table.append("tbody");

var sort = function() {
d3.select(this)
  .transition()
  .duration(200)
  .style("cursor", "pointer")
}

// Add header
var header = thead.append("tr")
  .selectAll("th")
  .data(columnNames)
  .enter()
  .append("th")
  .text(function (columnNames) { return columnNames; })
  .on("mouseover", sort)
  .on("click", function(d){
    rows.sort(function(a, b) {
      if (a[d] < b[d]) { return -1; }
      else if (a[d] > b[d]) { return 1; }
      else{ return 0; }
    }); 
  });

// Add rows
var rows = tbody.selectAll("tr")
  .data(sortedData)
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
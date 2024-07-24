//TODO: fix bug with repub hover
var x_ticks = [0,5] 

// set the dimensions and margins of the graph
var margin = {top: 20, right: 30, bottom: 40, left: 90},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("body")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// create a tooltip and helper functions
var Tooltip = d3.select("body")
.append("div")
.style("opacity", 0)
.attr("class", "tooltip")
.style("background-color", "white")
.style("border", "solid")
.style("border-width", "2px")
.style("border-radius", "5px")
.style("padding", "5px")
.style("position", "absolute")
var mouseover = function(d) {
  Tooltip
    .style("opacity", 1)
//   d3.select(this)
//     .style("stroke", "black")
//     .style("opacity", 1)
// }
// var mousemove = function(d) {
  var header = "<p style='text-align:left;'>Democrat<span style='float:right;'>Republican</span></p>";
  var candidates = "<p style='text-align:left;'>"+d.Democrat+"<span style='float:right;'>"+d.Republican+"</span></p>";
  var winner_label = "";
  if (winnerParty(d) == "Democrat")
  {
    winner_label = "<p style='text-align:left;'>Winner</p><br>";
  } else{
    winner_label = "<p style='text-align:left;'><span style='float:right;'>Winner</p><br>";
  }
  var gallup_result = "<p>Gallup - " + (winnerParty(d) === d.Gallup).toString().toUpperCase() + "</p>";
  var keys_result = "<p>The Keys to the White House - " + (winnerParty(d) === d.The_Keys_to_the_White_House).toString().toUpperCase() + "</p>";
  var sandp_result = "<p>S&P 500 - " + (winnerParty(d) === d.SandP_500).toString().toUpperCase() + "</p>";

  var content = header + candidates + winner_label + gallup_result + keys_result + sandp_result;
  Tooltip
    .html(content)
    .style("left", (d3.mouse(this)[0]+width/2) + "px")
    .style("top", (d3.mouse(this)[1]+height/8) + "px")
}
var mouseleave = function(d) {
  Tooltip
    .style("opacity", 0)
//   d3.select(this)
//     .style("stroke", "none")
//     .style("opacity", 0.8)
}
  
// Parse and plot the data
d3.csv("predictions.csv", function(err, predictions) {
  var y_years = [];
  for (var i = 0; i < predictions.length; i++)
  {
    y_years.unshift(predictions[i].Year);
  }
  y_years.push(predictions.Year)

  /////////////////////////
  // RIGHT SIDE OF GRAPH //
  /////////////////////////

  // Add X axis
  var x_right = d3.scaleLinear()
    .domain(x_ticks)
    .range([ 0, width/2])
    svg.append("g")
    .style("font", "18px sans-serif")
    .style('pointer-events', 'none')
    .attr("transform", "translate(" + width/2 + "," + height + ")")
    .call(d3.axisBottom(x_right).tickFormat(d3.format('.0f')).tickValues([0,1,2,3,4,5]))
    .selectAll("text")
      .attr("transform", "translate(10,0)")
      .style("text-anchor", "end")

  // Y axis
  var y_right = d3.scaleBand()
    .domain(y_years)
    .range([ 0, height ])
    .padding(.3)
    svg.append("g")
    .style("font", "16px sans-serif")
    .style('pointer-events', 'none')
    .attr("transform", "translate(" + width/2 + ",0)")
    .call(d3.axisLeft(y_right).tickSizeOuter(0).tickSizeInner(0))

  //Bars
  svg.selectAll("rect_right")
    .data(predictions)
    .enter()
    .append("rect")
    .attr("x", x_right(0) )
    .attr("y", function(d) { return y_right(d.Year); })
    .attr("width", function(d) { return rowCount(d, "Republican", x_right); })
    .attr("height", function(d) { return  boldWinner("Republican", y_right, d) ; } )
    .attr("fill", "red")
    .attr("transform", "translate(" + width/2 + ",0)")
    .on("mouseover", mouseover)
    //.on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

    ////////////////////////
    // LEFT SIDE OF GRAPH //
    ////////////////////////

    // Add X axis
    var x_left = d3.scaleLinear()
    .domain(x_ticks.reverse())
    .range([ 0, width/2])
    svg.append("g")
        .style("font", "16px sans-serif")
        .style('pointer-events', 'none')
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x_left).tickFormat(d3.format('.0f')).tickValues([1,2,3,4,5]))
        .selectAll("text")
        .attr("transform", "translate(0,0)")
        .style("text-anchor", "end");

    // Y axis, no use in duplicating, but using a new variable name for clarity
    var y_left = y_right;

    //Bars
    svg.selectAll("rect_left")
    .data(predictions)
    .enter()
    .append("rect")
    .attr("x", 0 )
    .attr("y", function(d) { return y_left(d.Year); })
    .attr("width", function(d) { return  rowCount(d, "Democrat", x_left) - margin.bottom; }) 
    .attr("height", function(d) { return  boldWinner("Democrat", y_left, d) ; } )
    .attr("fill", "blue")
    .attr("transform", "translate(" + (width/2 - margin.bottom) + ",0)scale(-1,1)") //scale to flip over y axis and mirror bars 
    .on("mouseover", mouseover)
    //.on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

    ///////////////////////
    /// ADD ANNOTATIONS ///
    ///////////////////////

    const anno_1 = [{
        note: {
        label: "Since 1936, these are the years which various forecasting methods have disagreed",
        bgPadding: 20,
        title: "Years of Interest"
        },
        //can use x, y directly instead of data
        x:565,
        y:75,
        dy: 137,
        dx: 150
    }]
    const anno_2 = [{x:565, y:200, dy: 70, dx: 80}]
    const anno_3 = [{x:565, y:360, dy: -15, dx: 90}]
    const anno_4 = [{x:497, y:390, dy: -25, dx: 160}]
    const anno_5 = [{x:565, y:460, dy: -95, dx: 120}]
    const anno_6 = [{x:565, y:550, dy: -185, dx: 140}]
    const anno_7 = [{x:497, y:610, dy: -245, dx: 200}]
   
    d3.select("svg")
        .append("g")
        .attr("class", "annotation-group")
        .call(d3.annotation().notePadding(15).type(d3.annotationLabel).annotations(anno_1))
    d3.select("svg")
        .append("g")
        .attr("class", "annotation-group")
        .call(d3.annotation().notePadding(15).type(d3.annotationLabel).annotations(anno_2))
    d3.select("svg")
        .append("g")
        .attr("class", "annotation-group")
        .call(d3.annotation().notePadding(15).type(d3.annotationLabel).annotations(anno_3))
    d3.select("svg")
        .append("g")
        .attr("class", "annotation-group")
        .call(d3.annotation().notePadding(15).type(d3.annotationLabel).annotations(anno_4))
    d3.select("svg")
        .append("g")
        .attr("class", "annotation-group")
        .call(d3.annotation().notePadding(15).type(d3.annotationLabel).annotations(anno_5))
    d3.select("svg")
        .append("g")
        .attr("class", "annotation-group")
        .call(d3.annotation().notePadding(15).type(d3.annotationLabel).annotations(anno_6))
    d3.select("svg")
        .append("g")
        .attr("class", "annotation-group")
        .call(d3.annotation().notePadding(15).type(d3.annotationLabel).annotations(anno_7))
});


function rowCount(predictions, string, x)
{
    var count = 0;
    for (let key in predictions) {
        if(key !== "Year" && predictions[key] === string)
        {
            count++;
        }
    }
    console.log(predictions.Year + ": " + string + " - " + count);
    if (string === "Democrat") {
        count = 5 - count;
    }
    return x(count); 
}

function boldWinner(string, y, predictions)
{
    var bold = .75;
    if (winnerParty(predictions) === string)
    {
        bold = 1.25
    }
    return y.bandwidth() * bold;
}

function winnerParty(predictions)
{
    var party = "";
    if (predictions.Winner === predictions.Democrat)
    {
        party = "Democrat";
    }
    if (predictions.Winner === predictions.Republican)
    {
        party = "Republican";
    }
    return party;
}
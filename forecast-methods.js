//https://d3-graph-gallery.com/graph/pie_changeData.html
// set the dimensions and margins of the graph
var width = 800
    height = 800
    margin = 40
// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
var radius = Math.min(width, height) / 2 - margin
// append the svg object to the div called 'body'
var svg = d3.select("body")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
// set the color scale
var pie_mapping = d3.scaleOrdinal().range(["green", "red"]).domain(["Correct", "Incorrect"])

var pred_gallup = {"Correct": 0, "Incorrect": 0};
var pred_keys   = {"Correct": 0, "Incorrect": 0};
var pred_sandp  = {"Correct": 0, "Incorrect": 0};
var pred_total  = {"Correct": 0, "Incorrect": 0};
d3.csv("predictions.csv", function(err, predictions) {
  for (var i = 0; i < predictions.length; i++)
  {
    var gallup_result = winnerParty(predictions[i], predictions[i].Gallup);
    var keys_result = winnerParty(predictions[i], predictions[i].The_Keys_to_the_White_House);
    var sandp_result = winnerParty(predictions[i], predictions[i].SandP_500);
    pred_gallup[gallup_result]++;
    pred_keys[keys_result]++;
    pred_sandp[sandp_result]++;
    pred_total[groupVote([gallup_result, keys_result, sandp_result])]++
  }
});

// Uses HTML parameter to update the which data is displayed
function update(data, method) {
  displayText(method);

  // Define tooltip and helper functions
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
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }
  var mousemove = function(d) {
    Tooltip
      .html(((d.value / 22) * 100).toFixed(2) + "%")
      .style("left", (d3.mouse(this)[0]+width/2) + "px")
      .style("top", (d3.mouse(this)[1]+height/2 + height/4) + "px")
  }
  var mouseleave = function(d) {
    Tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }

  // Compute the position of each group on the pie:
  var pie = d3.pie()
  .value(function(d) {return d.value; })
  .sort(function(a, b) {return d3.ascending(a.key, b.key);} ) 
  var data_ready = pie(d3.entries(data))
  console.log(data_ready)
  // map to data
  var pie_data = svg.selectAll("path")
  .data(data_ready)
  pie_data
  .enter()
  .append('path')
  .merge(pie_data)
  .attr('d', d3.arc()
    .innerRadius(0)
    .outerRadius(radius))
  .attr('fill', function(d){ return(pie_mapping(d.data.value)) })
  .attr("stroke", "white")
  .style("stroke-width", "2px")
  .style("opacity", 1)
  .on("mouseover", mouseover)
  .on("mousemove", mousemove)
  .on("mouseleave", mouseleave)

  // remove the group that is not present anymore
  pie_data.exit().remove()
}

function winnerParty(predictions, source_pred)
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
    var result = "Incorrect";
    if (party === source_pred) {
      result = "Correct";
    }
    return result;
}

//https://stackoverflow.com/questions/1053843/get-the-element-with-the-highest-occurrence-in-an-array
function groupVote(votes)
{
  var choice = votes.reduce((a,b,i,arr)=>(arr.filter(v=>v===a).length>=arr.filter(v=>v===b).length?a:b),null)
  return choice
}

function displayText(method)
{
  var title = document.getElementById("method_name");
  var paragraph = document.getElementById("method_desc");
  if (method === "gallup")
  {
    title.textContent = "Gallup Poll";
    paragraph.textContent = "Founded in 1935, Gallup uses voter surveys to predict election outcomes.";
  }
  if (method === "keys")
  {
    title.textContent = "The Keys to the White House";
    paragraph.textContent = "Derived by Allan Lichtman and Vladimir Keilis-Borok, this method considers 13 conditions, or 'keys', which determine if the incumbent party will win or lose.";
  } 
  if (method === "sandp")
  {
    title.textContent = "S&P 500";
    paragraph.textContent = "Uncredited, this method dictates that if the S&P 500 increased in value within the 3 months before the election, the incumbent party will win.";
  } 
  if (method === "all")
  {
    title.textContent = "All Forecasting Methods";
    paragraph.textContent = "This takes the average or 'group vote' of the other methods. ";
    paragraph.textContent += "For instance, if two forecasting methods predict 'Republican' and one predicts 'Democrat', this will predict 'Republican'.";
  }
}
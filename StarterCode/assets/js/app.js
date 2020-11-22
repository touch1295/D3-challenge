// @TODO: YOUR CODE HERE!
// Section 1: Pre-Data Setup
var svgWidth = 960;
var svgHeight = 700;

var margin = {
  top: 30,
  right: 40,
  bottom: 200,
  left: 100,
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(healthData, (d) => d[chosenXAxis]) * 0.8,
      d3.max(healthData, (d) => d[chosenXAxis]) * 1.2,
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(healthData, chosenYAxis) {
  var yLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(healthData, (d) => d[chosenYAxis]) * 0.8,
      d3.max(healthData, (d) => d[chosenYAxis]) * 1.2,
    ])
    .range([height, 0]);

  return yLinearScale;
}

function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition().duration(1000).call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition().duration(1000).call(leftAxis);

  return yAxis;
}

function renderCircles(
  circlesGroup,
  newXScale,
  chosenXAxis,
  newYScale,
  chosenYAxis
) {
  circlesGroup
    .transition()
    .duration(1000)
    .attr("cx", (d) => newXScale(d[chosenXAxis]))
    .attr("cy", (d) => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

function renderTexts(
  textGroup,
  newXScale,
  chosenXAxis,
  newYScale,
  chosenYAxis
) {
  textGroup
    .transition()
    .duration(1000)
    .attr("x", (d) => newXScale(d[chosenXAxis]))
    .attr("y", (d) => newYScale(d[chosenYAxis]));

  return textGroup;
}

// function used for updating circles group with new tooltip
// Tool tip and tool tip event listeners

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  if (chosenXAxis === "poverty") {
    var label = "Poverty :";
  } else if (chosenXAxis === "age") {
    var label = "Age :";
  } else {
    var label = "Income :";
  }

  if (chosenYAxis === "obesity") {
    var ylabel = "Obesity :";
  } else if (chosenYAxis === "smokes") {
    var ylabel = "Smokes :";
  } else {
    var ylabel = "Health Care :";
  }

  //var ylabel = "obesity :";

  var toolTip = d3
    .tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function (d) {
      return `${d.state}<br>${label} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`;
    });

  circlesGroup.call(toolTip);

  circlesGroup
    .on("mouseover", function (data) {
      toolTip.show(data);
    })

    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Import the .csv file.
// ====================================
// This data file includes state-by-state demographic data from the US Census and measurements from health risks obtained by the
//        Behavioral Risk Factor Surveillance System.
// Import our CSV data with d3's .csv import method.
d3.csv("./assets/data/data.csv")
  .then(function (healthData, err) {
    if (err) throw err;

    healthData.forEach(function (data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.obesity = +data.obesity;
      data.income = +data.income;
      data.smokes = +data.smokes;
      data.healthcare = +data.healthcare;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(healthData, chosenXAxis);

    // yLinearScale function above csv import
    var yLinearScale = yScale(healthData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup
      .append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    var yAxis = chartGroup.append("g").classed("y-axis", true).call(leftAxis);

    // Append Axes to the chart
    var circlesGroup = chartGroup
      .selectAll("circle")
      .data(healthData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xLinearScale(d[chosenXAxis]))
      .attr("cy", (d) => yLinearScale(d[chosenYAxis]))
      .attr("r", 15)
      .attr("fill", "blue")
      .attr("opacity", ".5");

    //Append Axes to the chart
    var textsGroup = chartGroup
      .selectAll(".stateText")
      .data(healthData)
      .enter()
      .append("text")
      .classed("stateText", true)
      .attr("x", (d) => xLinearScale(d[chosenXAxis]))
      .attr("y", (d) => yLinearScale(d[chosenYAxis]))
      .attr("dx", -8)
      .attr("dy", 3)
      .attr("font-size", "10px")
      .attr("fill", "pink")
      .text(function (d) {
        return d.abbr;
      });

    // Create group for  3 x- axis labels
    var xlabelsGroup = chartGroup
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty")
      .classed("active", true)
      .text("poverty (%)");

    var ageLabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age")
      .classed("inactive", true)
      .text("age (median)");

    var incomesLabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income")
      .classed("inactive", true)
      .text("Income (median)");

    var yLabelsGroup = chartGroup
      .append("g")
      .attr("transform", `translate(${0 - margin.left / 4}, ${height / 2})`);

    var obesityLabel = yLabelsGroup
      .append("text")
      .classed("active", true)
      .attr("x", 0)
      .attr("y", 0 - 80)
      .attr("dy", "1em")
      .attr("transform", "rotate(-90)")
      .attr("value", "obesity")
      .text("Obesity (%)");

    var smokesLabel = yLabelsGroup
      .append("text")
      .classed("inactive", true)
      .attr("x", 0)
      .attr("y", 0 - 60)
      .attr("dy", "1em")
      .attr("transform", "rotate(-90)")
      .attr("value", "smokes")
      .text("Smokes (median)");

    var healthcareLabel = yLabelsGroup
      .append("text")
      .classed("inactive", true)
      .attr("x", 0)
      .attr("y", 0 - 40)
      .attr("dy", "1em")
      .attr("transform", "rotate(-90)")
      .attr("value", "healthcare")
      .text("healthcare (median)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    d3.selectAll("text").on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");

      // changes classes to change bold text
      if (value === "poverty") {
        chosenXAxis = value;

        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        povertyLabel.classed("active", true).classed("inactive", false);
        ageLabel.classed("active", false).classed("inactive", true);
        incomesLabel.classed("active", false).classed("inactive", true);
      } else if (value === "age") {
        // replaces chosenXAxis with value
        chosenXAxis = value;
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        povertyLabel.classed("active", false).classed("inactive", true);
        ageLabel.classed("active", true).classed("inactive", false);
        incomesLabel.classed("active", false).classed("inactive", true);
      } else if (value === "income") {
        // replaces chosenXAxis with value
        chosenXAxis = value;

        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        povertyLabel.classed("active", false).classed("inactive", true);
        ageLabel.classed("active", false).classed("inactive", true);
        incomesLabel.classed("active", true).classed("inactive", false);
      } else if (value === "obesity") {
        // replaces chosenYAxis with value
        chosenYAxis = value;

        // updates y scale for new data
        yLinearScale = yScale(healthData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        obesityLabel.classed("active", true).classed("inactive", false);
        smokesLabel.classed("active", false).classed("inactive", true);
        healthcareLabel.classed("active", false).classed("inactive", true);
      } else if (value === "smokes") {
        // replaces chosenYAxis with value
        chosenYAxis = value;

        // updates y scale for new data
        yLinearScale = yScale(healthData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        obesityLabel.classed("active", false).classed("inactive", true);
        smokesLabel.classed("active", true).classed("inactive", false);
        healthcareLabel.classed("active", false).classed("inactive", true);
      } else if (value === "healthcare") {
        // replaces chosenYAxis with value
        chosenYAxis = value;

        // updates y scale for new data
        yLinearScale = yScale(healthData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        obesityLabel.classed("active", false).classed("inactive", true);
        smokesLabel.classed("active", false).classed("inactive", true);
        healthcareLabel.classed("active", true).classed("inactive", false);
      }

      circlesGroup = renderCircles(
        circlesGroup,
        xLinearScale,
        chosenXAxis,
        yLinearScale,
        chosenYAxis
      );

      textsGroup = renderTexts(
        textsGroup,
        xLinearScale,
        chosenXAxis,
        yLinearScale,
        chosenYAxis
      );

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    });
  })
  .catch(function (error) {
    console.log(error);
  });

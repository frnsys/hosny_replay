import * as d3 from 'd3';

const maxNumberOfRecords = 51;

function getDate(d) {
  return new Date(d);
}

function humanFormat(v) {
  var _v = Math.abs(v);
  if (_v >= .9995e9) {
    return (v/1e9).toFixed(1) + "B";
  } else if (_v >= .9995e6) {
    return (v/1e6).toFixed(1) + "M";
  } else if (_v >= .9995e3) {
    return (v/1e3).toFixed(1) + "k";
  } else if (_v < .9995e-2) {
    return d3.format('.1e')(v);
  }
  return v.toFixed(1);
}

class Graph {
  constructor(container, className, width, height, yLabel, axis) {
    this.data = [];
    this.name = className;
    this.axis = axis === undefined ? true : axis;

    var margin = {top: 20, right: 20, bottom: 30, left: 50};
    var svg = d3.select(container)
        .append("div").attr("class", "graph-shell " + className)
        .append("svg")
          .attr("width", width)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var self = this;
    this.x = d3.scaleTime().range([0, width - (margin.left + margin.right)]);
    this.y = d3.scaleLinear().range([height, 0]);
    this.line = d3.line()
      .x(function(d) { return self.x(getDate(d.time)); })
      .y(function(d) { return self.y(d.value); });

    this.xAxis = d3.axisBottom(this.x)
          .ticks(5)
          .tickFormat(d3.timeFormat('%b %d'));

    this.yAxis = d3.axisLeft(this.y)
          .ticks(10)
          .tickFormat(humanFormat);

    if (this.axis) {
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(this.xAxis);

      svg.append("g")
        .attr("class", "y axis")
        .call(this.yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".5em")
        .style("text-anchor", "end")
        .text(yLabel);
    }

    svg.append("path")
      .datum(this.data)
      .attr("class", "line")
      .attr("d", this.line);
  }

  update(data) {
    this.data = this.data.concat(data)

    // remove old data (i.e., avoid overflows)
    while (this.data.length > maxNumberOfRecords) {
      delete this.data.shift();
    }

    // scale data range
    this.x.domain([getDate(this.data[0].time), getDate(this.data[this.data.length-1].time)]);
    this.y.domain([d3.min(this.data, function(d) { return d.value; }),
                    d3.max(this.data, function(d) { return d.value; })]);

    var svg = d3.select("."+this.name).transition();
    svg.select(".line")   // change the line
        .duration(500)
        .attr("d", this.line(this.data));
    svg.select(".x.axis") // change the x axis
        .duration(500)
        .call(this.xAxis);
    svg.select(".y.axis") // change the y axis
        .duration(500)
        .call(this.yAxis);
  }
}

export default Graph;

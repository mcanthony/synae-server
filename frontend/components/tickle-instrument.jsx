import React from 'react/addons';
import d3 from 'd3';

var MAX_NODES = 20;
var GRAVITY = 0.02;
var CHARGE = -90;
var RADIUS = 35;

export default class extends React.Component {
  componentDidMount() {
    var mount = React.findDOMNode(this);
    var width = mount.getBoundingClientRect().width;
    var height = mount.getBoundingClientRect().height;
    var bubbles = [];
    var interval;
    var svg;
    var d3nodes;
    var sim;

    function tick() {
      d3nodes = svg.selectAll('.bubble')
        .data(bubbles)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
    }

    function bounce() {
      bubbles.forEach(bubble => {
        bubble.x += (Math.random() * 120 - 60);
        bubble.y += (Math.random() * 120 - 60);
      })

      sim.resume();
    }

    svg = d3.select('.tickle-svg')
      .attr('width', width)
      .attr('height', height)
      .on('mousedown', bounce)
      .on('touchstart', bounce);

    sim = d3.layout.force()
      .nodes(bubbles)
      .gravity(GRAVITY)
      .charge(CHARGE)
      .size([width, height])
      .on('tick', tick);

    // d3nodes = svg.selectAll('.bubble')
    //   .data(bubbles);

    interval = setInterval(() => {
      bubbles.push({id: bubbles.length});
      sim.start();

      d3nodes = svg.selectAll('.bubble')
      .data(bubbles)
      .enter()
        .append('circle')
        .attr('class', 'bubble')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', RADIUS)
        .style('fill', 'skyblue');

      if (bubbles.length >= MAX_NODES) {
        clearInterval(interval);
      }
    })

  }

  render() {
    return (
      <div className='tickle-container'>
        <svg className='tickle-svg'></svg>
      </div>
    );
  }
}
import React from 'react/addons';
import d3 from 'd3';
import binaryXHR from 'binary-xhr';

var MAX_NODES = 20;
var GRAVITY = 0.03;
var CHARGE = -30;
var RADIUS = 20;
var DT = 500;
var buffer;

export default class extends React.Component {

  static propTypes = {
    actx: React.PropTypes.object.isRequired,
    sample: React.PropTypes.string.isRequired,
    instructions: React.PropTypes.string.isRequired
  }

  state = {
    isLoading : true
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !nextState.isLoading;
  }

  componentDidMount() {
    let {actx} = this.props;
    this.gain = actx.createGain();
    this.gain.connect(actx.destination);
    this.gain.value = 1;

    binaryXHR(this.props.sample, (err, data) => {
      actx.decodeAudioData(data, b => {
        buffer = b;
        this.setState({ isLoading: false });
      });
    });
  }

  componentDidUpdate() {
    var mount = React.findDOMNode(this);
    var width = mount.getBoundingClientRect().width;
    var height = mount.getBoundingClientRect().height;
    var me = this;
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

    function bounce(ev) {
      bubbles.forEach(bubble => {
        bubble.x += (Math.random() * 60 - 30);
        bubble.y += (Math.random() * 60 - 30);
      })

      me.playSound();
      sim.resume();
    }

    svg = d3.select('.tickle-svg')
      .attr('width', width)
      .attr('height', height)
      // .on('mousedown', bounce)
      .on('touchstart', bounce);

    sim = d3.layout.force()
      .nodes(bubbles)
      .gravity(GRAVITY)
      .charge(CHARGE)
      .size([width, height])
      .on('tick', tick);

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
        .attr('r', 0)
        .style('fill', 'skyblue')
        .transition()
        .duration(350)
        .ease('bounce')
        .attr('r', RADIUS);

      if (bubbles.length >= MAX_NODES) {
        clearInterval(interval);
      }
    }, DT)
  }

  playSound() {
    let {actx} = this.props;
    let sample = actx.createBufferSource();
    sample.buffer = buffer;
    sample.connect(this.gain)
    sample.onended = () => { sample.disconnect(); }
    sample.start();
  }

  render() {
    return (
      <div className='tickle-container'>
        <svg className='tickle-svg'></svg>
      </div>
    );
  }
}
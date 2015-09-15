import React from 'react/addons';
import d3 from 'd3';
import binaryXHR from 'binary-xhr';

var MAX_NODES = 20;
var GRAVITY = 0.03;
var CHARGE = -30;
var RADIUS = 20;
var DT = 500;

let throttle = (fn, min) => {
  let prev = Date.now();
  return () => {
    let now = Date.now();
    if (now - prev > min) {
      fn();
      prev = now;
    }
  }
}

export default class extends React.Component {

  static propTypes = {
    actx: React.PropTypes.object.isRequired,
    sample: React.PropTypes.string.isRequired,
    instructions: React.PropTypes.string.isRequired,
    iconUrl: React.PropTypes.string.isRequired
  }

  state = {
    isLoading: true,
    buffer: null
  }

  constructor (props) {
    super(props);
    this.playSound = throttle(this.playSound.bind(this), 1000);
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
        this.setState({ buffer: b, isLoading: false });
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

    let bounce = (ev) => {
      bubbles.forEach(bubble => {
        let range = 10;
        bubble.x += (Math.random() * 2 * range - range);
        bubble.y += (Math.random() * 2 * range - range);
      })

      this.playSound();
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
    sample.buffer = this.state.buffer;
    sample.connect(this.gain)
    sample.onended = () => { sample.disconnect(); }
    sample.start();
  }

  render() {
    return (
      <div style={{
          backgroundImage: 'url(' + this.props.iconUrl + ')',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          height: '100%'
        }} className='tickle-container'>
        <div style={{
          position: 'absolute',
          top: '0px',
          left: '0px'
        }}><p>{this.props.instructions}</p></div>
        <svg className='tickle-svg'></svg>
      </div>
    );
  }
}
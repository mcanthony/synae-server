import v3 from 'pocket-physics/v3';
import accelerate from 'pocket-physics/accelerate3d';
import inertia from 'pocket-physics/inertia3d';
import constrain from 'pocket-physics/distanceconstraint3d';
import drag from 'pocket-physics/drag3d';

import React from 'react/addons';
import binaryXHR from 'binary-xhr';

const CONSTRAINT_ITERATIONS = 3;
const DRAG = 0.99;
const HUE_GRADATIONS = 30;
const TIMESTEP = 100;
const DENSITY = 10;

export default class extends React.Component {
  
  static propTypes = {
    actx: React.PropTypes.object.isRequired,
    sample: React.PropTypes.string.isRequired,
    instructions: React.PropTypes.string.isRequired
  }

  state = {
    buffer: null
  }

  running = true;

  hues = null;
  cvs = null;
  ctx = null;
  points = null;
  constraints = null;

  boxWidth = 0;
  maxZVelocity = 100;

  sizeup = () => {
    this.cvs.width = window.innerWidth;
    this.cvs.height = window.innerHeight;
  }

  componentDidMount () {

    let {actx} = this.props;
    this.gain = actx.createGain();
    this.gain.connect(actx.destination);
    this.gain.value = 1;

    binaryXHR(this.props.sample, (err, data) => {
      actx.decodeAudioData(data, b => {
        this.setState({ buffer: b, isLoading: false });
        this.tick();
      });
    });

    let cvs = this.cvs = React.findDOMNode(this).querySelector('canvas');
    let ctx = this.ctx = cvs.getContext('2d');

    window.addEventListener('resize', this.sizeup, false);
    this.sizeup();

    let points = this.points = [];
    let constraints = this.constraints = [];

    let boxWidth = this.boxWidth = Math.floor(Math.max(cvs.width, cvs.height) / DENSITY);

    this.hues = huemaster(HUE_GRADATIONS, '80%', '67%', '1');

    let pointCountX = this.pointCountX = DENSITY;
    let pointCountY = this.pointCountY = Math.floor(cvs.height / boxWidth);
    var totalPointCount = pointCountX * pointCountY;

    for (var i = 0; i < totalPointCount; i++) {

      var ix = i % pointCountX;
      var iy = Math.floor(i / pointCountX);

      var point = {
        id: ix + ',' + iy,
        cpos: { x: ix * boxWidth, y: iy * boxWidth, z: 0 },
        ppos: { x: ix * boxWidth, y: iy * boxWidth, z: 0 },
        acel: { x: 0, y: 0, z: 0 },
        mass: 5.5
      }

      var idx = points.push(point) - 1;

      var up = idx - pointCountX;
      var ur = idx - pointCountX + 1;
      var ul = idx - pointCountX - 1;
      var rt = idx + 1;
      var lt = idx - 1;
      var dn = idx + pointCountX;
      var dr = idx + pointCountX + 1;
      var dl = idx + pointCountX - 1;

      var isRightEdge = idx % pointCountX === pointCountX - 1;
      var isLeftEdge = idx % pointCountX === 0;
      var isFirstRow = idx < pointCountX;
      var isLastRow = idx >= totalPointCount - pointCountX;

      var dist;

      if (!isRightEdge && !isFirstRow) {
        constraints.push( [point, points[ur], v3.distance(point.cpos, points[ur].cpos)] );
      }

      if (!isFirstRow) {
        constraints.push( [point, points[up], v3.distance(point.cpos, points[up].cpos)] );
      }

      if (!isLeftEdge) {
        constraints.push( [point, points[lt], v3.distance(point.cpos, points[lt].cpos)] );
      }

      if (!isLeftEdge && !isFirstRow) {
        constraints.push( [point, points[ul], v3.distance(point.cpos, points[ul].cpos)] );
      }
    }

    points[0].mass = 0;
    points[pointCountX - 1].mass = 0;
    points[points.length-1].mass = 0;
    points[points.length-pointCountX].mass = 0;

    //debugDrawConstraints(ctx, constraints);
    this.drawSquares();
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.sizeup, false);
    this.running = false;
  }

  drawSquares () {
    let {ctx, points, boxWidth, maxZVelocity} = this;

    for (var i = 0; i < points.length; i++) {
      var cpos = points[i].cpos;
      var ppos = points[i].ppos;
      var velz = cpos.z - ppos.z;
      var h = (velz / maxZVelocity) * 360 //Math.PI * 2;
      var cameraZ = 100;

      var distRatio = cpos.z / cameraZ;
      var w = boxWidth + (distRatio * boxWidth);
      var h = boxWidth + (distRatio * boxWidth);
      var x = cpos.x - ((distRatio * boxWidth) / 2);
      var y = cpos.y - ((distRatio * boxWidth) / 2)

      ctx.beginPath();
      ctx.fillStyle = this.hues(h);
      ctx.fillRect(x, y, w, h);
    }
  }

  tick = () => {
    if (!this.running) return;
    let {ctx, cvs, points, constraints} = this;

    /*for (i = 0; i < points.length; i++) {
      if (
        Math.random() > 0.30
        && i !== 0
        && i !== pointCountX - 1
        && i !== points.length - 1
        && i !== points.length - pointCountX
      ) {
        points[i].acel.z += ((maxZVelocity * Math.random()) - (maxZVelocity/2)) * 0.01
      }
    }*/

    ctx.clearRect(0, 0, cvs.width, cvs.height);
    this.drawSquares();

    var i;
    var cdata;

    for (i = 0; i < points.length; i++) {
      accelerate(points[i], TIMESTEP);
    }

    for (var j = 0; j < CONSTRAINT_ITERATIONS; j++)
    for (i = 0; i < constraints.length; i++) {
      cdata = constraints[i];
      constrain(cdata[0], cdata[1], cdata[2]);
    }

    for (i = 0; i < points.length; i++) {
      drag(points[i], DRAG);
      inertia(points[i], TIMESTEP);
    }

    requestAnimationFrame(this.tick);
  }

  touchClick = (e) => {
    let x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    let y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

    let ix = Math.floor(x / this.boxWidth);
    let iy = Math.floor(y / this.boxWidth);
    let i = iy * this.pointCountX + ix
    let point = this.points[i];

    if (!point
      || i == 0
      && i == this.pointCountX - 1
      && i == this.points.length - 1
      && i == this.points.length - this.pointCountX) return;

    point.acel.z += this.maxZVelocity * 10;
    this.playSound();
  }

  playSound() {
    let {actx} = this.props;
    let sample = actx.createBufferSource();
    sample.buffer = this.state.buffer;
    sample.connect(this.gain)
    sample.onended = () => { sample.disconnect(); }
    sample.start();
  }

  render () {
    return <div>
      <canvas
        onTouchEnd={this.touchClick}
        onClick={this.touchClick}></canvas>
    </div>
  }
}








function debugDrawConstraints(ctx, constraints) {
  ctx.lineStyle = '2px black solid';
  for (var i = 0; i < constraints.length; i++) {
    var cdata = constraints[i];
    ctx.moveTo(cdata[0].cpos.x, cdata[0].cpos.y);
    ctx.lineTo(cdata[1].cpos.x, cdata[1].cpos.y);
    ctx.stroke();
  }
}

function debugDrawPoints(ctx, points) {
  for (var i = 0; i < points.length; i++) {
    var cpos = points[i].cpos;
    ctx.beginPath();
    ctx.arc(cpos.x, cpos.y, 5, 0, Math.PI*2, false);
    ctx.fill();
  }
}


function huemaster(gradations, s, l, a) {
  var hexes = []
  var circle = 360

  var inc = (circle / gradations);
  for (var i = 0; i < gradations; i++) {
    var h = (i/gradations) * circle;
    hexes.push( HSLtoRGB(h, s, l, a) );
  }

  return function(h) {
    var i = Math.floor((h / circle) * gradations);
    return hexes[i];
  }
}

// https://github.com/kamicane/rgb/blob/76045440a8e9416d828a0c44c6d9009fdb674253/index.js#L57

function HUEtoRGB(p, q, t){
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

function HSLtoRGB(h, s, l, a){
  var r, b, g
  if (a == null || a === "") a = 1
  h = parseFloat(h) / 360
  s = parseFloat(s) / 100
  l = parseFloat(l) / 100
  a = parseFloat(a) / 1
  if (h > 1 || h < 0 || s > 1 || s < 0 || l > 1 || l < 0 || a > 1 || a < 0) return null
  if (s === 0){
    r = b = g = l
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s
    var p = 2 * l - q
    r = HUEtoRGB(p, q, h + 1 / 3)
    g = HUEtoRGB(p, q, h)
    b = HUEtoRGB(p, q, h - 1 / 3)
  }
  return '#'
    + Math.floor(r * 255).toString(16)
    + Math.floor(g * 255).toString(16)
    + Math.floor(b * 255).toString(16);
}

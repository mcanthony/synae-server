import React from 'react/addons';
import debug from 'debug';

import devicemotion from '../devicemotion';
import motionsLowPass from '../motions-low-pass';

let dbg = debug('synae-server:client');

let avg = (...args) => {
  var sum = 0;
  var len = args.length;
  var count = 0;
  for (var i = 0; i < len; i++) {
    sum += args[i] * (len - i) // newest to oldest values
    count += i
  }
  return sum / count
}

export default class extends React.Component {

  motions = [];

  state = {
    motions: []
  }

  componentDidMount () {
    this.disconnectDeviceMotion = devicemotion((e) => {
      let { motions } = this.state;
      e.timestamp = Date.now();
      motions.unshift(e);

      if (motions.length > 10) motions.pop();
      this.setState({ motions });
    });
  }

  componentWillUnmount () {
    this.disconnectDeviceMotion();
  }

  render () {
    let textStyle = {
      fontSize: '32px',
      fontFamily: 'monospace',
      whiteSpace: 'pre'
    }

    let { motions } = this.state;

    let xS = avg(...motions.map(m => m.acceleration.x)).toFixed(5);
    let yS = avg(...motions.map(m => m.acceleration.y)).toFixed(5);
    let zS = avg(...motions.map(m => m.acceleration.z)).toFixed(5);
    let alpha = avg(...motions.map(m => m.rotationRate.alpha)).toFixed(5);
    let beta = avg(...motions.map(m => m.rotationRate.beta)).toFixed(5);
    let gamma = avg(...motions.map(m => m.rotationRate.gamma)).toFixed(5);
    let dt = avg(...motions.reduce((all, m, i) => {
      if (i === motions.length - 1) return all;
      all.unshift(m.timestamp - motions[i + 1].timestamp);
      return all;
    }, [])).toFixed(5);

    if (motions.length < 2) return <div>Not enough motion data...</div>;

    let { x, y, z } = motionsLowPass(motions, 0.3);

    return <div>
      <p>There is a slight delay due to smoothing.</p>
      <p style={textStyle}>x {x[0] >= 0 && ' '}{x[0].toFixed(5)} {xS >= 0 && ' '}{xS}</p>
      <p style={textStyle}>y {y[0] >= 0 && ' '}{y[0].toFixed(5)} {yS >= 0 && ' '}{yS}</p>
      <p style={textStyle}>z {z[0] >= 0 && ' '}{z[0].toFixed(5)} {zS >= 0 && ' '}{zS}</p>
      <p style={textStyle}>alpha {alpha}</p>
      <p style={textStyle}>beta {beta}</p>
      <p style={textStyle}>gamma {gamma}</p>
      <p style={textStyle}>DT {dt}</p>
    </div>
  }
}
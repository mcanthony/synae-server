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
      motions.unshift({
        timestamp: Date.now(),
        event: e
      });

      if (motions.length > 10) motions.pop();
      this.setState({ motions });
    });
  }

  componentWillUnmount () {
    this.disconnectDeviceMotion();
  }

  render () {
    let textStyle = {
      fontSize: '32px'
    }

    let { motions } = this.state;

    let x = avg(...motions.map(m => m.event.acceleration.x)).toFixed(5);
    let y = avg(...motions.map(m => m.event.acceleration.y)).toFixed(5);
    let z = avg(...motions.map(m => m.event.acceleration.z)).toFixed(5);

    let alpha = avg(...motions.map(m => m.event.rotationRate.alpha)).toFixed(5);
    let beta = avg(...motions.map(m => m.event.rotationRate.beta)).toFixed(5);
    let gamma = avg(...motions.map(m => m.event.rotationRate.gamma)).toFixed(5);

    return <div>
      <p>There is a slight delay due to smoothing.</p>
      <p style={textStyle}>x {x}</p>
      <p style={textStyle}>y {y}</p>
      <p style={textStyle}>z {z}</p>
      <p style={textStyle}>alpha {alpha}</p>
      <p style={textStyle}>beta {beta}</p>
      <p style={textStyle}>gamma {gamma}</p>
    </div>
  }
}
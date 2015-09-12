import React from 'react/addons';
import debug from 'debug';

import devicemotion from '../devicemotion';

let dbg = debug('synae-server:client');

export default class extends React.Component {

  motions = [];

  state = {
    recording: false,
    motions: []
  }

  componentDidMount () {
    this.disconnectDeviceMotion = devicemotion((e) => {
      // TODO: put a window.performance.now()?
      if (this.state.recording === true) this.motions.push({
        timestamp: Date.now(),
        event: e
      });
    });
  }

  componentWillUnmount () {
    this.disconnectDeviceMotion();
  }

  beginRecording = () => {
    this.setState({ recording: true });
    this.motions.length = 0;
  }

  stopRecording = () => {
    let xformed = this.motions.map(m => {
      return {
        timestamp: m.timestamp,
        acceleration: m.event.acceleration,
        rotationRate: m.event.rotationRate
      }
    });

    this.setState({ recording: false, motions: xformed });
  }

  autoSelect = (e) => {
    let input = e.currentTarget;
    input.setSelectionRange(0, input.value.length+1);
  }

  complementaryFilter (motions) {
    let angleX = 0;
    let angleY = 0;
    let angleZ = 0;
    let lastTime = 0;
    let cfilter = (angle, gyro, acel, dt) => {
      return (0.98)*(angle + gyro*dt) + (0.02)*(acel)
    }
    return motions.reduce((ts, m) => {
      let dt = (m.timestamp - (lastTime || motions[0].timestamp)) / 1000;
      ts.x.push(cfilter(angleX, m.rotationRate.alpha, m.acceleration.x, dt));
      ts.y.push(cfilter(angleY, m.rotationRate.beta, m.acceleration.y, dt));
      ts.z.push(cfilter(angleZ, m.rotationRate.gamma, m.acceleration.z, dt));
      lastTime = m.timestamp;
      return ts;
    }, { x: [], y: [], z: [] });
  }

  toTimeSeries (motions) {
    return motions.reduce((ts, m) => {
      ts.x.push(m.acceleration.x);
      ts.y.push(m.acceleration.y);
      ts.z.push(m.acceleration.z);
      ts.alpha.push(m.rotationRate.alpha);
      ts.beta.push(m.rotationRate.beta);
      ts.gamma.push(m.rotationRate.gamma);
      return ts;
    }, {
      x: [], y: [], z: [],
      alpha: [], beta: [], gamma: []
    });
  }

  findMeatyStartEnd (values, threshold) {
    let start = 6;
    let end = values.length - 1;

    let test = (arr, idx, value) => {
      let prev = Math.abs(arr[idx - 1] || arr[0]);
      let curr = Math.abs(value);
      let next = Math.abs(arr[idx + 1] || arr[arr.length-1]);
      return curr >= threshold
        && (prev + curr) / 2 >= threshold * 1.2
        && (next + curr) / 2 >= threshold * 1.2
    }

    for (let i = start; i < values.length; i++) {
      let v = values[i];
      if (test(values, i, v)) {
        start = i;
        break;
      }
    }

    for (let i = values.length - 1; i >= 0; i--) {
      let v = values[i];
      if (test(values, i, v)) {
        end = i;
        break;
      }
    }

    return [start, end];
  }

  findMeatyStartEndForAll (series, threshold) {
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    series.forEach(s => {
      let [start, end] = this.findMeatyStartEnd(s, threshold);
      min = Math.min(min, start);
      max = Math.max(max, end);
    });
    return [min, max];
  }

  render () {
    let {motions} = this.state;
    let timeSeries = this.toTimeSeries(motions);
    let compSeries = this.complementaryFilter(motions);

    if (motions.length) {
      let {x, y, z} = timeSeries;
      let [start, end] = this.findMeatyStartEndForAll([x, y, z], 0.2);
      let meat = Object.keys(timeSeries).reduce((ts, k) => {
        ts[k] = timeSeries[k].slice(start, end+1);
        return ts
      }, {});
      let compMeat = this.complementaryFilter(motions.slice(start, end));
      console.log('motions')
      console.log(JSON.stringify(motions));
      console.log('timeSeries')
      console.log(JSON.stringify(timeSeries));
      console.log('compSeries')
      console.log(JSON.stringify(compSeries));
      console.log('timeSeries meat', start, end);
      console.log(JSON.stringify(meat));
      console.log('compSeries meat', start, end);
      console.log(JSON.stringify(compMeat));
    }

    return <div>
      <h1>Step 1: Record And Wave Device</h1>
      <p>
      {
        this.state.recording
        ? <button className='btn btn-primary' onClick={this.stopRecording}>STOP</button>
        : <button className='btn btn-primary' onClick={this.beginRecording}>RECORD</button>
      }
      </p>
      <h1>Step 2: Copy data and send it somewhere</h1>
      <div>
        <p>Raw Events ({motions.length})</p>
        <textarea
          value={JSON.stringify(motions, null, '  ')}
          onClick={this.autoSelect}
          className='col-12'
          style={{minHeight: '100px'}}></textarea>
        <p>Time Series ({motions.length})</p>
        <textarea
          value={JSON.stringify(timeSeries, null, '  ')}
          onClick={this.autoSelect}
          className='col-12'
          style={{minHeight: '100px'}}></textarea>
        <p>Complementary Filter ({compSeries.x.length})</p>
        <textarea
          value={JSON.stringify(compSeries, null, '  ')}
          onClick={this.autoSelect}
          className='col-12'
          style={{minHeight: '100px'}}></textarea>
      </div>
    </div>
  }
}
import debug from 'debug';
import React from 'react/addons';
import binaryXHR from 'binary-xhr';
import devicemotion from '../devicemotion';
import DTW from 'dtw';

let dbg = debug('synae-server:instrument:flutter');

export default class extends React.Component {

  static propTypes = {
    actx: React.PropTypes.object.isRequired,
    sample: React.PropTypes.string.isRequired
  }

  state = {
    buffer: null
  }

  motions = [];

  componentDidMount () {

    this.disconnectDeviceMotion = devicemotion((e) => {
      let { motions } = this;
      motions.unshift(e);
      if (motions.length > 10) motions.pop();

      let xs = motions.map(e => e.acceleration.x);
      let shakeDTW = new DTW();
      let stillDTW = new DTW();
      let shakeCost = shakeDTW.compute(xs, [-20, 0, 20, 0]);
      let stillCost = stillDTW.compute(xs, [0, 0, 0, 0]);

      if (shakeCost < stillCost) {
        dbg('dm cost: shake', shakeCost);
        dbg('dm cost: still', stillCost);
        //dbg('dm path: shake', shakeDTW.path());
        //dbg('dm path: still', stillDTW.path());
        this.triggerSound();
      }
    });

    let {actx} = this.props;
    this.gain = actx.createGain();
    this.gain.connect(actx.destination);
    this.gain.value = 1;

    dbg(this.props.sample);

    binaryXHR(this.props.sample, (err, data) => {
      actx.decodeAudioData(data, buffer => {
        this.setState({ buffer });
      });
    });
  }

  componentWillUnmount () {
    this.disconnectDeviceMotion();
  }

  triggerSound = () => {
    let {actx} = this.props;
    let sample = actx.createBufferSource();
    sample.buffer = this.state.buffer;
    sample.connect(this.gain)
    sample.onended = () => { sample.disconnect(); }
    sample.start();
  }

  render () {
    return this.state.buffer
      ? <div>
          <p>Turn up your volume, and turn any silent switches to OFF</p>
        </div>
      : <div>Fetching...</div>
  }
}

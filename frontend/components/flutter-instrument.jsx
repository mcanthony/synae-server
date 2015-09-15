import debug from 'debug';
import React from 'react/addons';
import binaryXHR from 'binary-xhr';
import devicemotion from '../devicemotion';
import DTW from 'dtw';
import dtwSum from '../dtw-sum';

let dbg = debug('synae-server:instrument:flutter');

export default class extends React.Component {

  static propTypes = {
    actx: React.PropTypes.object.isRequired,
    sample: React.PropTypes.string.isRequired,
    groupId: React.PropTypes.string.isRequired,
    instructions: React.PropTypes.string.isRequired,
    iconUrl: React.PropTypes.string.isRequired,
    minimumForce: React.PropTypes.number.isRequired
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

      let x = motions.map(e => e.acceleration.x);
      let y = motions.map(e => e.acceleration.y);
      let z = motions.map(e => e.acceleration.z);

      let force = this.props.minimumForce;
      let gesture = { x, y, z };
      let shake = [ -force, 0, force, 0 ];
      let recorded = { x: shake, y: shake, z: shake };
      let still = [0, 0, 0, 0];

      let shakeCost = dtwSum(gesture, recorded);
      let stillCost = dtwSum(gesture, { x: still, y: still, z: still });

      if (shakeCost < stillCost) {
        dbg('dm cost: shake', shakeCost);
        dbg('dm cost: still', stillCost);
        //dbg('dm path: shake', shakeDTW.path());
        //dbg('dm path: still', stillDTW.path());
        this.triggerSound();
        motions.length = 0;
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
      ? <div style={{
          backgroundImage: 'url(' + this.props.iconUrl + ')',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          height: '100%'
        }}>
          <p>{this.props.instructions}</p>
        </div>
      : <div>Fetching...</div>
  }
}

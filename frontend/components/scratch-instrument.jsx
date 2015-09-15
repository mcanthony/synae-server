import debug from 'debug';
import React from 'react/addons';
import binaryXHR from 'binary-xhr';
import devicemotion from '../devicemotion';
//import DTW from 'dtw';
import motionsLowPass from '../motions-low-pass';

let dbg = debug('synae-server:instrument:scrub');

export default class extends React.Component {

  static propTypes = {
    actx: React.PropTypes.object.isRequired,
    sample: React.PropTypes.string.isRequired,
    instructions: React.PropTypes.string.isRequired,
    iconUrl: React.PropTypes.string.isRequired
  }

  state = {
    buffer: null
  }

  motions = [];

  componentDidMount () {

    this.disconnectDeviceMotion = devicemotion((e) => {
      let { motions } = this;
      e.timestamp = Date.now();
      motions.push(e);
      if (motions.length > 32) motions.shift();
      if (motions.length < 2) return;

      let series = motionsLowPass(motions, 0.9);
      let ys = series.y;
      let majorityAreNegative = ys.filter(y => y <= -0.2).length > ys.length / 2;

      if (motions.length > 20 && majorityAreNegative) {
        dbg('majority');
        this.triggerSound();
        // blank out to prevent immediate subsequent matches, hopefully?
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
          <p>(Turn up your volume, and turn any silent switches to OFF)</p>
          <p>{this.props.instructions}</p>
        </div>
      : <div>Fetching...</div>
  }
}

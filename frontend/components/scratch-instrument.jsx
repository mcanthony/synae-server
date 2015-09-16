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
      if (motions.length > 16) motions.shift();
      if (motions.length < 2) return;

      let series = motionsLowPass(motions, 0.1);
      let ys = series.y;
      let majorityAreNegative = ys.filter(y => y <= -0.1).length > ys.length / 2;

      let average = ys.reduce((sum, y) => { return sum += y }) / ys.length;

      //if (motions.length > 5 && majorityAreNegative) {
      if (average < -1) {
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
          backgroundSize: '50%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '50% 66%',
          height: '100%'
        }}>
          <h1 className='center'>{this.props.instructions}</h1>
        </div>
      : <div><h1 style={{ textAlign: 'center' }}>Fetching...</h1></div>
  }
}

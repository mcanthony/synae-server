import debug from 'debug';
import React from 'react/addons';
import binaryXHR from 'binary-xhr';
import devicemotion from '../devicemotion';
import complimentaryFilter from '../complimentary-filter';
import DTW from 'dtw';
import dtwSum from '../dtw-sum';
import motionsToAccelSeries from '../motions-to-accelseries';
import asciiDTWPath from '../ascii-dtw-path';

let dbg = debug('synae-server:instrument:reach');

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
  now = Date.now();
  prev = 0;
  threshold = 4000;

  componentDidMount () {

    this.disconnectDeviceMotion = devicemotion((e) => {
      this.now = Date.now();
      let { motions } = this;
      motions.unshift({
        acceleration: e.acceleration,
        rotationRate: e.rotationRate,
        timestamp: Date.now()
      });
      if (motions.length > 32) {
        motions.pop();
      }

      let sumy = motions.reduce((sum, motion) => {
        return sum + motion.acceleration.y;
      }, 0);

      let avgy = sumy / motions.length;

      dbg(`${avgy} average and sum ${sumy}`);

      if (avgy < -0.5) {
        if (this.now - this.prev >= this.threshold) {
          this.triggerSound();
          this.prev = this.now;
        }
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
          <p>{this.state.playing}</p>
        </div>
      : <div><h1 style={{ textAlign: 'center' }}>Fetching...</h1></div>
  }
}

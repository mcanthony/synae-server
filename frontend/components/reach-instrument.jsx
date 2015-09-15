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

  componentDidMount () {

    this.disconnectDeviceMotion = devicemotion((e) => {
      let { motions } = this;
      motions.unshift({
        acceleration: e.acceleration,
        rotationRate: e.rotationRate,
        timestamp: Date.now()
      });
      if (motions.length > 32) {
        motions.pop();
      }

      let recordedTime = {
        x: [0],
        y: [1,2,3,4,5,6,7,8,9,10,10,10,10,10,10,10,0,0,0,0,0,0],
        z: [0]
      }

      let timeseries = motionsToAccelSeries(motions);
      let gestureCost = dtwSum(timeseries, recordedTime);

      let still = [-1];
      let stillCost = dtwSum(timeseries, { x: still, y: still, z: still });

      if (gestureCost < stillCost) {
        dbg('dm cost: gesture', gestureCost);
        dbg('dm cost: still', stillCost);
        this.triggerSound();
        // blank out to prevent immediate subsequent matches, hopefully?
        motions.length = 0;
        let dtw;
        dtw = new DTW();
        dtw.compute(timeseries.y, recordedTime.y, timeseries.length * 0.1)
        let gesturePath = dtw.path();
        dbg('\n' + asciiDTWPath(gesturePath, timeseries.y.length, recordedTime.y.length));
        dbg('dtw gesture path', JSON.stringify(gesturePath));
        dtw = new DTW();
        dtw.compute(timeseries.y, still, timeseries.length * 0.1)
        let stillPath = dtw.path();
        dbg('\n' + asciiDTWPath(stillPath, timeseries.y.length, recordedTime.y.length));
        dbg('dtw still path', JSON.stringify(stillPath));
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

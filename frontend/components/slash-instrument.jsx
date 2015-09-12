import debug from 'debug';
import React from 'react/addons';
import binaryXHR from 'binary-xhr';
import devicemotion from '../devicemotion';
import DTW from 'dtw';

let dbg = debug('synae-server:instrument:slash');

export default class extends React.Component {

  static propTypes = {
    actx: React.PropTypes.object.isRequired,
    sample: React.PropTypes.string.isRequired,
    instructions: React.PropTypes.string.isRequired
  }

  state = {
    buffer: null
  }

  isPlaying = false;
  motions = [];

  componentDidMount () {

    this.disconnectDeviceMotion = devicemotion((e) => {
      let { motions } = this;
      motions.unshift(e);
      if (motions.length > 32) motions.pop();

      let xs = motions.map(e => e.acceleration.x);
      let ys = motions.map(e => e.acceleration.y);
      let zs = motions.map(e => e.acceleration.z);
      let slashDTWX = new DTW();
      let slashDTWY = new DTW();
      let slashDTWZ = new DTW();

      let slashCostX = slashDTWX.compute(xs, [-0.2486258743215352,-0.2486258743215352,-0.2564040888412855,-0.8281079432100057,0.4077024836864322,2.051829799840599,2.051829799840599,4.054080745258927,4.054080745258927,7.721641130265593,4.418903068444132,-49.877799959445,-12.122157478147745,-7.903513362675905,-1.6358026284664868,-1.6358026284664868,0.7320479081198573,1.012030020822212,1.012030020822212,0.7941905491042882,0.3447294928250834]);
      let slashCostY = slashDTWY.compute(ys, [-0.35158794388510284,-0.35158794388510284,-0.5597984403837472,-0.426767651499249,1.5368807742044328,3.307293240907788,3.307293240907788,8.836905973178148,8.836905973178148,13.417791163170337,34.74513847631216,11.186764633738994,0.8238050583843142,-3.2892768149629235,-1.3698869619742036,-1.3698869619742036,0.23412226053690535,0.5229577792424708,0.5229577792424708,0.6150578246604651,0.3919173239249736]);
      let slashCostZ = slashDTWZ.compute(zs, [0.14063087035836652,0.14063087035836652,0.03569374242874328,0.21349044619556515,0.18876840339852496,0.11319432617193087,0.11319432617193087,-0.7068493886511772,-0.7068493886511772,-1.7790259812697766,0.6396639311939477,-25.79583011279106,1.1590832341119646,-2.1471324406921863,0.5732804743019864,0.5732804743019864,0.490678178939037,0.39824013373833145,0.39824013373833145,0.2668968778156675,-0.015306206863297847]);

      let stillDTWX = new DTW();
      let stillDTWY = new DTW();
      let stillDTWZ = new DTW();
      let stillCostX = stillDTWX.compute(xs, [0, 0, 0, 0]);
      let stillCostY = stillDTWY.compute(ys, [0, 0, 0, 0]);
      let stillCostZ = stillDTWZ.compute(zs, [0, 0, 0, 0]);

      let slashCost = slashCostX + slashCostY + slashCostZ;
      let stillCost = stillCostX + stillCostY + slashCostZ;

      if (slashCost < stillCost) {
        dbg('dm cost: slash', slashCost);
        dbg('dm cost: still', stillCost);
        if (!this.isPlaying) this.triggerSound();
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
    sample.onended = () => {
      dbg('sample onended fired');
    }
    dbg('buffer duration', this.state.buffer.duration);
    // For some reason .onended was not firing after 2 or so samples were created.
    setTimeout(() => {
      sample.disconnect();
      this.isPlaying = false;
      dbg('sample timeout fired');
    }, (this.state.buffer.duration+1) * 1000);
    sample.start();
    this.isPlaying = true;
  }

  render () {
    return this.state.buffer
      ? <div>
          <p>(Turn up your volume, and turn any silent switches to OFF)</p>
          <p>{this.props.instructions}</p>
        </div>
      : <div>Fetching...</div>
  }
}

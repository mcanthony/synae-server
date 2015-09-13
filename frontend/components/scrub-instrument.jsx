import debug from 'debug';
import React from 'react/addons';
import binaryXHR from 'binary-xhr';
import devicemotion from '../devicemotion';
import DTW from 'dtw';

let dbg = debug('synae-server:instrument:scrub');

export default class extends React.Component {

  static propTypes = {
    actx: React.PropTypes.object.isRequired,
    sample: React.PropTypes.string.isRequired,
    instructions: React.PropTypes.string.isRequired
  }

  state = {
    buffer: null
  }

  motions = [];

  componentDidMount () {

    this.disconnectDeviceMotion = devicemotion((e) => {
      let { motions } = this;
      motions.unshift(e);
      if (motions.length > 32) motions.pop();

      //let xs = motions.map(e => e.acceleration.x);
      let ys = motions.map(e => e.acceleration.y);
      //let zs = motions.map(e => e.acceleration.z);
      //let scrubDTWX = new DTW();
      let scrubDTWY = new DTW();
      //let scrubDTWZ = new DTW();

      //let scrubCostX = scrubDTWX.compute(xs, []);
      let scrubCostY = scrubDTWY.compute(ys, [0.3599560688557103,0.5452213047051802,0.5452213047051802,0.5432845279563218,0.5432845279563218,0.3853738205656409,0.3853738205656409,0.5897239153090864,0.5897239153090864,0.32326778526455163,0.38103944462314243,0.38103944462314243,0.24505581554872913,0.24505581554872913,0.2626351104516536,-0.003468365949143481,-0.003468365949143481,-0.06002303218168672,0.3045927492804825,0.7166039630115032,0.9081464524995535,0.9081464524995535,0.49725993194952606,-0.09540840278100222,-0.1205494473082479,-0.1205494473082479,0.13528971025981007,0.015353325949143617,-0.22971430790154262,0.015208217248384608,0.015208217248384608,-0.093178661834402,-0.093178661834402,0.3628351679559797,0.3628351679559797,0.1977412893292494,0.2324635518107563,0.26557808683468026,0.12533613359550944,0.12533613359550944,0.07141184298060833,0.25863621354121713,0.095486482119048,0.1272331811221782,0.1272331811221782,0.4911304162185639,0.31209011929854746,0.15954037268543614,0.12354300310104153,0.21263227672996,0.21263227672996,-0.023524793553201015,0.09743519590087234,0.47976584937833244,0.6065660002449527,0.20236379803074522,0.20236379803074522,0.24263931072521952,0.1806043678989634,0.08340104452520608,0.08340104452520608,-0.002907379342438071,-0.10772142031933181,0.320522724340111,0.040019190712692214,0.2690368489864282,0.2690368489864282,1.2796847130015492,0.9678237262837588,-2.598011583608389,-11.768723979461193,-10.143577769565582,2.2235138157136736,25.097120702910424,28.105124123251436,-0.40778362263124435,-37.65530228466987,-25.450910759949682,6.2694748212724924,26.659989612591264,16.94653812077045,-4.053408252824843,-5.570771841132641,-1.191826031480357,0.41223497601691633,-0.052762356996326705,-0.3764887225162238,0.13871116347531787,-0.0027576055975936467,0.01689867624460021,-0.0010040858083648345,-0.0010040858083648345,0.019697367052419576,0.20960306510189547,0.10810901313112117,0.10810901313112117,0.11814210303872823,0.11814210303872823,0.0879459488126915,0.28284111886266616,0.28284111886266616]);
      //let scrubCostZ = scrubDTWZ.compute(zs, []);

      //let stillDTWX = new DTW();
      let stillDTWY = new DTW();
      //let stillDTWZ = new DTW();
      //let stillCostX = stillDTWX.compute(xs, [0, 0, 0, 0]);
      let stillCostY = stillDTWY.compute(ys, [0, 0, 0, 0]);
      //let stillCostZ = stillDTWZ.compute(zs, [0, 0, 0, 0]);

      let scrubCost = scrubCostY//scrubCostX + scrubCostY + scrubCostZ;
      let stillCost = stillCostY//stillCostX + stillCostY + slashCostZ;

      if (scrubCost < stillCost) {
        dbg('dm cost: scrub', scrubCost);
        dbg('dm cost: still', stillCost);
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
      ? <div>
          <p>(Turn up your volume, and turn any silent switches to OFF)</p>
          <p>{this.props.instructions}</p>
        </div>
      : <div>Fetching...</div>
  }
}

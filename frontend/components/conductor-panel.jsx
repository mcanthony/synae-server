import React from 'react/addons';
import debug from 'debug';
import { Promise } from 'es6-promise';
import binaryXHR from 'binary-xhr';
import waakick from '../waakick';
import xfader from '../xfader';

let dbg = debug('synae-server:client');
let dbgm = debug('synae-server:messages');

let debounce = (fn, wait) => {
  let ref = null;
  return (...args) => {
    if (ref) clearTimeout(ref);
    ref = setTimeout(() => fn(...args), wait);
  }
}

export default class ConductorPanel extends React.Component {

  static propTypes = {
    rsend: React.PropTypes.func.isRequired,
    rrecv: React.PropTypes.func.isRequired,
    rconnected: React.PropTypes.func.isRequired
  }

  actx = waakick();
  gain = null;
  xfader = null;

  state = {
    groups: this.props.perfConfig.groups,
    buffers: [],
    allowKinectInput: true,
    timingHasStarted: false,
    sectionTimers: {
      // will have group-id => timeoutid
    }
  }

  constructor(props) {
    super(props);

    // Prevent overloading the network.
    this.broadcastWorldState = debounce(this.broadcastWorldState, 20);

    // Shortcuts to rhizome callbacks
    let {rsend, rrecv, rconnected} = this.props;
    Object.assign(this, {rsend, rrecv, rconnected});

    this.rconnected(() => {
      // Immediately send world state to resync in the event of a crash
      this.broadcastWorldState();
      this.rsend('/sys/subscribe', ['/kinect-events']);
    });

    this.rrecv((address, args) => {
      if (address === '/broadcast/open/websockets') {
        return;
      }
      if (address === '/kinect-events') {
        if (
          !this.state.allowKinectInput
          || !this.state.buffers.length) return;
        // stand, left, right
        switch (args[0]) {
          case 'left':
          case 'head':
          case 'upwards-point':
            this.nextSection();
            break;
          //case 'right':
          //  this.prevSection();
          //  break;
        }
      }
    });
  }

  componentDidMount () {
    let {actx} = this;
    this.gain = actx.createGain();
    this.gain.connect(actx.destination);
    this.gain.value = 1;

    let pbuffer = (bpath) => {
      return new Promise((resolve, reject) => {
        binaryXHR(bpath, (err, data) => {
          if (err) return reject(err);
          actx.decodeAudioData(data, b => resolve(b));
        });
      });
    }

    let catcher = e => {
      console.error(e);
    }

    Promise.all([
      new Promise((resolve, reject) => {
        // Gross. Make a blank audio buffer to prevent premature audio changes.
        let duration = this.state.groups[0].sections[0].timings[0];
        let { sampleRate } = actx;
        let buffer = actx.createBuffer(1, duration, sampleRate);
        resolve(buffer);
      }),
      pbuffer('audio/mp3/Section_1.mp3'),
      pbuffer('audio/mp3/Section_2.mp3'),
      pbuffer('audio/mp3/Section_3.mp3')
    ])
    .catch(catcher)
    .then(args => {
      this.xfader = xfader(args, actx, this.gain, 2);
      this.setState({ buffers: args });
    })
    .catch(catcher);
  }

  startPerformance = () => {
    let { state } = this;
    state.groups.forEach(g => {
      g.activeSection = 0;
      g.activeSequence = 0;
    });

    state.timingHasStarted = true;

    // start audio.
    this.xfader.fadeTo(0);

    this.setState(state);
    this.setupTimings();
  }

  mutePerformance = () => {
    let param = this.gain.gain;
    let now = this.actx.currentTime;
    param.cancelScheduledValues(now);
    param.linearRampToValueAtTime(0, now + 0.1);
  }

  setupTimings () {
    let { state } = this;
    state.groups.forEach(g => {
      let section = g.sections[g.activeSection];
      if (section.timings && section.timings[g.activeSequence]) {
        let duration = section.timings[g.activeSequence];
        if (state.sectionTimers[g.id]) {
          dbg('clearing timeout', g.id);
          clearTimeout(state.sectionTimers[g.id]);
        }
        dbg('setting timeout', g.id, duration);
        state.sectionTimers[g.id] = setTimeout(() => {
          dbg('firing timeout', g.id, duration);
          if (g.activeSection === 0) {
            dbg('special case: welcome');
            this.nextSection();
          } else {
            this.nextSequence(g.id);
          }
        }, duration);
      }
    })
    this.setState(state);
  }

  nextSequence (groupId) {
    let { state } = this;
    state.groups.forEach(g => {
      if (g.id !== groupId) return;
      let sequences = g.sections[g.activeSection].sequences;
      if (g.activeSequence < sequences.length - 1) {
        g.activeSequence += 1;
        dbg('sequence change', g.id, g.activeSequence);
      }
    });
    this.setState(state);
  }

  nextSection = () => {
    let { state } = this;
    state.groups.forEach(g => {
      g.activeSection += 1;
      g.activeSequence = 0;

      if (g.activeSection > g.sections.length - 1) {
        g.activeSection = 0;
      }
    });

    let activeSection = this.state.groups[0].activeSection;
    this.xfader.fadeTo(activeSection);
    this.setState(state);
    this.setupTimings();
  }

  prevSection = () => {
    let { state } = this;
    state.groups.forEach(g => {
      g.activeSection -= 1;
      g.activeSequence = 0;

      if (g.activeSection < 0) {
        g.activeSection = 0;
      }
    });
    let activeSection = this.state.groups[0].activeSection;
    this.xfader.fadeTo(activeSection);
    this.setState(state);
    this.setupTimings();
  }

  onEmitGroupSequenceChange = (e) => {
    var action = e.target.getAttribute('data-action');
    var groupId = e.target.getAttribute('data-groupid');
    var add = action === 'dec' ? -1 : 1;
    var state = this.state;
    state.groups.forEach(g => {
      if (g.id === groupId) {
        // Bounds check.
        let section = g.sections[g.activeSection];
        if (++g.activeSequence > section.sequences.length - 1) {
          g.activeSequence = 0;
          g.activeSection += 1;
        }
        if (g.activeSection > g.sections.length - 1) {
          g.activeSection = 0;
        }
      }
    });
    this.setState(state);
  }

  toggleKinect = () => {
    this.setState({ allowKinectInput: !this.state.allowKinectInput });
  }

  componentWillUpdate () {
    // This might be a horrible idea.
    this.broadcastWorldState();
  }

  // TODO: make this only happen when a new client connects?
  broadcastWorldState = () => {
    this.rsend('/world-state', [JSON.stringify(this.state)]);
  }

  render() {
    let self = this;
    let loading = !this.state.buffers.length;
    return (
      <div className="conductor">
        <h1 className="px2">Conductor</h1>

        <div>
          <button
            disabled={loading || this.state.timingHasStarted}
            className='button button-big'
            onClick={this.startPerformance}>Start Performance</button>
          <button
            disabled={loading}
            className='button button-big bg-red'
            onClick={this.mutePerformance}>MASTER MUTE</button>
        </div>
        <div>
          <button disabled={loading} className='button button-big' onClick={this.prevSection}>Previous Section</button>
          <button disabled={loading} className='button button-big' onClick={this.nextSection}>Next Section</button>
          {loading && <span>Loading...</span>}
        </div>

        <div>
          <label>
            Allow Kinect Section Changes:
            <input
              type='checkbox'
              checked={this.state.allowKinectInput}
              onChange={this.toggleKinect} />
          </label>
        </div>

        <div className="group-list">
          {this.state.groups.map(g => {
            let section = g.sections[g.activeSection];
            let gesture = section.sequences[g.activeSequence].gesture;
            return (
              <div className="group-info">
                <h2>Group {g.name}: {gesture} (Section {g.activeSection}, Sequence {g.activeSequence})</h2>
                <button name="group-sequence-dec"
                  onClick={this.onEmitGroupSequenceChange}
                  data-groupid={g.id}
                  data-action="dec">Prev Sequence</button>
                <button name="group-sequence-inc"
                  onClick={this.onEmitGroupSequenceChange}
                  data-groupid={g.id}
                  data-action="inc">Next Sequence</button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

}

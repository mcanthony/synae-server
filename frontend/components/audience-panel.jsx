import React from 'react/addons';
import debug from 'debug';
import SectionChooser from './section-chooser.jsx';

import waakick from '../waakick';
import SilentInstrument from './silent-instrument.jsx';
import FlutterInstrument from './flutter-instrument.jsx';
//import FlutterGesture from './flutter-gesture.jsx';
//import FlutterGesture from './flutter-gesture.jsx';
//import FlutterGesture from './flutter-gesture.jsx';

let dbg = debug('synae-server:client');

const Instruments = {
  'silent': SilentInstrument,
  'flutter': FlutterInstrument
}

export default class AudiencePanel extends React.Component {

  static propTypes = {
    rsend: React.PropTypes.func.isRequired,
    rrecv: React.PropTypes.func.isRequired,
    rconnected: React.PropTypes.func.isRequired,
    rid: React.PropTypes.string.isRequired
  }

  state = {
    groupId: null,
    world: null,
    actx: null
  }

  constructor(props) {
    super(props);

    // Shortcuts to rhizome callbacks
    let {rsend, rrecv, rconnected, rhizome} = this.props;
    Object.assign(this, {rsend, rrecv, rconnected, rhizome});

    // TODO: there is a race condition here where the conductor is notified
    // of a new client before this subscription is successful, resulting in
    // the audience never receiving the world state.
    this.rconnected(() => {
      this.rsend('/sys/subscribe', ['/world-state']);
      this.rsend('/sys/subscribe', ['/client/' + this.props.rid]);
    });

    this.rrecv((address, args) => {
      if (address === '/client/' + this.props.rid) {
        this.setState({ world: JSON.parse(args[0]) });
      }

      if (address === '/world-state') {
        this.setState({ world: JSON.parse(args[0]) });
      }
    });
  }

  kickWebAudio = () => {
    dbg('waakick');
    this.setState({ actx: waakick() });
  }

  onGroupSelect = (groupId) => {
    this.setState({ ...this.state, groupId });
    // TODO: tell the server? just for visualization purposes
  }

  render() {
    let hasKickedAudio = !!this.state.actx;

    if (!hasKickedAudio) return <div>
      <button onClick={this.kickWebAudio}>Join!</button>
    </div>

    let self = this;
    let hasWorldData = !!this.state.world;
    let syncing = !hasWorldData ? 'Waiting for Conductor...' : null;
    let group = hasWorldData
      ? this.state.world.groups.filter(g => g.id === this.state.groupId)[0]
      : null;
    let sequence = group
      ? group.sequences.filter((s, i) => i === group.activeSequence)[0]
      : null;
    let Instrument = sequence
      ? Instruments[sequence.gesture]
      : null;

    return (
      <div className="audience">
        <h1 className="px2">Audience</h1>
        {
          !hasWorldData
          ? <div>{syncing}</div>
          : group
            ? <div><Instrument sample={sequence.sample} actx={this.state.actx} /></div>
            : <SectionChooser
              groups={this.state.world.groups}
              onGroupSelect={this.onGroupSelect} />
        }
      </div>
    )
  }

}

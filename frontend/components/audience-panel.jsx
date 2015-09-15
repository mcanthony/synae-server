import React from 'react/addons';
import debug from 'debug';
import GroupChooser from './group-chooser.jsx';

import waakick from '../waakick';
import WelcomeInstrument from './welcome-instrument.jsx';
import SilentInstrument from './silent-instrument.jsx';
import FlutterInstrument from './flutter-instrument.jsx';
import SlashInstrument from './slash-instrument.jsx';
import TickleInstrument from './tickle-instrument.jsx';
import ScrubInstrument from './scrub-instrument.jsx';
import ReachInstrument from './reach-instrument.jsx';
import WaterdropInstrument from './waterdrop-instrument.jsx';

let dbg = debug('synae-server:client');

const Instruments = {
  'welcome': WelcomeInstrument,
  'silent': SilentInstrument,
  'flutter': FlutterInstrument,
  'slash': SlashInstrument,
  'tickle': TickleInstrument,
  'scrub': ScrubInstrument,
  'reach': ReachInstrument,
  'waterdrop': WaterdropInstrument
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

    this.rconnected(() => {
      this.rsend('/sys/subscribe', ['/world-state']);
      this.rsend('/sys/subscribe', ['/client/' + this.props.rid]);
      // Retrieve world state once connected.
      this.rsend('/sys/resend', ['/world-state']);
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
      <button className='button button-big' onClick={this.kickWebAudio}>Join!</button>
    </div>

    let self = this;
    let hasWorldData = !!this.state.world;
    let syncing = !hasWorldData ? 'Waiting for Conductor...' : null;
    let group = hasWorldData
      ? this.state.world.groups.filter(g => g.id === this.state.groupId)[0]
      : null;
    let section = group
      ? group.sections[group.activeSection]
      : null;
    let sequence = section
      ? section.sequences[group.activeSequence]
      : null;
    let Instrument = sequence
      ? Instruments[sequence.gesture]
      : null;

    return (
      <div className="audience">
        {
          !hasWorldData
          ? <div>{syncing}</div>
          : group
            ? <div><Instrument
              sample={sequence.sample}
              instructions={sequence.instructions}
              actx={this.state.actx}
              groupId={this.state.groupId} /></div>
            : <GroupChooser
              groups={this.state.world.groups}
              onGroupSelect={this.onGroupSelect} />
        }
      </div>
    )
  }

}

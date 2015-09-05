import React from 'react/addons';
import debug from 'debug';
import waakick from '../waakick';
import SectionChooser from './section-chooser.jsx';

import FlutterGesture from './flutter-gesture.jsx';
//import FlutterGesture from './flutter-gesture.jsx';
//import FlutterGesture from './flutter-gesture.jsx';
//import FlutterGesture from './flutter-gesture.jsx';

let dbg = debug('synae-server:client');
let dbgm = debug('synae-server:messages');

const Gestures = {
  'flutter': FlutterGesture
}

export default class AudiencePanel extends React.Component {

  state = {
    groupId: null,
    world: null
  }

  rhizome = this.props.rhizome;

  constructor(props) {
    super(props);

    this.rhizome.start(() => {
      dbg('started', arguments);
    });

    this.rhizome.on('queued', () => {
      dbg('server is full...');
    });

    this.rhizome.on('connected', () => {
      dbg('connected');
      this.rhizome.send('/sys/subscribe', ['/world-state']);
      this.rhizome.send('/sys/subscribe', ['/client/' + this.rhizome.id]);
    });

    this.rhizome.on('connection lost', () => {
      dbg('reconnecting...');
    });

    this.rhizome.on('message', (address, args) => {
      dbgm(address, args);
      if (address === '/sys/subscribed') { return; }

      if (address === '/client/' + this.rhizome.id) {
        this.setState({ world: JSON.parse(args[0]) });
      }

      if (address === '/world-state') {
        this.setState({ world: JSON.parse(args[0]) });
      }
    });

    let actx;

    try {
      actx = waakick();
    } catch (e) {
      return this.handleUnsupported(e);
    }

    if (!rhizome.isSupported()) {
      return this.handleUnsupported(new Error('rhizome is not supported here'));
    }
  }

  handleUnsupported(e) {
    dbg(e);
    alert('Failed to initialize something: ' + e.message);
  }

  onGroupSelect = (groupId) => {
    this.setState({ ...this.state, groupId });
    // TODO: tell the server? just for visualization purposes
  }

  render() {
    let self = this;
    let hasWorldData = !!this.state.world;
    let syncing = !hasWorldData ? 'Waiting for Conductor...' : null;
    let group = hasWorldData
      ? this.state.world.groups.filter(g => g.id === this.state.groupId)[0]
      : null;
    let sequence = group
      ? group.sequences.filter((s, i) => i === group.activeSequence)[0]
      : null;
    let Gesture = sequence
      ? Gestures[sequence.gesture]
      : null;

    return (
      <div className="audience">
        <h1 className="px2">Audience</h1>
        {
          !hasWorldData
          ? <div>{syncing}</div>
          : group
            ? <div>{ Gesture ? React.createElement(Gesture, { sample: sequence.sample }) : 'Listen Around You...' }</div>
            : <SectionChooser
              groups={this.state.world.groups}
              onGroupSelect={this.onGroupSelect} />
        }
      </div>
    )
  }

}

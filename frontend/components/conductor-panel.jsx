import React from 'react/addons';
import debug from 'debug';

let dbg = debug('synae-server:client');
let dbgm = debug('synae-server:messages');

export default class ConductorPanel extends React.Component {

  state = {
    groups: this.props.perfConfig.groups
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

      // Listen for new clients
      this.rhizome.send('/sys/subscribe', ['/broadcast/open/websockets']);

      // Immediately send world state to resync in the event of a crash
      this.broadcastWorldState();
    });

    this.rhizome.on('connection lost', () => {
      dbg('reconnecting...');
    });

    this.rhizome.on('message', (address, args) => {
      dbgm(address, args);
      //if (address === '/sys/subscribed') { return; }

      if (address === '/broadcast/open/websockets') {
        // send current world state to client
        this.rhizome.send('/client/' + args[0], [JSON.stringify(this.state)]);
        return;
      }
    });
  }

  onEmitGroupSequenceChange = (e) => {
    var action = e.target.getAttribute('data-action');
    var groupId = e.target.getAttribute('data-groupid');
    var add = action === 'dec' ? -1 : 1;
    var state = this.state;
    state.groups.forEach(g => {
      if (g.id === groupId) {
        // initial state is null
        g.activeSequence = g.activeSequence !== null
          ? g.activeSequence + add
          : 0;
        // Bounds check.
        g.activeSequence = Math.min(Math.max(g.activeSequence, 0), g.sequences.length-1);
      }
    });
    this.setState(state);
  }

  componentWillUpdate () {
    // This might be a horrible idea.
    this.broadcastWorldState();
  }

  // TODO: make this only happen when a new client connects?
  broadcastWorldState () {
    this.props.rhizome.send('/world-state', [JSON.stringify(this.state)]);
  }

  render() {
    let self = this;

    return (
      <div className="conductor">
        <h1 className="px2">Conductor</h1>

        <div className="group-list">
          {this.state.groups.map(g => {
            let seq = g.activeSequence !== null
              ? (g.sequences[g.activeSequence].gesture || '(silence)')
              : '(no sequence)';

            return (
              <div className="group-info">
                <h2>Group {g.name}: {seq}</h2>
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

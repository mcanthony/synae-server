import React from 'react/addons';
import debug from 'debug';

let dbg = debug('synae-server:client');
let dbgm = debug('synae-server:messages');

export default class ConductorPanel extends React.Component {

  static propTypes = {
    rsend: React.PropTypes.func.isRequired,
    rrecv: React.PropTypes.func.isRequired,
    rconnected: React.PropTypes.func.isRequired
  }

  state = {
    groups: this.props.perfConfig.groups
  }

  constructor(props) {
    super(props);

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
        // stand, left, right
        switch (args[0]) {
          case 'right':
          case 'stand':
            this.nextSection();
            break;
          case 'left':
            this.prevSection();
            break;
        }
      }
    });
  }

  nextSection () {
    this.state.groups.forEach(g => {
      g.activeSection += 1;
      g.activeSequence = 0;

      if (g.activeSection > g.sections.length - 1) {
        g.activeSection = 0;
      }
    });
  }

  prevSection () {
    this.state.groups.forEach(g => {
      g.activeSection -= 1;
      g.activeSequence = 0;

      if (g.activeSection < 0) {
        g.activeSection = 0;
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

  componentWillUpdate () {
    // This might be a horrible idea.
    this.broadcastWorldState();
  }

  // TODO: make this only happen when a new client connects?
  broadcastWorldState () {
    this.rsend('/world-state', [JSON.stringify(this.state)]);
  }

  render() {
    let self = this;

    return (
      <div className="conductor">
        <h1 className="px2">Conductor</h1>

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

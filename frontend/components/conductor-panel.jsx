import React from 'react/addons';
import debug from 'debug';

let dbg = debug('synae-server:client');
let dbgm = debug('synae-server:messages');

export default class ConductorPanel extends React.Component {

  state = {
    audioWorld: null
  }

  rhizome = this.props.rhizome;

  onChangeAudioWorld = (e) => {
    var action = e.target.getAttribute('data-action');
    if (action === 'dec') this.setState({ audioWorld: --this.state.audioWorld });
    if (action === 'inc') this.setState({ audioWorld: ++this.state.audioWorld });
  }

  constructor(props) {
    super(props);
    //setInterval(this.broadcastAudioWorld.bind(this), 500);

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
      // TODO


    });

    this.rhizome.on('connection lost', () => {
      dbg('reconnecting...');
    });

    this.rhizome.on('message', (address, args) => {
      dbgm(address, args);
      //if (address === '/sys/subscribed') { return; }

      if (address === '/broadcast/open/websockets') {
        // send current world state to client
        this.rhizome.send('/client/' + args[0], ['this is world state... eventually']);
        return;
      }
    });
  }

  // TODO: make this only happen when a new client connects?
  broadcastAudioWorld() {
    this.props.rhizome.send('/audio-world', [this.state.audioWorld + '']);
  }

  render() {
    let self = this;

    return (
      <div className="conductor">
        <h1 className="px2">Conductor</h1>
        <button name="audio-world-dec" onClick={this.onChangeAudioWorld} data-action="dec">- world</button>
        <button name="audio-world-inc" onClick={this.onChangeAudioWorld} data-action="inc">+ world</button>
      </div>
    )
  }

}

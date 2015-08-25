import React from 'react/addons';
import debug from 'debug';
import waakick from '../waakick';

let dbg = debug('synae-server:client');
let dbgm = debug('synae-server:messages');

export default class AudiencePanel extends React.Component {

  state = {}

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
      this.rhizome.send('/sys/subscribe', ['/audio-world']);
      this.rhizome.send('/sys/subscribe', ['/client/' + this.rhizome.id]);
    });

    this.rhizome.on('connection lost', () => {
      dbg('reconnecting...');
    });

    this.rhizome.on('message', (address, args) => {
      dbgm(address, args);
      if (address === '/sys/subscribed') { return; }
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

  render() {
    let self = this;

    return (
      <div className="audience">
        <h1 className="px2">Audience</h1>
      </div>
    )
  }

}

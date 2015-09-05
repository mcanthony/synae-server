import './vendor/AudioContextMonkeyPatch';

import querystring from 'querystring';
import debug from 'debug';
import React from 'react/addons';

import waakick from './waakick';

import ConductorPanel from './components/conductor-panel.jsx';
import AudiencePanel from './components/audience-panel.jsx';

let dbg = debug('synae-server:client');
let dbgm = debug('synae-server:messages');

// rhizome is a global provided by the server, unfortunately.
// It could be replaced with:
// var rhizome = require('rhizome-server/lib/websockets/browser-main');
// but that file still exposes rhizome as a global.

var qs = querystring.parse(window.location.search.slice(1));

var perfConfig = {
  groups: [
    {
      id: 'group-a',
      name: 'A',
      sequences: [
        { gesture: null },
        { gesture: 'flutter', sample: '01.wav'}
      ],
      activeSequence: null,
      clients: {}
    },
    {
      id: 'group-b',
      name: 'B',
      sequences: [
        { gesture: null },
        { gesture: 'swipe', sample: '02.wav'}
      ],
      activeSequence: null
    },
    {
      id: 'group-c',
      name: 'C',
      sequences: [
        { gesture: null },
        { gesture: 'scratch', sample: '03.wav'}
      ],
      activeSequence: null
    },
    {
      id: 'group-d',
      name: 'D',
      sequences: [
        { gesture: null },
        { gesture: 'pulse', sample: '04.wav'}
      ],
      activeSequence: null
    }
  ]
}

let actx;

try {
  actx = waakick();
} catch (e) {
  alert('Failed to initialize Web Audio' + e.message);
  throw e;
}

if (!rhizome.isSupported()) {
  let e = new Error('rhizome is not supported here');
  alert(e.message);
  throw e;
}

rhizome.start(() => {
  dbg('started', rhizome.id, arguments);
  initialize();
});

function initialize () {
  if ('conductor' in qs) {
    React.render(<ConductorPanel
      perfConfig={perfConfig}
      rsend={rhizome.send.bind(rhizome)}
      rrecv={recv}
      rconnected={connected} />, document.body);
  } else {
    React.render(<AudiencePanel
      perfConfig={perfConfig}
      rsend={rhizome.send.bind(rhizome)}
      rrecv={recv}
      rconnected={connected}
      rid={rhizome.id} />, document.body);
  }

  // TODO: Probably need to pass this into at least the audience component.
  // TODO: this listener might be in a race condition since it's added
  // after `start`
  rhizome.on('queued', () => {
    dbg('server is full...');
  });

  rhizome.on('connection lost', () => {
    dbg('reconnecting...');
  });

  function recv (cb) {
    rhizome.on('message', (...args) => {
      dbgm(...args);
      cb(...args);
    });
  }

  function connected (cb) {
    rhizome.on('connected', (...args) => {
      dbg('connected');
      cb(...args);
    });
  }
}
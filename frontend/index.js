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
        { gesture: 'silent' },
        { gesture: 'flutter', sample: '01.wav'}
      ],
      activeSequence: 0,
      clients: {}
    },
    {
      id: 'group-b',
      name: 'B',
      sequences: [
        { gesture: 'silent' },
        { gesture: 'swipe', sample: '02.wav'}
      ],
      activeSequence: 0
    },
    {
      id: 'group-c',
      name: 'C',
      sequences: [
        { gesture: 'silent' },
        { gesture: 'scratch', sample: '03.wav'}
      ],
      activeSequence: 0
    },
    {
      id: 'group-d',
      name: 'D',
      sequences: [
        { gesture: 'silent' },
        { gesture: 'pulse', sample: '04.wav'}
      ],
      activeSequence: 0
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

  let commonProps = {
    perfConfig,
    rsend: rhizome.send.bind(rhizome),
    rrecv,
    rconnected
  };

  if ('conductor' in qs) {
    React.render(<ConductorPanel {...commonProps} />, document.body);
  } else {
    React.render(<AudiencePanel {...commonProps} rid={rhizome.id} />, document.body);
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

  function rrecv (cb) {
    rhizome.on('message', (...args) => {
      dbgm(...args);
      cb(...args);
    });
  }

  function rconnected (cb) {
    rhizome.on('connected', (...args) => {
      dbg('connected');
      cb(...args);
    });
  }
}
import './vendor/AudioContextMonkeyPatch';
import objectAssign from 'object-assign';

import querystring from 'querystring';
import debug from 'debug';
import React from 'react/addons';

import waakick from './waakick';
import ConductorPanel from './components/conductor-panel.jsx';
import AudiencePanel from './components/audience-panel.jsx';
import GestureRecordPanel from './components/gesturerecord-panel.jsx';

// polyfill
Object.assign = Object.assign || objectAssign;

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
        { gesture: 'flutter', sample: 'audio/mp3/01.mp3', instructions: 'Shake phone when you hear agitation in the piano.'},
        { gesture: 'flutter', sample: 'audio/mp3/01.mp3', instructions: 'When you hear someone else\'s shake, wait two beats then shake.'},
        { gesture: 'tickle',  sample: 'audio/mp3/01.mp3', instructions: 'Tickle screen\'s bubbles whenever you grandly exhale.'}
      ],
      activeSequence: 0
    },
    {
      id: 'group-b',
      name: 'B',
      sequences: [
        { gesture: 'silent', instructions: 'Be still.' },
        { gesture: 'slash', sample: 'audio/mp3/02.mp3', instructions: 'Slash downwards when you hear fluttering.'}
      ],
      activeSequence: 0
    },
    {
      id: 'group-c',
      name: 'C',
      sequences: [
        { gesture: 'silent' },
        { gesture: 'scratch', sample: 'audio/mp3/03.mp3'}
      ],
      activeSequence: 0
    },
    {
      id: 'group-d',
      name: 'D',
      sequences: [
        { gesture: 'silent' },
        { gesture: 'pulse', sample: 'audio/mp3/04.mp3'}
      ],
      activeSequence: 0
    }
  ]
}

try {
  // This is simply to test for support, not to actually kick.
  dbg('waa', waakick());
} catch (e) {
  alert('Failed to initialize Web Audio' + e.message);
  throw e;
}

if (!rhizome.isSupported()) {
  let e = new Error('rhizome is not supported here');
  alert(e.message);
  throw e;
}

// TODO: probably need to do an audio format check here as well...

rhizome.start(() => {
  dbg('started', rhizome.id);
  initialize();
});

function initialize () {

  let commonProps = {
    perfConfig,
    rsend: rhizome.send.bind(rhizome),
    rrecv,
    rconnected
  };

  React.initializeTouchEvents(true);
  let root = document.querySelector('.react-root');

  if ('conductor' in qs) {
    React.render(<ConductorPanel {...commonProps} />, root);
  } else if ('gesturedebug' in qs) {
    React.render(<GestureRecordPanel />, root);
  } else {
    React.render(<AudiencePanel {...commonProps} rid={rhizome.id} />, root);
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
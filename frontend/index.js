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
      sections: [
        {
          sequences: [
            { gesture: 'flutter', sample: 'audio/mp3/Section_1_Group_1_flutter.mp3', instructions: 'Shake phone when you hear agitation in the piano.'},
            { gesture: 'flutter', sample: 'audio/mp3/Section_1_Group_1_flutter.mp3', instructions: 'When you hear someone else\'s shake, wait two beats then shake.'},
          ]
        },
        {
          sequences: [
            { gesture: 'tickle', sample: 'audio/mp3/Section_2_Group_1_blowing_bubbles.mp3', instructions: 'Tickle screen\'s bubbles whenever you grandly exhale.'}
          ]
        },
        {
          sequences: [
            { gesture: 'flutter', sample: 'audio/mp3/Section_3_Group_1_Electrical_E.mp3', instructions: 'Shake phone after pianist plays a gesture.' }
          ]
        }
      ],
      activeSequence: 0,
      activeSection: 0
    },
    {
      id: 'group-b',
      name: 'B',
      sections: [
        {
          sequences: [
            { gesture: 'silent', instructions: 'Be still.' },
            { gesture: 'slash', sample: 'audio/mp3/Section_1_Group_2_String_Swipe.mp3', instructions: 'Slash downwards when you hear fluttering.'}
          ]
        },
        {
          sequences: [
            { gesture: 'waterdrop', sample: 'audio/mp3/Section_2_Group_2_Water_drop___saliva.mp3', instructions: 'Tap.'}
          ]
        },
        {}
      ],
      activeSequence: 0,
      activeSection: 0
    },
    {
      id: 'group-c',
      name: 'C',
      sections: [
        {
          sequences: [
            { gesture: 'silent', instructions: 'Be still.' },
            { gesture: 'scrub', sample: 'audio/mp3/Section_1_Group_3_String_Drag.mp3', instructions: 'Scratch the air with your phone when you hear slashing sounds'}
          ]
        },
        {
          sequences: [
            { gesture: 'flutter', sample: 'audio/mp3/Section_2_Group_3_Electrical_interruption.mp3', instructions: 'Shake phone quickly whenever you shift in your seat.'}
          ]
        },
        {
          sequences: [
            { gesture: 'flutter', sample: 'audio/mp3/Section_3_Group_3_Electrical_interruption.mp3', instructions: 'Shake phone after the group in front of you plays sounds.'}
          ]
        }
      ],
      activeSequence: 0,
      activeSection: 0
    },
    {
      id: 'group-d',
      name: 'D',
      sections: [
        {
          sequences: [
            { gesture: 'silent', instructions: 'Be still.' },
            { gesture: 'reach', sample: 'audio/mp3/Section_1_Group_4_Whisper_bells.mp3', instructions: 'Reach upwards with your phone when you hear a dead spot.' }
          ]
        },
        {},
        {}
      ],
      activeSequence: 0,
      activeSection: 0
    }
  ]
}

// TODO: check for gyrometer support within devicemotion

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
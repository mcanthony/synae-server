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

let timeToMS = (minutes, seconds) => {
  return (minutes * 60 + seconds) * 1000;
}

var perfConfig = {
  groups: [
    {
      id: 'group-a',
      name: 'Blue',
      color: '#69cadf',
      sections: [
        {
          sequences: [
            { gesture: 'welcome' },
          ],
          timings: [
            timeToMS(0, 10)
          ]
        },
        {
          sequences: [
            { gesture: 'flutter',
              sample: 'audio/mp3/Section_1_Group_1_flutter.mp3',
              instructions: 'Shake phone when you hear agitation in the piano.',
              iconUrl: 'img/SECTION1-ShakeGroup1.png'},
            { gesture: 'flutter',
              sample: 'audio/mp3/Section_1_Group_1_flutter.mp3',
              instructions: 'When you hear someone else\'s shake, wait two beats then shake.',
              iconUrl: 'img/SECTION1-ShakeGroup1.png'},
          ],
          timings: [
            timeToMS(0, 42)
          ]
        },
        {
          sequences: [
            { gesture: 'tickle',
              sample: 'audio/mp3/Section_2_Group_1_blowing_bubbles.mp3',
              instructions: 'Tickle screen\'s bubbles whenever you grandly exhale.',
              iconUrl: 'img/SECTION2-TickleGroup1.png'}
          ]
        },
        {
          sequences: [
            { gesture: 'tickle',
              sample: 'audio/mp3/Section_2_Group_1_blowing_bubbles.mp3',
              instructions: 'Tickle screen\'s bubbles whenever you grandly exhale.',
              iconUrl: 'img/SECTION2-TickleGroup1.png'},
            { gesture: 'flutter',
              sample: 'audio/mp3/Section_3_Group_1_Electrical_E.mp3',
              instructions: 'Shake phone after pianist performs a gesture.',
              iconUrl: 'img/SECTION3-ShakeGroupERRYBODY.png'}
          ],
          timings: [
            timeToMS(0, 37)
          ]
        }
      ],
      activeSequence: 0,
      activeSection: 0
    },
    {
      id: 'group-b',
      name: 'Red',
      color: '#f05d5f',
      sections: [
        {
          sequences: [
            { gesture: 'welcome' },
          ],
          timings: [
            timeToMS(0, 10)
          ]
        },
        {
          sequences: [
            { gesture: 'silent',
              instructions: 'Be still.' },
            { gesture: 'slash',
              sample: 'audio/mp3/Section_1_Group_2_String_Swipe.mp3',
              instructions: 'Slash downwards when you hear fluttering.',
              iconUrl: 'img/SECTION1-SlashGroup2.png'}
          ],
          timings: [
            timeToMS(0, 42)
          ]
        },
        {
          sequences: [
            { gesture: 'waterdrop',
              sample: 'audio/mp3/Section_2_Group_2_Water_drop___saliva.mp3',
              instructions: 'Tap when you swallow saliva.',
              iconUrl: 'img/SECTION2-TapGroup2.png'}
          ]
        },
        {
          sequences: [
            { gesture: 'waterdrop',
              sample: 'audio/mp3/Section_2_Group_2_Water_drop___saliva.mp3',
              instructions: 'Tap when you swallow saliva.',
              iconUrl: 'img/SECTION2-TapGroup2.png'},
            { gesture: 'flutter',
              sample: 'audio/mp3/Section_3_Group_2_Electrical_Csharp.mp3',
              instructions: 'Shake phone after the group on your right plays sounds.',
              iconUrl: 'img/SECTION3-ShakeGroupERRYBODY.png'}
          ],
          timings: [
            timeToMS(0, 37)
          ]
        }
      ],
      activeSequence: 0,
      activeSection: 0
    },
    {
      id: 'group-c',
      name: 'Green',
      color: '#80c898',
      sections: [
        {
          sequences: [
            { gesture: 'welcome' },
          ],
          timings: [
            timeToMS(0, 10)
          ]
        },
        {
          sequences: [
            { gesture: 'silent',
              instructions: 'Be still.' },
            { gesture: 'scratch',
              sample: 'audio/mp3/Section_1_Group_3_String_Drag.mp3',
              instructions: 'Scratch the air with your phone when you hear slashing sounds',
              iconUrl: 'img/SECTION1-ScratchGroup3.png'}
          ],
          timings: [
            timeToMS(0, 42)
          ]
        },
        {
          sequences: [
            { gesture: 'flutter',
              sample: 'audio/mp3/Section_2_Group_3_Electrical_interruption.mp3',
              instructions: 'Shake phone quickly whenever you shift in your seat.',
              iconUrl: 'img/SECTION2-ShakeGroup3.png'}
          ]
        },
        {
          sequences: [
            { gesture: 'flutter',
              sample: 'audio/mp3/Section_2_Group_3_Electrical_interruption.mp3',
              instructions: 'Shake phone quickly whenever you shift in your seat.',
              iconUrl: 'img/SECTION2-ShakeGroup3.png'},
            { gesture: 'flutter',
              sample: 'audio/mp3/Section_3_Group_3_Electrical_interruption.mp3',
              instructions: 'Shake phone after the group in front of you plays sounds.',
              iconUrl: 'img/SECTION3-ShakeGroupERRYBODY.png'}
          ],
          timings: [
            timeToMS(0, 37)
          ]
        }
      ],
      activeSequence: 0,
      activeSection: 0
    },
    {
      id: 'group-d',
      name: 'Yellow',
      color: '#f2d86d',
      sections: [
        {
          sequences: [
            { gesture: 'welcome' },
          ],
          timings: [
            timeToMS(0, 10)
          ]
        },
        {
          sequences: [
            { gesture: 'silent',
              instructions: 'Be still.' },
            { gesture: 'reach',
              sample: 'audio/mp3/Section_1_Group_4_Whisper_bells.mp3',
              instructions: 'Reach upwards with your phone when you hear a dead spot.',
              iconUrl: 'img/SECTION1-ReachGroup4.png' }
          ],
          timings: [
            timeToMS(0, 42)
          ]
        },
        {
          sequences: [
            { gesture: 'waterdrop',
              sample: 'audio/mp3/Section_2_Group_4_Popping.mp3',
              instructions: 'Tap when you swallow saliva.',
              iconUrl: 'img/SECTION2-TapGroup4.png'}
          ]
        },
        {
          sequences: [
            { gesture: 'waterdrop',
              sample: 'audio/mp3/Section_2_Group_4_Popping.mp3',
              instructions: 'Tap when you swallow saliva.',
              iconUrl: 'img/SECTION2-TapGroup4.png'},
            { gesture: 'flutter',
              sample: 'audio/mp3/Section_3_Group_4_Electrical_fly.mp3',
              instructions: 'Shake phone after the group to your left plays sounds.',
              iconUrl: 'img/SECTION3-ShakeGroupERRYBODY.png'}
          ],
          timings: [
            timeToMS(0, 37)
          ]
        }
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
import './vendor/AudioContextMonkeyPatch';
import querystring from 'querystring';
import debug from 'debug';

import React from 'react/addons';
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

if ('conductor' in qs) {
  React.render(<ConductorPanel perfConfig={perfConfig} rhizome={rhizome} />, document.body);
} else {
  React.render(<AudiencePanel perfConfig={perfConfig} rhizome={rhizome} />, document.body);
}

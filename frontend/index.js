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

if ('conductor' in qs) {
  React.render(<ConductorPanel rhizome={rhizome} />, document.body);
} else {
  React.render(<AudiencePanel rhizome={rhizome} />, document.body);
}
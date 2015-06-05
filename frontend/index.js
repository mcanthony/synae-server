import './vendor/AudioContextMonkeyPatch';
import debug from 'debug';
import WAAClock from 'waaclock';
import waakick from './waakick';
import { Tone } from 'tone';

import React from 'react/addons';
import SectionChooser from './components/section-chooser.jsx';

let dbg = debug('synae-server:client');
let dbgm = debug('synae-server:messages');

// rhizome is a global provided by the server, unfortunately.
// It could be replaced with:
// var rhizome = require('rhizome-server/lib/websockets/browser-main');
// but that file still exposes rhizome as a global.

var audienceSections = ['a', 'b', 'c'];

React.render(
  <SectionChooser audienceSections={audienceSections} onSectionSelect={init} />,
  document.body
);

function init(sectionId) {

  dbg('sectionId?', sectionId);

  let actx;

  try {
    actx = waakick();
  } catch (e) {
    return handleUnsupported(e);
  }

  if (!rhizome.isSupported()) {
    return handleUnsupported(new Error('rhizome is not supported here'));
  }

  let clock = new WAAClock(actx);
  clock.start();

  dbg(Tone)

  Tone.setContext(actx);
  Tone.Transport.start();

  let instruments = {
    mono: new Tone.MonoSynth
  };
  if (sectionId === 'a') instruments[sectionId] = new Tone.PolySynth(4, Tone.MonoSynth);
  if (sectionId === 'b') instruments[sectionId] = new Tone.PolySynth(4, Tone.FMSynth);
  if (sectionId === 'c') instruments[sectionId] = new Tone.PolySynth(4, Tone.DuoSynth);

  Object.keys(instruments).forEach(k => instruments[k].toMaster());

  rhizome.start(function () {
    dbg('started', arguments);
  });

  rhizome.on('queued', function() {
    dbg('server is full...');
  });

  rhizome.on('connected', function() {
    dbg('connected');
    rhizome.send('/sys/subscribe', ['/tones/all-note']);
    rhizome.send('/sys/subscribe', ['/tones/all-chord']);
    rhizome.send('/sys/subscribe', ['/tones/section/' + sectionId]);
  });

  rhizome.on('connection lost', function() {
    dbg('reconnecting...');
  });

  rhizome.on('message', function(address, args) {
    dbgm(address, args);
    if (address === '/sys/subscribe') { return; }

    if (address === '/tones/all-note') {
      dbg('triggering');
      instruments.mono.triggerAttackRelease('C3', '1n');
    }

    if (address === '/tones/all-chord') {
      let notes = ['C3', 'D5', 'E4', 'G4'];
      let note = notes[Math.floor(Math.random() * notes.length)];
      dbg('triggering', note);
      instruments.mono.triggerAttackRelease(note, '1n');
    }

    if (address === '/tones/section/' + sectionId) {
      args.forEach(note => {
        dbg('triggering', note);
        instruments[sectionId].triggerAttackRelease(note, '1n', '+16n');
      })
    }
  });
}

function handleUnsupported(e) {
  dbg(e);
  alert('Failed to initialize something: ' + e.message);
}

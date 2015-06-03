import './vendor/AudioContextMonkeyPatch';
import debug from 'debug';
import WAAClock from 'waaclock';
import waakick from './waakick';
import { Tone } from 'tone';


let dbg = debug('synae-server:client');
let dbgm = debug('synae-server:messages');

// rhizome is a global provided by the server, unfortunately.
// It could be replaced with:
// var rhizome = require('rhizome-server/lib/websockets/browser-main');
// but that file still exposes rhizome as a global.

document.body.addEventListener('click', kicker, false);
document.body.addEventListener('touchstart', kicker, false);

function kicker(e) {
  dbg('kicking');
  e.target.removeEventListener('click', kicker, false);
  e.target.removeEventListener('touchstart', kicker, false);
  init()
}

function init() {

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

  console.log(Tone)

  Tone.setContext(actx);
  let synth = new Tone.MonoSynth();
  synth.toMaster();
  Tone.Transport.start();

  rhizome.start(function () {
    dbg('started', arguments);
  });

  rhizome.on('queued', function() {
    dbg('server is full...');
  });

  rhizome.on('connected', function() {
    dbg('connected');
    rhizome.send('/sys/subscribe', ['/tones']);
  });

  rhizome.on('connection lost', function() {
    dbg('reconnecting...');
  });

  rhizome.on('message', function(address, args) {
    dbgm(address, args);
    if (address === '/sys/subscribe') { return; }
    if (address === '/tones') {
      var notes = ['C4', 'E4', 'G4'];
      var note = notes[Math.floor(Math.random() * notes.length)];
      dbg('triggering', note);
      synth.triggerAttackRelease(note, '2n');
    }
  });
}

function handleUnsupported(e) {
  dbg(e);
  alert('Failed to initialize something: ' + e.message);
}

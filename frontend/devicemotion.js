import debug from 'debug';

let dbg = debug('synae-server:devicemotion');

export default function(cb) {
  dbg('connected');
  window.addEventListener('devicemotion', handle, true);
  return disconnect;

  function handle (e) {
    if (e.interval > 0) {
      if (dbg.enabled) {
        // Normally would not care, but JSON.stringify will be costly.
        dbg('acceleration', JSON.stringify(e.acceleration));
        dbg('rotationRate', JSON.stringify(e.rotationRate));
        dbg('interval', e.interval);
      }
      cb(e);
    }
  }

  function disconnect() {
    window.removeEventListener('devicemotion', handle, true);
    dbg('disconnected');
  }
}
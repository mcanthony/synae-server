export default function (motions, smoothing, opt_out) {
  const RC = smoothing;

  let dt = (motions[1].timestamp - motions[0].timestamp) / 1000;
  let alpha = dt / (RC + dt);

  let smooth = (input, prev) => {
    return (alpha * input) + (1 - alpha) * prev;
  }

  return motions.reduce((ts, m) => {
    ts.x.push( smooth(m.acceleration.x, ts.x[ts.x.length - 1] || 0) );
    ts.y.push( smooth(m.acceleration.y, ts.y[ts.y.length - 1] || 0) );
    ts.z.push( smooth(m.acceleration.z, ts.z[ts.z.length - 1] || 0) );
    return ts;
  }, opt_out || { x: [], y: [], z: [] });
}
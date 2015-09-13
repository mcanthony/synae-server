export default function motionsToSeries (motions, opt_out) {
    return motions.reduce((ts, m) => {
      ts.x.push(m.acceleration.x);
      ts.y.push(m.acceleration.y);
      ts.z.push(m.acceleration.z);
      ts.alpha.push(m.rotationRate.alpha);
      ts.beta.push(m.rotationRate.beta);
      ts.gamma.push(m.rotationRate.gamma);
      return ts;
    }, opt_out || {
      x: [], y: [], z: [],
      alpha: [], beta: [], gamma: []
    });
  }
export default function (motions, out) {
  let angleX = 0;
  let angleY = 0;
  let angleZ = 0;
  let lastTime = 0;
  let cfilter = (angle, gyro, acel, dt) => {
    return (0.98)*(angle + gyro*dt) + (0.02)*(acel)
  }
  return motions.reduce((ts, m) => {
    let dt = (m.timestamp - (lastTime || motions[0].timestamp)) / 1000;
    ts.x.push(cfilter(angleX, m.rotationRate.alpha, m.acceleration.x, dt));
    ts.y.push(cfilter(angleY, m.rotationRate.beta, m.acceleration.y, dt));
    ts.z.push(cfilter(angleZ, m.rotationRate.gamma, m.acceleration.z, dt));
    lastTime = m.timestamp;
    return ts;
  }, out || { x: [], y: [], z: [] });
}
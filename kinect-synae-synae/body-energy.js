import Kinect from 'kinect2';
import v3 from 'pocket-physics/v3'

export default function energyDeltas(jointNames = [], frameWindow = 30, onchange) {
  const kinect = new Kinect();

  if (!kinect.open()) {
    return onchange(new Error('Could not open Kinect'));
  }

  kinect.on('bodyFrame', handleBodyFrame);
  kinect.openBodyReader();

  const frames = [];

  function handleBodyFrame (bodyFrame) {
    frames.unshift(bodyFrame);
    if (frames.length > frameWindow) frames.pop();
    if (frames.length < 2) return; // bail until at least 2 frames

    const { bodies } = bodyFrame; // does this need a default?
    const [ currFrame, prevFrame ] = frames;

    bodies.forEach((body, i) => {
      if (!body.tracked) return; // why would it be here if it's not tracked?
      const bodyLastFrame = prevFrame.bodies.fiter(b => b.bodyIndex === body.bodyIndex);

      jointNames.forEach(jointName => {

        const features = {
          velocity: v3(),
          smoothedVelocity: v3(),
          magnitude: 0,
          smoothedMagnitude: 0
          //energy: 0,
        };

        const curr = jointCameraAsV3(body.joints[jointName]);
        const prev = jointCameraAsV3(bodyLastFrame.joints[jointName]);

        v3.sub(features.velocity, curr, prev);
        features.magnitude = v3.magnitude(curr);

        frames.forEach((currFrame, frameIdx) => {
          if (frameIdx === frames.length-1) return;
          const prevFrame = frames[frameIdx + 1];
          const currBody = currFrame.bodies.fiter(b => b.bodyIndex === body.bodyIndex);
          const prevBody = prevFrame.bodies.fiter(b => b.bodyIndex === body.bodyIndex);
          const curr = jointCameraAsV3(currBody.joints[jointName]);
          const prev = jointCameraAsV3(prevBody.joints[jointName]);
          const smoothing = (frames.length - frameIdx) / frames.length;
          const vel = v3();
          v3.sub(vel, curr, prev);
          v3.scale(vel, vel, smoothing);
          v3.add(features.smoothedVelocity, vel, features.smoothedVelocity);

          features.smoothedMagnitude += v3.magnitude(curr) * smoothing;
        });

        v3.scale(features.smoothedVelocity, features.smoothedVelocity, 1/frames.length);
        features.smoothedMagnitude /= frames.length;
      });

      console.log('joint', jointName, 'features', features);
    });

  }
}

function jointCameraAsV3 (joint) {
  const { x: cameraX, y: cameraY, z: cameraZ } = camera;
  return { x, y, z };
}

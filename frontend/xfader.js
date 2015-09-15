
export default function xfader (buffers, actx, output, transitionTime) {

  let gains = buffers.map(b => {
    let gain = actx.createGain();
    gain.connect(output);
    gain.value = 0;
    return gain;
  });

  let samples = [];

  let sampleForBuffer = (idx) => {
    let sample = actx.createBufferSource();
    sample.buffer = buffers[idx];
    sample.connect(gains[idx]);
    sample.onended = () => {
      sample.disconnect();
    }
    return sample;
  }

  let fadeTo = (toIndex) => {
    let future = actx.currentTime + transitionTime;
    gains.forEach((g, i) => {
      if (toIndex === i) return;
      g.gain.linearRampToValueAtTime(0, future);
    });
    gains[toIndex].gain.linearRampToValueAtTime(1.0, future);
    if (samples[toIndex]) samples[toIndex].stop();
    let sample = samples[toIndex] = sampleForBuffer(toIndex);
    sample.start();
  }

  return {
    fadeTo
  }
}
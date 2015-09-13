
export default function xfader (buffers, actx, output, transitionTime) {
  
  let gains = buffers.map(b => {
    let gain = actx.createGain();
    gain.connect(output);
    gain.value = 0;
    return gain;
  });

  let samples = buffers.map((b, i) => {
    let sample = actx.createBufferSource();
    sample.buffer = b;
    sample.connect(gains[i]);
    sample.onended = () => {
      sample.disconnect();
      gains[i].disconnect();
    }
    return sample;
  });

  let start = (index) => {
    samples[index].start();
  }

  let fadeTo = (toIndex) => {
    let future = actx.currentTime + transitionTime;
    gains.forEach((g, i) => {
      if (toIndex === i) return;
      g.gain.linearRampToValueAtTime(0, future);
    });
    gains[toIndex].gain.linearRampToValueAtTime(1.0, future);
    samples[toIndex].start();
  }

  return {
    start, fadeTo
  }
}
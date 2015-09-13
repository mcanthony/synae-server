export default function asciiDTWPath (path, w, h) {
  var all = new Array(w * h);

  // x are columns
  // y are rows (+ == down)
  path.forEach(xy => {
    let [x, y] = xy;
    all[(y * w) + x] = 'x';
  });

  let out = '';

  for (let i = 0; i < all.length; i++) {
    if (i % w === 0) out += '\n';
    if (all[i]) out += all[i];
    else out += '·';
  }

  return out;
}
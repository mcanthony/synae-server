import DTW from 'dtw';

export default function dtwSum (input, recorded) {
  let score = 0;
  Object.keys(input).forEach(k => {
    let series = input[k];
    let rec = recorded[k];
    let dtw = new DTW();
    score += dtw.compute(series, rec);
  });
  return score;
}
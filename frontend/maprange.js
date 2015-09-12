export default function (input, inputMax, inputMin, outputMin, outputMax) {
  return outputMin + ((outputMax - outputMin) / (inputMax - inputMin)) * (input - inputMin);
}
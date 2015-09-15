'use strict';
var THROTTLE = 2000;
var currLeft = {
  dy: []
}

var prevLeft = {
  y: [0]
}

var nowLeft = +new Date;
var prevUp = nowLeft;
var nowPoint = nowLeft;
var prevPoint = nowPoint;

var onLeft = function () {};
var onPoint = function () {};

exports.onLeftGesture = function onLeftGesture(cb) { onLeft = cb; }
exports.onPointGesture = function onPointGesture(cb) { onPoint = cb; }

exports.updateLeftGesture = function updateLeftGesture(left) {
  nowLeft = +new Date;
  var diffY = (left.hand.cameraY - prevLeft.y[0]);
  
  prevLeft.y.unshift(left.hand.cameraY);
  currLeft.dy.unshift(diffY);
  if (currLeft.dy.length > 10) {
    currLeft.dy.pop();
    prevLeft.y.pop();
  }
  
  var sum = currLeft.dy.reduce(function (sum, dy) {
    return sum + dy;
  }, 0)
 
  if (sum >= 0.6) {
    if (nowLeft - prevUp >= THROTTLE) {
      onLeft();
      prevUp = nowLeft;
    }
  }
}

exports.updatePointGesture = function updatePointGesture(hand, elbow, wrist, head, handState) {
  nowPoint = +new Date;
  var forearm = Math.sqrt(Math.pow((elbow.cameraX - wrist.cameraX), 2) + Math.pow(elbow.cameraY - wrist.cameraY, 2)) / 2;
  if (hand.cameraY >= (head.cameraY + forearm) && handState === 4) {
    if (nowPoint - prevPoint >= THROTTLE) {
      onPoint();
      prevPoint = nowPoint;
    }
  }
}
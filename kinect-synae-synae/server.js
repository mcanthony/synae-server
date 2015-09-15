'use strict';

var rhizome = require('rhizome-server');
var Kinect = require('kinect2');
var gestures = require('./gestures');
var kinect = new Kinect();

var HOSTNAME = process.env.rhizome_host;
var PORT = process.env.rhizome_port || 80;
var kinectAddress = '/kinect-events';
var THROTTLE = 30;

var ts = 0;
var count = 0;

var connected;
var log;
var send = true;
var sendUpwards = false;
var sendLeft = true;

var state;
var bodyIndex = null;

process.stdout.setEncoding('utf8');
process.stdin.setEncoding('utf8');
process.stdin.resume();

if (kinect.open()) {
  
  console.log('[rhizome] starting at... ', HOSTNAME, ' : ', PORT);
  
  var client = new rhizome.websockets.Client({
    hostname: HOSTNAME,
    port: PORT
  });
  
  client.start(function(err) {
    if (err) throw err;
    console.log('[rhizome] started');
  })
  
  client.on('connected', function() {
    console.log('[rhizome] asking for world state....');
    client.send('/sys/subscribe', ['/world-state']);
    client.send('/sys/resend', ['/world-state']);
  })
  
  client.on('message', function(addr, args) {
    if (addr === '/world-state') {
      //console.log('\n[rhizome] world state gained');
      connected = true;
      state = JSON.parse(args[0]);
    }
  })
  
  gestures.onLeftGesture(function () {
    console.log('\n[gesture] left up');
    if (send && sendLeft && !sendUpwards) {
      client.send(kinectAddress, ['left']);
      sendLeft = false;
      sendUpwards = true;
    }
  })
  
  gestures.onPointGesture(function () {
    console.log('\n[gesture] point up');
    if (send && sendUpwards && !sendLeft) {
      client.send(kinectAddress, ['upwards-point']);
      sendLeft = false;
      sendUpwards = false;
    }
  })
  
  var notified;
  kinect.on('bodyFrame', function(bodyFrame) {
    var bodies = bodyFrame.bodies || [];
    
    ts++;
    if (!connected) {
      if (ts >= THROTTLE) {
        ts = 0;
        process.stdout.write('[kinect] waiting for server connection...[' + ++count + ']\x1B[0G');
        
        if (count >= 30) {
          console.log('\n');
          console.log('[rhizome] connection timeout');
          exit(0);
        } 
      }
      return;
    }
    
    bodyIndex = bodyIndex !== null ? bodyIndex : find(bodies);
    var body = bodies[bodyIndex];
    
    if (body && body.tracked) {
      if (!notified) {
        console.log('\n[kinect] tracking gestures...');
        notified = true;
      }
      
      var head = body.joints[Kinect.JointType.head];
      
      var stand = {
        base: body.joints[Kinect.JointType.spineBase],
        mid: body.joints[Kinect.JointType.spineMid],
        shoulder: body.joints[Kinect.JointType.spineShoulder]
      }
      var left = {
        shoulder: body.joints[Kinect.JointType.shoulderLeft],
        elbow: body.joints[Kinect.JointType.elbowLeft],
        wrist: body.joints[Kinect.JointType.wristLeft],
        hand: body.joints[Kinect.JointType.handLeft]
      }
      
      if (log) {
        var msg = 'on';
        if (!send || (!sendLeft && !sendUpwards)) {
          msg = 'off';
        }
        
        process.stdout.write('msg: ' + msg + ' bodyIdx: ' + body.bodyIndex +
                              ' bodyDepth: ' + stand.mid.cameraZ.toFixed(4) +   
                              ' headY: ' + head.cameraY.toFixed(4) + 
                              ' left: ' + left.hand.cameraY.toFixed(4) +
                              ' leftHandState: ' + body.leftHandState + '\x1B[0G');  
      }
      
      gestures.updateLeftGesture(left);
      gestures.updatePointGesture(left.hand, left.elbow, left.wrist, head, body.leftHandState);
    }
    
    bodies.forEach(function (body) {
      if (body.tracked) {
        
      }
    })
  })
  
  // start the body reading
  kinect.openBodyReader();
  
  // listen for some basic commands
  process.stdin.on('data', function (data) {
    var message = data.toString().trim();
    if (message === 'exit') {
      exit(0);
    }
    
    else if (message === 'log') {
      log = !log;
    }
    
    else if (message === 'msg off') {
      console.log('[debug] msg off');
      send = false;
    }
    
    else if (message === 'msg on') {
      console.log('[debug] msg on');
      send = true;
    }
    
    else if (message === 'send left') {
      console.log('[debug] sending left message');
      client.send(kinectAddress, ['left']);
      sendLeft = false;
      sendUpwards = true;
    }
    
    else if (message === 'send upwards') {
      console.log('[debug] sending upwards message');
      client.send(kinectAddress, ['upwards-point']);
      sendLeft = false;
      sendUpwards = false;
    }
    
    else {
      console.log('\n[help] da faq is:', message + '?');
      console.log('\n[help] commands: log, msg on, msg off, send left, send upwards, exit');
    }
  })
}
else {
	console.log('\n[kinect] error opening the kinect');
	process.exit(1);
}

function exit(int) {
  console.log('\n[rhizome] stopping...')
  client.stop(function () {
    console.log('[help] bye bye');
    process.exit(int);
  });
}

function find(bodies) {
  var out = null;
  bodies = bodies || [];
  bodies.forEach(function (body) {
    if (body.tracked && body.joints[Kinect.JointType.spineMid].cameraZ < 2.0) {
      console.log('[tracking] index', body.bodyIndex);
      out = body.bodyIndex;
    }
  })
  
  return out;
}
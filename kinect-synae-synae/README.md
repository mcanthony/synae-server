# HOW TO WINDOWS

**Getting to where you want to be**

1. open conemu (normally windows + tilda)
2. should open to `~/projects`, otherwise safe to `cd ~/projects` using tilda for home directory
3. `cd synae-server/kinect-synae-synae`

**Setting environment vars**

1. `$env:rhizome_host='192.168.1.220'`
2. `$env:rhizome_port='80'`

**Starting the gestures**

1. `npm start`

**In process commands**

once the app is running, type a below command and hit return to execute stuff:

- *exit* : close connection to rhizome, close the kinect, process.exit(0)
- *msg off* : stop the kinect from sending all rhizome messages (gestures are still matched)
- *msg on* : enable the sending of messages as the kinect matches gestures (enabled by default)
- *log* : log the current state of the tracked kinect state (msg, bodyIndex, bodyDepth (in meters), headY, leftHandY, leftHandState)
- *send left* : simulate the 'left' gesture and send to rhizome server
- *send upwards* : simulate the 'upwards' gesture and send to rhizome server

**Tips**

- to see what the kinect sees, open the Kinect SDK browser by hitting the windows key and just typing 'kinect' to search. once the browser is open, hit 'samples c++' from the top navigation and run the 'Body Basics-D2D'. It'll open the kinect and start tracking
- to verify that the kinect is actually recognized by windows (because sometimes it isn't...ugh), windows key and type 'kinect' to search for the 'Kinect Configuration Verifier'.
- If for whatever reason the kinect is not recognized, first try another usb port. If that doesn't work then pull an IT Crowd and restart the laptop...

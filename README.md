
synae-server
------------

(Mostly a temporary name)

This project is composed of several parts:

- routing server (`npm start`): (rhizome-server) responsible for routing messages and serving some static files
- client: a web browser that will be an audience member
- conductor: a node server that receives messages from either a kinect or other device and sends to the clients via the routing server
- conductor-client: a web browser that can act like a conductor for manual triggering

Also still needed is configuration per performance, such as how many spatial sections there will be. Idea: `performances/name-of-performance.js` with config info.

Running
-------

- `npm install`
- `npm start`
- visit `http://localhost:8080`
- Click once to activate the audio context
- `$ DEBUG=* bin/send /tones` to tell all devices to play a note
- Debugging output can be activated with:
  - browser: `localStorage.debug = '*'`
  - node: `DEBUG=*`

You should hear a note from a CMaj chord played on all connected devices!

Things Needed
-------------

- /conductor: performance admin panel
- /: connect as an audience member
- /

Global Performance State:

- valid audience sections
- current audio world
- connected clients

Client Performance State:

- which audience section
- current audio world

Client Data

- world input mechanisms
- what sample sets map to what audience sections (preconfigured?)


Inspiration / Shameless Stealing
--------------------------------

- https://github.com/sebpiq/fields
- https://github.com/sebpiq/rhizome
- http://funktion.fm/#post/rhizome-interactive-performances-and-network-topologies

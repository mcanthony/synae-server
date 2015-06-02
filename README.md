
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
- visit `http://localhost:8080` (does nothing yet)
- Debugging output can be activated with:
  - browser: `localStorage.debug = '*'`
  - node: `DEBUG=*`

Inspiration / Shameless Stealing
--------------------------------

- https://github.com/sebpiq/fields
- https://github.com/sebpiq/rhizome

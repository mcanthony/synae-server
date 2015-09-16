
synae-server
------------

(Mostly a temporary name)

This project is composed of several parts:

- routing server (`npm start`): (rhizome-server) responsible for routing messages and serving some static files
- audience-panel: a web browser that will be an audience member
- conductor-panel: a web browser that can act like a conductor for manual triggering
- conductor: a node server that receives messages from either a kinect or other device and sends to the clients via the routing server (UNIMPLEMENTED, should this just happen via kinect stuff?)

Running
-------

- `npm install`
- `npm start`
- CONDUCTOR: visit `http://localhost:8080?conductor`
  - increment Group A in the UI to be on flutter
- AUDIENCE MEMBERS: visit `http://localhost:8080`
  - choose Group A, click the button to hear audio
- Debugging output can be activated with:
  - browser: `localStorage.debug = '*'`
  - node: `DEBUG=*`

Running in Production
---------------------

- `$ sudo HTTP_PORT=80 npm run server`
- `$ sudo RHIZOME_HOST=192.168.1.220 npm run dns`
- Ensure router has RHIZOME_HOST specified as DNS server
- Connect to router, type `anything.com`

Inspiration / Shameless Stealing
--------------------------------

- https://github.com/sebpiq/fields
- https://github.com/sebpiq/rhizome
- http://funktion.fm/#post/rhizome-interactive-performances-and-network-topologies

- http://www.truststc.org/reu/10/Reports/DasGreenPerezMurphy_Paper.pdf
- http://cs.fit.edu/~pkc/papers/tdm04.pdf

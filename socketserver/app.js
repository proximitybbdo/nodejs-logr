require.paths.unshift(__dirname + '/lib');
require.paths.unshift(__dirname);

if(process.argv.length <= 4) {
  console.log('# Arguments mismatch.');
  console.log('$ node app.js db_host db_port db_name [server_port verbose]');
  console.log('# \'verbose\' can be 1 or 0.');
  
  process.exit(1);
}

// Init
var Server = require('server').Server;
var DataModel = require('data_model').DataModel;
var SocketIO = require('socket_io').SocketIO;

var server;
var model;
var sio;
var is_verbose = false;
var server_port = 8111;

// Optional Server Port
if(process.argv.length > 5) {
  var port = process.argv[5];

  if(parseInt(port) == port)
    server_port = parseInt(port);
}

// Optional Verbose
if(process.argv.length > 6)
  is_verbose = Boolean(process.argv[6]);

// Server
server = new Server(server_port, model);
server.verbose(is_verbose);
server.connect();

// Model
model = new DataModel(process.argv[2], process.argv[3], process.argv[4]);
model.verbose(is_verbose);
model.connect();

// Socket.IO server
if(process.argv.length > 7 && Boolean(process.argv[7])) {
  sio = new SocketIO(server_port + 11);

  sio.start();
  
  server.listen(function(data) {
    sio.push(data);
  });
}

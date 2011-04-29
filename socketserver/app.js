require.paths.unshift(__dirname + '/lib');
require.paths.unshift(__dirname);

var Server = require('server').Server;
var DataModel = require('data_model').DataModel;
var SocketIO = require('socket_io').SocketIO;

if(process.argv.length > 4) {
  var model = new DataModel(process.argv[2], process.argv[3], process.argv[4]);

  // Optional Server Port
  if(process.argv.length > 5) {
    var port = process.argv[5];

    if(parseInt(port) == port)
      server_port = parseInt(port);
  }
  
  // Optional Verbose
  if(process.argv.length > 6)
    is_verbose = Boolean(process.argv[6]);

  model.connect();

  var server = new Server(server_port, model);
  
  server.connect();

  // Socket.IO server
  if(process.argv.length > 7 && Boolean(process.argv[7])) {
    var sio = new SocketIO(server_port + 11);

    sio.start();
    
    server.listen(function(data) {
      sio.push(data);
    });
  }
} else {
  console.log('# Arguments mismatch.');
  console.log('$ node app.js db_host db_port db_name [server_port verbose]');
  console.log('# \'verbose\' can be 1 or 0.');
  
  process.exit(1);
}

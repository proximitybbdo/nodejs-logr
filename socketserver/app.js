require.paths.unshift(__dirname + '/lib');
require.paths.unshift(__dirname);

var Server = require('server').Server;
var DataModel = require('data_model').DataModel;

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
} else {
  console.log('# Arguments mismatch.');
  console.log('$ node app.js db_host db_port db_name [server_port verbose]');
  console.log('# \'verbose\' can be 1 or 0.');
  
  process.exit(1);
}

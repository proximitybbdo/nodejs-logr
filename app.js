var net = require('net');
var mongoose = require('mongoose');

var global = 0;
var server;
var server_port = 8125;
var msg_limiter = '~|~';
var cmd_limiter = '~%~';
var is_verbose = false;

var LogrMessageModel;

// Init
function run() {
	if(process.argv.length > 4) {
		setup_db(process.argv[2], process.argv[3], process.argv[4]);

		// Optional Server Port
		if(process.argv.length > 5) {
			var port = process.argv.length[5];
			
			if(parseInt(port) == port)
				server_port = parseInt(port);
		}
		
		// Optional Verbose
		if(process.argv.length > 6)
			is_verbose = Boolean(process.argv.length[6]);

		server.listen(server_port); 

		console.log('# Server start @ port ' + server_port);
	} else {
		console.log('# Arguments mismatch.');
		console.log('$ node app.js db_host db_port db_name [server_port verbose]');
		console.log('# \'verbose\' can be 1 or 0.');
		
		process.exit(1);
	}
}

function setup_db(host, port, db_name) {
	console.log('# Database Setup');
	
	var conn = 'mongodb://' + host + ':' + port + '/' + db_name;
	
	mongoose.connect(conn);
	
	console.log('# Connected to \'' + conn + '\'');

	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;

	var LogrMessage = new Schema({
		id: ObjectId, msg: String, 
		type: String, 
		meta: String, 
		project: String, 
		uid: String, 
		date: {type: Date, default: Date.now}
	});

	mongoose.model('LogrMessage', LogrMessage);

	LogrMessageModel = mongoose.model('LogrMessage');
}

function save_log(data, call_back) {
	var obj = JSON.parse(data);
	var log = new LogrMessageModel();

	log.msg = obj.msg;
	log.type = obj.type;
	log.meta = obj.meta;
	log.project = obj.project;
	log.uid = obj.uid;

	log.save(call_back);
}

// Server
server = net.createServer(function (socket) {
	console.log('################');
	console.log('# Server Connect');
	
	socket.setEncoding('utf8');
	
	global++;
	
	socket.on('connect', function () {
		socket.write('Proximity BBDO Socket Logr (' + global + ')\0');
		
		console.log('# New Client ' + socket.remoteAddress + ':' + socket.remotePort);
	});
	  
	socket.on('data', function (data) {
		var messages = data.split(msg_limiter);
		
		while(messages.length > 0) {
			var msg = messages.shift();
			
			if(is_verbose)
				console.log("# \tLog :: " + msg);
			
			if(msg.length > 0) {
				save_log(msg, function(err) {
					if(err) {
						console.log('# Data Error ' + console.dir(err, false));
						console.log('# Info \n ' + console.dir(socket, false));

						socket.write(console.dir(err, false) + '\0');
					}
				});
			}
		}
	});
	
	socket.on('end', function () {
		console.log('# Exit Client ' + socket.remoteAddress + ':' + socket.remotePort);
		
		socket.end();
	});
});

run();
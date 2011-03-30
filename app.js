var net = require('net');
var mongoose = require('mongoose');

var global = 0;
var server;
var port = 8125;
var msg_limiter = '~|~';
var cmd_limiter = '~%~';

var LogrMessageModel;

// Init
function run() {
	if(process.argv.length >= 5) {
		setup_db(process.argv[2], process.argv[3], process.argv[4]);

		server.listen(port); 

		console.log('# Server start @ port ' + port);
	} else {
		console.log('# Arguments mismatch');
		console.log('## node app.js host port db_name');
		
		process.exit(1);
	}
}

function setup_db(host, port, db_name) {
	console.log('# Database Setup');
	
	var conn = 'mongodb://' + host + ':' + port + '/' + db_name;
	
	mongoose.connect(conn);
	
	console.log('# Connected to \'' + conn + '\'');

	var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

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
	
	socket.setEncoding("utf8");
	
	global++;
	
	socket.on('connect', function () {
		socket.write('Proximity BBDO Socket Logr (' + global + ')\0');
		
		console.log('# New Client ' + socket.remoteAddress + ':' + socket.remotePort);
		
		// console.log(console.dir(socket, false)); // Debug info
	});
	  
	socket.on('data', function (data) {
		var messages = data.split(msg_limiter);
		
		while(messages.length > 0) {
			var msg = messages.shift();
			
			if(msg.length > 0) {
				save_log(msg, function(err) {
					if(err) {
						console.log('# Data Error ' + sys.inspect(err, false));

						socket.write(sys.inspect(err, false) + '\0');
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
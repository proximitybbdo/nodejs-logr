var net = require('net')
	, sys = require('sys')
	, mongoose = require('mongoose');

// Variables are global per application start/stop.
var global = 0;
var server;
var port = 8125;

// Init
function run() {
	setup_db();

	server.listen(port); 

	console.log('# Server start @ port ' + port);
}

// Database
var LogrMessageModel;

function setup_db(host, db_name) {
	console.log('# Database Setup');
	
	mongoose.connect('mongodb://' + host + '/' + db_name);

	var Schema = mongoose.Schema
		,	ObjectId = Schema.ObjectId;

	var LogrMessage = new Schema({
			id 			: ObjectId
		,	msg 		: String
		, type		: String
		, meta		: String 
		,	date 		: {type: Date, default: Date.now}
	});

	mongoose.model('LogrMessage', LogrMessage);

	LogrMessageModel = mongoose.model('LogrMessage');
}

// Server
server = net.createServer(function (socket) {
	console.log('################');
	console.log('# Server Connect');
	
	socket.setEncoding("utf8");
	
	global++;
	
	// Variables are connection dependend.
	// var test = 1;
	
	socket.on('connect', function () {
		socket.write('Proximity BBDO Socket Logr (' + global + ')\0');
		
		console.log('# New Client ' + socket.remoteAddress + ':' + socket.remotePort);
		
		sys.puts(sys.inspect(socket, false)); // Debug info
	});
	  
	socket.on('data', function (data) {
		var obj = JSON.parse(data);
		var msg = new LogrMessageModel();
		
		msg.msg 	= obj.msg;
		msg.type 	= obj.type;
		msg.meta 	= obj.meta;
		
		msg.save(function(err){
			console.dir(err);
		});
		
		socket.write(msg.date + ': ' + msg.id + ' :' + msg.message + '\0');
	});
	
	socket.on('end', function () {
		socket.end();
	});
});

run();
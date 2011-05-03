var net = require('net');

var Scoper = require('./utils/scoper').Scoper;

var Server = function(port, data_model) {
  this._init(port, data_model);
}

Server.prototype = {
  port: null, 
  is_verbose: true,
  msg_limiter: '~|~', 
  data_model: null,
  sock: null,
  socket_server: null, 
  listener_callback: null, 
  
  _policy_listener: null, 

  _init: function(port, data_model) {
    console.log("# Server :: Construct");

    this.port = port;
    this.data_model = data_model;
  }, 

  connect: function() {
    this.socket_server = net.createServer(Scoper.create(this, this._server_handler));
    this.socket_server.listen(this.port); 

		console.log('# Server :: Server start @ port ' + this.port);
  },

  verbose: function(value) {
    this.is_verbose = value;
  },

  send: function(msg) {
    this.sock.write(msg + '\0');
  },

  policy: function() {
    var xml = '<?xml version="1.0"?>';

    xml += '<!DOCTYPE cross-domain-policy SYSTEM "http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd">\n';
    xml += '<cross-domain-policy>\n';
    xml += '<allow-access-from domain="*" to-ports="*"/>\n';
    xml += '</cross-domain-policy>\n';
    
    return xml;         
  },

  listen: function(callback) {
    this.listener_callback = callback;
  },

  _save_data: function(data) {
    if(this.is_verbose)
      console.log("# Server :: Save Data" + data);

    var self = this;

    this.data_model.save(data, function(err) {
		  if(err) {
			  console.log('# Server :: Data Error ' + console.dir(err, false));
				console.log('# Server :: Info \n ' + console.dir(self.sock, false));

				self.send(console.dir(err, false));
			}
		});
  }, 

  _on_connection_start: function() {
    if(this.is_verbose)
      console.log("# Server :: On Connection Start");
  }, 

  _on_connection_end: function() {
    if(this.is_verbose)
      console.log("# Server :: On Connection End");

    this.sock.end();                 
  },

  _on_policy_check: function(data) {
    if(this.is_verbose)
      console.log("# Server :: On Policy Check");

    this.sock.removeListener('data', this._policy_listener);
    this.sock.on('data', Scoper.create(this, this._on_data));

    if(data == '<policy-file-request/>\0') {
      if(this.is_verbose)
        console.log("# Server :: \tLog :: \n" + this.policy());

      this.send(this.policy());
    }
  },

  _on_data: function(data) {
    var messages = data.split(this.msg_limiter);
		
    if(this.is_verbose && messages.length > 0)
      console.log("# Server :: \tLog :: " + messages.length);
		
		while(messages.length > 0) {
			var msg = messages.shift();
			
			if(this.is_verbose)
				console.log("# Server :: \tLog :: " + msg);
			
			if(msg.length > 0) {
        this._save_data(msg);

        this.listener_callback(msg);
			}
		}   
  }, 

  _on_error: function(err) {
    if(this.sock && this.sock.end) {
      if(this.is_verbose)
        console.log("# Server :: On Error");

      this.sock.end();
      this.sock.destroy();
    }
  }, 

  _server_handler: function(socket) {
    if(this.is_verbose)
      console.log("# Server :: Server Handler");

    this.sock = socket;
    this.sock.setEncoding('utf8');

    this.sock.on('connect', Scoper.create(this, this._on_connection_start));
    this.sock.on('end', Scoper.create(this, this._on_connection_end));
    this.sock.on('error', Scoper.create(this, this._on_error));

    this._policy_listener = Scoper.create(this, this._on_policy_check);

    this.sock.on('data', this._policy_listener);

    this.send(this.policy());
  }
};

exports.Server = Server;

var net = require('net');

var Server = function(port, data_model) {
  this.port = port;
  this.is_verbose = true;
  this.msg_limiter = '~|~';
  this.data_model = data_model;

  this.socket_server = net.createServer(this.server_handler);
}

Server.prototype = {
  connect: function() {
    this.socket_server.listen(this.port); 

		console.log('# Server start @ port ' + this.port);
  },

  save_data: function(data) {
    this.data_model.save(data, function(err) {
		  if(err) {
			  console.log('# Data Error ' + console.dir(err, false));
				console.log('# Info \n ' + console.dir(this.sock, false));

				this.send(console.dir(err, false));
			}
		});
  }, 

  server_handler: function(socket) {
    this.sock = socket;

    this.sock.setEncoding('utf8');
    
    this.sock.on('connect', this.on_connect_start);
    this.sock.on('end', this.on_connection_end);
    this.sock.on('error', this.on_error);
    this.sock.on('data', this.on_policy_check);

    this.send(policy());
  },

  send: function(msg) {
    this.sock.write(msg + '\0');
  }, 

  on_connection_start: function() {
                           
  }, 

  on_connection_end: function() {
    this.sock.end();                 
  },

  on_policy_check: function(data) {
    this.sock.removeListener('data', this.on_policy_check);
    this.sock.on('data', this.on_data);

    if(data == '<policy-file-request/>\0') {
      if(this.is_verbose)
        console.log("# \tLog :: \n" + policy());

      this.send(this.policy());
    }
  },

  on_data: function(data) {
    var messages = data.split(this.msg_limiter);
		
    if(this.is_verbose && messages.length > 0)
      console.log("# \tLog :: " + messages.length);

		while(messages.length > 0) {
			var msg = messages.shift();
			
			if(this.is_verbose)
				console.log("# \tLog :: " + msg);
			
			if(msg.length > 0)
			  this.save_data(msg);
		}   
  }, 

  on_error: function(err) {
    if(this.sock && this.sock.end) {
      this.sock.end();
      this.sock.destroy();
    }
  }, 

  policy: function() {
    var xml = '<?xml version="1.0"?>\n<!DOCTYPE cross-domain-policy SYSTEM'
            + ' "http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd">\n<cross-domain-policy>\n';

    xml += '<allow-access-from domain="*" to-ports="*"/>\n';
    xml += '</cross-domain-policy>\n';
    
    return xml;         
  }
}

exports.Server = Server;

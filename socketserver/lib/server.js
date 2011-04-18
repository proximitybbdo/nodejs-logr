var net = require('net');

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

  _init: function(port, data_model) {
    console.log("S :: Construct");

    this.port = port;
    this.data_model = data_model;
  }, 

  connect: function() {
    var self = this;

    this.socket_server = net.createServer(function(socket) {
      if(self.is_verbose)
        console.log("S :: Server Handler");

      self.sock = socket;
      self.sock.setEncoding('utf8');

      console.log(this);
      
      self.sock.on('connect', self._on_connection_start);
      self.sock.on('end', self._on_connection_end);
      self.sock.on('error', self._on_error);
      self.sock.on('data', self._on_policy_check);

      self.send(self.policy());
    });
    
    this.socket_server.listen(this.port); 

		console.log('S :: Server start @ port ' + this.port);
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

  _save_data: function(data) {
    if(this.is_verbose)
      console.log("S :: Save Data" + data);

    this.data_model.save(data, function(err) {
		  if(err) {
			  console.log('# Data Error ' + console.dir(err, false));
				console.log('# Info \n ' + console.dir(this.sock, false));

				this.send(console.dir(err, false));
			}
		});
  }, 

  _on_connection_start: function() {
    if(this.is_verbose)
      console.log("S :: On Connection Start");
  }, 

  _on_connection_end: function() {
    if(this.is_verbose)
      console.log("S :: On Connection End");

    this.sock.end();                 
  },

  _on_policy_check: function(data) {
    if(this.is_verbose)
      console.log("S :: On Policy Check");

    this.sock.removeListener('data', this.on_policy_check);
    this.sock.on('data', this.on_data);

    if(data == '<policy-file-request/>\0') {
      if(this.is_verbose)
        console.log("S :: \tLog :: \n" + policy());

      this.send(this.policy());
    }
  },

  _on_data: function(data) {
    var messages = data.split(this.msg_limiter);
		
    if(this.is_verbose && messages.length > 0)
      console.log("S :: \tLog :: " + messages.length);

		while(messages.length > 0) {
			var msg = messages.shift();
			
			if(this.is_verbose)
				console.log("S :: \tLog :: " + msg);
			
			if(msg.length > 0)
			  this._save_data(msg);
		}   
  }, 

  _on_error: function(err) {
    if(this.sock && this.sock.end) {
      if(this.is_verbose)
        console.log("S :: On Error");

      this.sock.end();
      this.sock.destroy();
    }
  }, 

  _server_handler: function(socket) {
    if(this.is_verbose)
      console.log("S :: Server Handler");

    this.sock = socket;
    this.sock.setEncoding('utf8');

    console.log(Server);
    
    this.sock.on('connect', this._on_connection_start);
    this.sock.on('end', this._on_connection_end);
    this.sock.on('error', this._on_error);
    this.sock.on('data', this._on_policy_check);

    this.send(this.policy());
  }
};

exports.Server = Server;

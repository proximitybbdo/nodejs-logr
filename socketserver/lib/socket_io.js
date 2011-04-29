var http = require('http');
var io = require('socket.io');
    
var Scoper = require('./utils/scoper').Scoper;

var SocketIO = function(port) {
  this._init(port);
}

SocketIO.prototype = {
  port: null, 
  server: null, 
  socket: null, 
  clients: [], 
  is_verbose: false, 

  _init: function(port) {
    console.log("SIO :: Construct");

    this.port = port;
  }, 

  start: function() {
    var $this = this;

    this.server = http.createServer(function(req, res) { 
      res.writeHead(200, {'Content-Type': 'text/html'}); 
      res.end('logr-server');
    });

    this.server.listen(this.port);
      
    this.socket = io.listen(this.server);
    
    this.socket.on('connection', function(client){ 
      $this._client_handler(client);
    });
  },

  push: function(data) {
    if(this.is_verbose)
      console.log("SIO :: Push :: " + data);

    if(this.clients.length > 0) {
      var listening_clients = this._get_listening_clients();
      
      for(var i in listening_clients)
        listening_clients[i].conn.send({raw: data});
    }
  },

  _client_handler: function(client) {
    var $this = this;
    var new_client = client;

    if(this.is_verbose)
      console.log("SIO :: Client connected (" + new_client.sessionId + ")"); 
     
    this.clients.push({conn: new_client, listening: false, filter: ''});

    new_client.on('message', function(data) {
      if($this.is_verbose)
        console.log("SIO :: Client message (" + this.sessionId + ") -> (" + data + ")");

      if(data.func == 'listen' && data.filter.length > 0) {
        if($this.is_verbose)
          console.log("SIO :: Client listening (" + this.sessionId + ")");

        $this._get_client(this.sessionId).listening = true;
        $this._get_client(this.sessionId).filter = data.filter;
      }
    }); 
      
    new_client.on('disconnect', function() {
      if($this.is_verbose)
        console.log("SIO :: Client disconnected (" + this.sessionId + ")"); 
      
      $this._remove_client(this.sessionId);
    }); 
  }, 

  _get_listening_clients: function() {
    return this.clients.filter(function(el, index, array) {
      if(el.listening && el.filter.length > 0)
        return true;
      else
        return false;
    });                      
  },

  _get_client: function(sessionId) {
    for(var i = 0; i < this.clients.length; i++) {
      if(this.clients[i].conn.sessionId == sessionId)
        return this.clients[i];
    }
  }, 

  _remove_client: function(sessionId) {
    for(var i = 0; i < this.clients.length; i++) {
      if(this.clients[i].conn.sessionId == sessionId) {
        this.clients.splice(i, 1);

        break;
      }
    }
  }
}

exports.SocketIO = SocketIO;

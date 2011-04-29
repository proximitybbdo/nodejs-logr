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
  client: null, 
  is_verbose: false, 

  _init: function(port) {
    console.log("SIO :: Construct");

    this.port = port;
  }, 

  start: function() {
    this.server = http.createServer(function(req, res) { 
      res.writeHead(200, {'Content-Type': 'text/html'}); 
      res.end('logr-server');
    });

    this.server.listen(this.port);
      
    this.socket = io.listen(this.server);

    var $this = this;
    
    this.socket.on('connection', function(client){ 
      if(this.is_verbose)
        console.log("SIO :: Client connected"); 
      
      $this.client = client;

      client.on('message', function(){
        if(this.is_verbose)
          console.log("SIO :: Client message"); 
      }); 
      
      client.on('disconnect', function(){
        if(this.is_verbose)
          console.log("SIO :: Client disconnected"); 
      }); 
    });
  }, 

  push: function(data) {
    if(this.is_verbose)
      console.log("SIO :: Push (" + this.client + "): " + data);

    if(this.client)
      this.client.send({raw: data});
  }
}

exports.SocketIO = SocketIO;

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
      console.log("SIO :: Client connected"); 
      
      $this.client = client;

      client.on('message', function(){
        console.log("SIO :: Client message"); 
      }); 
      
      client.on('disconnect', function(){
        console.log("SIO :: Client disconnected"); 
      }); 
    });
  }, 

  push: function(data) {
    console.log("SIO :: Push (" + this.client + "): " + data);

    if(this.client)
      this.client.send({raw: data});
  }
}

exports.SocketIO = SocketIO;

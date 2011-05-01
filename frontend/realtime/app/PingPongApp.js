// PingPongApp
// The main application (view)
// --------------------------

// Load the application once the DOM is ready, using `jQuery.ready`:
$(document).ready(function(){
  
  // create the app
  var ppAppController = new PingPongAppController($('body'));
  window.app = ppAppController;
  
  // create the socket
  var socket = new io.Socket('127.0.0.1', { port : 8122 });

  // connect + listen
  socket.connect();
  console.log('connecting to socket');
  
  socket.on('connect', function(){
    console.log('connect');
    socket.send({func: 'listen', filter: '*'});
  });

  socket.on('message', function(data){
    app.addLog(JSON.parse(data.raw));
  }); 
  
  socket.on('disconnect', function(){
    console.log('disconnect');
  }); 
});

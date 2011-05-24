// PingPongApp
// The main application (view)
// --------------------------

// Load the application once the DOM is ready, using `jQuery.ready`:
$(document).ready(function(){
  
  // create the socket
  try {
    var socket = new io.Socket('127.0.0.1', { port : 8122 });

    // connect + listen
    socket.connect();
    console.log('connecting to socket');
    
    // listeners
    socket.on('connect', function(){
      console.log('connect');

      // create the app
      var ppAppController = new PingPongAppController( [ $('body'), socket ] );
      window.app = ppAppController;
    });

    socket.on('message', function(data){
      app.addLog(data.raw);
    }); 
    
    socket.on('disconnect', function(){
      console.log('disconnect');
    }); 
    
  } catch(err) {
    $('body').append(ich.apperror( { errormsg: err } ));
  }

});

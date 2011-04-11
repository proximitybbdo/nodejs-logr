// requires & objects ------------------------------------------------------
var express = require('express');
var util = require('util');
var http = require('http');
var mongoose = require('mongoose');

// variables ---------------------------------------------------------------
var port = 8124;
var msg_limiter = '~|~';
var cmd_limiter = '~%~';
var is_verbose = false;
var app;
var LogrMessageModel;
var db;

Array.prototype.contains = function(obj) {
  var i = this.length;
  while (i--) {
    if (this[i] === obj) {
      return true;
    }
  }
  return false;
}

function run() {
  if(process.argv.length === 7) {
    setup_db(process.argv[2], process.argv[3], process.argv[4], process.argv[5], process.argv[6]);

    // init app
    init_app(port);
  } else {
    console.log('# Arguments mismatch.');
    console.log('$ node app.js db_host db_port db_user db_pass db_name');

    process.exit(1);
  }  
}

function init_app() {
  app = express.createServer();

  // enable haml view engine
  app.register('.haml', require('hamljs'));
  app.set('view engine', 'haml');

  //------------------------------------------------------------------------
  // routes
  //------------------------------------------------------------------------

  // get unique project types
  app.get('/', function(req, res) {

    var projects = new Array();

    LogrMessageModel.find({}, ['project'], {'group': 'type'}, function(err, logs) {
      for(var i = 0; i < logs.length; i++){
        var log = logs[i];

        if(!projects.contains(log.project))
          projects.push(log.project);
      }

      res.render('index', {'title': 'Proximity Logr', 'projects': projects} );
    });

  });

  // get logs for a projects
  app.get('/:project', function(req, res) {
    LogrMessageModel.find({project: req.params.project}, function(err, logs) {
      res.render('project', {'title': 'Proximity Logr', 'logs': logs, 'project': req.params.project} );
    });
  });

  app.listen(port);

  util.log('###############################');
  util.log('# Webserver ready');
  util.log('# Listening on port ' + port);
  util.log('################################');
}

function setup_db(host, port, user, pass, db_name) {
	util.log('# database setup');
	
	var conn = 'mongodb://' + user + ':' + pass + '@' + host + ':' + port + '/' + db_name;
	
	db = mongoose.connect(conn);
	
	util.log('# Connected to \'' + conn + '\'');

	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;

	var LogrMessage = new Schema({
		id: ObjectId, 
		guid: String, 
		msg: String, 
		type: String, 
		meta: String, 
		project: String, 
		uid: String, 
		date: {type: Date, default: Date.now}
	});

	mongoose.model('LogrMessage', LogrMessage);

  LogrMessageModel = mongoose.model('LogrMessage');
}

run();

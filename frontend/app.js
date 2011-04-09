// requires & objects
var express = require('express');
var util = require('util');
var http = require('http');
var mongoose = require('mongoose');

// config
var db_user = "proximity";
var db_pass = "ddt4ever";
var db_host = "flame.mongohq.com";
var db_port = "27029";
var db_dbname = "logr";

// variables
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

  // connect to db
  setup_db(db_user, db_pass, db_host, db_port, db_dbname);
  
  // init app
  init_app(port);

  // Optional Verbose
  if(process.argv.length > 6)
    is_verbose = Boolean(process.argv[6]);
}

function init_app() {
  app = express.createServer();

  // enable haml view engine
  app.register('.haml', require('hamljs'));
  app.set('view engine', 'haml');

  // routes
  app.get('/', function(req, res) {

    var projects = new Array();

    LogrMessageModel.find({}, ['project'], {'limit': 100}, function(err, logs) {
      for(var i = 0; i < logs.length; i++){
        var log = logs[i];

        if(!projects.contains(log.project))
          projects.push(log.project);
      }

      res.render('index', {'title': 'Proximity Logr', 'projects': projects} );
    });
  
    /*
var mongodb = require('mongodb');
var server = new mongodb.Server(db_host, db_port, {});
new mongodb.Db(db_dbname, server, {}).open(function (error, client) {
  if (error) throw error;

  console.log("connected");
  var collection = new mongodb.Collection(client, 'logrmessages');
  
  collection.find(function(err, cursor) {
    cursor.toArray(function(err, docs) {
      console.dir(docs);

    });

console.dir(cursor);
      res.render('index', {'title': 'Proximity Logr', 'projects': projects} );
  });

});
*/


  });

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

function setup_db(user, pass, host, port, db_name) {
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

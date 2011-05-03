var mongoose = require('mongoose');

var DataModel = function(host, port, db_name) {
  this.host = host;
  this.port = port;
  this.db_name = db_name;

  this.model;
}

DataModel.prototype = {
  model: null, 
  conn: '', 
  is_verbose: true,

  verbose: function(value) {
    this.is_verbose = value;
  },

  connect: function() {
    this.conn = 'mongodb://' + this.host + ':' + this.port + '/' + this.db_name;
    
    mongoose.connect(this.conn);
    
    if(this.is_verbose)
      console.log('# DataModel :: Connected to \'' + this.conn + '\'');

    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    this.model = new Schema({
      id: ObjectId, 
      guid: String, 
      msg: String, 
      type: String, 
      meta: String, 
      project: String, 
      uid: String, 
      date: {type: Date, default: Date.now}
    });

    mongoose.model('LogrMessage', this.model);        
  },

  disconnect: function () {
    if(this.is_verbose)
      console.log('# DataModel :: Disconnect');   
  }, 

  save: function(data, call_back) {
    var LogrMessageModel = mongoose.model('LogrMessage');
    
    try {
      var obj = JSON.parse(data);
      var log = new LogrMessageModel();

      log.guid = obj.guid;
      log.msg = obj.msg;
      log.type = obj.type;
      log.meta = obj.meta;
      log.project = obj.project;
      log.uid = obj.uid;

      log.save(call_back);
    } catch(err) {
      console.log('# DataModel :: Save Error: ' + err);
    }
  }
}

exports.DataModel = DataModel;

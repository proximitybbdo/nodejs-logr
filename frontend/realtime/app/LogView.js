// LogView
//
// View for an individual log line
// -------------------------------

window.Log = Backbone.Model.extend({});

window.LogList = Backbone.Collection.extend({
  model: Log
});


window.LogView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, 'render');
    this.model.view = this;
  },

  render: function() {
    this.el = ich.log(this.model.toJSON());
    return this;
  }

});

window.PingPongAppView = Backbone.View.extend({
  initialize: function() {
    this.model.logs.bind('add', this.addLog);

  },

  addLog: function(log) {
    var view = new LogView({model: log});
    $('#logs').append(view.render().el);
  },

  render: function() {
    this.el = ich.app(this.model.toJSON());
    return this;
  }
});

window.PingPongAppModel = Backbone.Model.extend({
  initialize: function() {
    this.logs = new LogList();
  }
});

window.PingPongAppController = Backbone.Controller.extend({
  initialize: function(params) {
    console.log('App ready');

    _.bindAll(this, 'addLog');
    _.bindAll(this, 'start');

    this.model = new PingPongAppModel();
    this.view = new PingPongAppView({model: this.model});
    this.socket = params[1];

    $(params[0]).append(this.view.render().el);
    
    $('a#start').bind("click", this.start);
  },

  addLog: function(log) {
    this.model.logs.add(new Log(log));
  },

  start: function() {
     this.socket.send({func: 'listen', filter: [ { prop: 'type', filter: $('#guid').text()  } ]  });
  }
});

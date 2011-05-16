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
  },

  clear: function() {
    $('#logs').children().remove();
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
    _.bindAll(this, 'filter');

    this.model = new PingPongAppModel();
    this.view = new PingPongAppView({model: this.model});
    this.socket = params[1];
    this.started = false;

    $(params[0]).append(this.view.render().el);
    
    // UI elements and bindings
    this.guidfilter = $('#guid-filter');
    this.filters = $('#filters');
    this.output = $('#output');
    
    $('#start').bind("click", this.start);
    $('#apply-filter').bind("click", this.filter);
  },

  addLog: function(log) {
    this.model.logs.add(new Log(log));
  },

  start: function() {
    this.started = true;
    this.guidfilter.fadeOut();
    this.filters.slideDown();
    this.output.fadeIn();
    
    this.socket.send({func: 'listen', filter: [ { prop: 'guid', filter: $('#guid').val()  } ]  });
  },

  reset: function() {
    this.view.clear();
  },

  filter: function() {
    // clear current view
    this.view.clear();

    // fill with filter
    try {
      var filter = JSON.parse($('#fltr').val());
      this.socket.send( { func: 'listen', filter: [ filter ] } );
    } catch (err) {
      alert('Woops, wrong filter!');
    }
  }
});

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
  },

  remove: function() {
    $(this.el).remove();
  },

  clear: function() {
    this.model.clear();
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
  initialize: function(append_at) {
    console.log('App ready');

    _.bindAll(this, 'addLog');

    this.model = new PingPongAppModel();
    this.view = new PingPongAppView({model: this.model});

    $(append_at).append(this.view.render().el);
  },

  addLog: function(log) {
    this.model.logs.add(new Log(log));
  }
});

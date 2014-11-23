(function(root) {
    require(['config'], function(config) {
        requirejs.config(config);

        require(['ember', 'stardog'], function(Ember, stardog) {
            function performQuery(queryString) {
              return new Ember.RSVP.Promise(function(resolve, reject) {
                var connection = new Stardog.Connection();
                connection.setEndpoint(config.sparql.endpoint);
                connection.setCredentials(
                  config.sparql.user,
                  config.sparql.password
                );
                console.log("trying to connect..", connection);
                connection.query({
                  database: config.sparql.database,
                  query: queryString,
                  limit: 10,
                  offset: 0
                }, function(data) {
                  resolve(data);
                });
              });
            }

            var appName = config.appName || "App";

            App = Ember.Application.create();

            App.Router.map(function() {
              this.route('welcome');
              this.route('about');
              this.route('contact');
              this.route('step1');
              this.route('step2');
              this.route('step3');
            });

            App.IndexRoute = Ember.Route.extend({
              beforeModel: function() {
                this.transitionTo('welcome');
              }
            });

            App.WelcomeRoute = Ember.Route.extend({
              afterModel: function() {
                $(document).attr('title', 'Traveling OWL - Welcome!');
              },
              actions: {
                step1: function(id) {
                  console.log(id);
                  this.transitionTo('step1');
                }
              }
            });

            App.AboutRoute = Ember.Route.extend({
              afterModel: function() {
                $(document).attr('title', 'Traveling OWL - About');
              }
            });

            App.Step1Route = Ember.Route.extend({
              model: function () {
				var queryString = '\
                    select distinct\
                      (strafter(str(?s), "#") AS ?haaas)\
                    where\
                      { ?s ?p ?o }\
                  ';
                return performQuery(queryString).then(function(data) {
                  console.log("Query result ", data);
                  return data.results.bindings;

                });
              },
              actions: {
                step2: function() {
                  this.transitionTo('step2');
                }
              }
            });

            App.Step2Route = Ember.Route.extend({
              model: function () {
				var queryString = '\
                    select distinct\
                      (strafter(str(?s), "#") AS ?haaas)\
                    where\
                      { ?s ?p ?o }\
                  ';
                return performQuery(queryString).then(function(data) {
                  console.log("Query result ", data);
                  return data.results.bindings;

                });
              },
              actions: {
                step1: function() {
                  this.transitionTo('step1');
                },
                step3: function() {
                  this.transitionTo('step3');
                }
              }
            });

            App.Step3Route = Ember.Route.extend({
              model: function () {
				var queryString = '\
                    select distinct\
                      (strafter(str(?s), "#") AS ?haaas)\
                    where\
                      { ?s ?p ?o }\
                  ';
                return performQuery(queryString).then(function(data) {
                  console.log("Query result ", data);
                  return data.results.bindings;

                });
              },
              actions: {
                step2: function() {
                  this.transitionTo('step2');
                }
              }
            });
        });
    });
})(this);

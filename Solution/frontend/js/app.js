(function(root) {
    require(['config'], function(config) {
        requirejs.config(config);
		
        require(['ember', 'stardog','ember-data'], function(Ember, stardog,DS) {
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
			App.ApplicationStore = DS.Store.extend();
			App.ReiseModel = DS.Model.extend({
				routeName: DS.attr('string')
				//propertyList: DS.hasMany('App.PropertyModel')	
			});
			App.PropertyModel = DS.Model.extend({
				propertyName: DS.attr('string')	
			});
			App.routeList = [];
			
            App.Router.map(function() {
              this.route('welcome');
              this.route('about');
              this.route('contact');
              this.route('step1');
              this.route('step2');
              this.route('step3');
			  this.resource('reiseModels');
			  this.resource('reiseModel', { path: ':reisemodel_id' });
            });

            App.IndexRoute = Ember.Route.extend({
              beforeModel: function() {
                this.transitionTo('welcome');
              }
            });
			
			App.ReiseModelsRoute = Ember.Route.extend({
				model: function() {
					//return this.store.find('reiseModel');
					console.log("Hallo..", this.store);
					var reisen = this.store.all('reiseModel');
					console.log("Reisen: ", reisen);
					
					reisen.forEach(function(reise) {
						console.log("Eine Reise..");
					});
				}
			});
			App.ReiseModelRoute = Ember.Route.extend({
				model: function(params) {
					console.log("Hallo from ReiseModel");
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
                      { ?s :reise true }\
                  ';
                return performQuery(queryString).then(function(data) {
                  console.log("step1 Query result ", data);
                  return data.results.bindings;

                });
              },
			  fillModelList : function(){
				console.log(this.store);
				console.log("routeElements: "+ document.querySelectorAll(".routeElements"));
				var routeElements = document.querySelectorAll(".routeElements");
				nodes = Array.prototype.slice.call(routeElements,0);
				nodes.forEach(function(r) {
					if (r.checked) {
						console.log("checked: " + r.name);
						// TODO: das funktioniert hier nicht!
						//this.store.createRecord('reiseModel',{
						//	routeName: r.name
						// });					
					} else{
						console.log("not checked: " + r.name);
					}
				});
				this.store.createRecord('reiseModel',{
					routeName: 'Ausflug'
				});			
				// alle Models in liste füllen
				var temp = this.store.all('reiseModel');
				temp.forEach(function(r) {
					console.log("Temp: ", r);
					App.routeList.push(r);
				});
				
				console.log("Listenelement: " + App.routeList[0].get('routeName'));
			  },			  
              actions: {
                step2: function() {	
				  this.fillModelList();
                  this.transitionTo('step2');
                }
              }
			  
            });
            App.Step2Route = Ember.Route.extend({
				// TODO: sehr fiies, überlegen wie man das query zusammenbaut wenns mehreres häckchen hat
				// zuerst Ausflug, dann Restaurant in einzelnem step?
				// oder untereinander?
              model: function () {
				var queryString = '\
                    select distinct\
                      (strafter(str(?s), "#") AS ?property)\
                    where\
                      { ?s rdfs:domain :' + App.routeList[0].get('routeName') + '  }';
                return performQuery(queryString).then(function(data) {
                  console.log("Query result ", data);
                  return data.results.bindings;

                });
              },
              actions: {
                step1: function() {
				console.log("function: step1")
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
                      { ?s ?p ?x  }\
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

(function(root) {
  require(['config'], function(config) {
    requirejs.config(config);

    require(['ember', 'stardog','ember-data'], function(Ember, stardog,DS) {
      function performQuery(modelName, queryString,type) {
        return new Ember.RSVP.Promise(function(resolve, reject) {
          var connection = new Stardog.Connection();
          connection.setEndpoint(config.sparql.endpoint);
          connection.setCredentials(
              config.sparql.user,
              config.sparql.password
              );
          connection.setReasoning("SL");
          console.log("Performing query: ", queryString.trim());
          connection.query({
            database: config.sparql.database,
            query: queryString,
            limit: 10,
            offset: 0
          }, function(data) {
            if(! data) {
              reject("Fehler");
            } else {
              var result = {
                type: type,
                modelName: modelName,
                data: data
              };
              resolve(result);
            }
          });
        });
      }

      var appName = config.appName || "App";

      App = Ember.Application.create();
      App.ApplicationStore = DS.Store.extend();
      App.ReiseModel = DS.Model.extend({
        routeName: DS.attr('string'),
        dataPropertyList: DS.attr('array')
      });

      //App.DataPropertyModel = DS.Model.extend({
      //	propertyName: DS.attr('string')
      //});

      App.Router.map(function() {
        this.route('welcome');
        this.route('about');
        this.route('contact');
        this.route('step1');
        this.route('step2');
        this.route('step3');
        this.resource('reiseModels');
        this.resource('reiseModel', { path: ' /reiseModel/:routeName' });
        //this.resource('reiseModel', { path: ':reisemodel_id' });
      });

      App.IndexRoute = Ember.Route.extend({
        beforeModel: function() {
          this.transitionTo('welcome');
        }
      });

      App.ReiseModelsRoute = Ember.Route.extend({
        model: function() {
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
          return this.store.find('ReiseModel', {routeName: params});
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
        beforeModel: function() {
          this.store.unloadAll("reiseModel");
        },
        model: function () {
          var queryString = '\
            select distinct\
              (strafter(str(?s), "#") AS ?haaas)\
            where\
              { ?s :reise true }\
          ';
          return performQuery(null, queryString, 'route').then(function(result) {
            console.log("step1 Query result ", result);
            return result.data.results.bindings;
          }).catch(function(data){
            // TODO Fehlerhandling
            console.log("catch: ", data);
          });
        },
        fillModelList : function() {
          console.log(this.store);
          console.log("routeElements: "+ document.querySelectorAll(".routeElements"));

          var routeElements = document.querySelectorAll(".routeElements");
          nodes = Array.prototype.slice.call(routeElements,0);
          nodes.forEach((function(r) {
            if (r.checked) {
              console.log("checked: " + r.name);
              var name = r.name;
              var tempModel = this.store.createRecord('reiseModel',{
                routeName: name

              });
            } else{
              console.log("not checked: " + r.name);
            }
          }).bind(this));

          var temp = this.store.all('reiseModel');
          console.log("das ist unser temp: ", temp);
        },
        actions: {
          step2: function() {
            this.fillModelList();
            this.transitionTo('step2');
          }
        }

      });

      App.Step2Route = Ember.Route.extend({
        model: function () {
          var queries =[];

          this.store.all('reiseModel').get('content').forEach(function(reiseModel) {
            // TODO: diese komischen propertys sauber entfernen und nich so hässlich ausgefiltert
            var queryString = '\
              select distinct\
                (strafter(str(?s), "#") AS ?property)\
              where {\
                ?s rdfs:domain :' + reiseModel.get('routeName') + ' \
                filter(!regex(str(?s), "bottomDataProperty", "i")) \
                filter(!regex(str(?s), "bottomObjectProperty","i")) \
              }';

            queries.push(performQuery(reiseModel.get('routeName'), queryString, 'dataproperty'));

            /*
               if (reiseModel.get('routeName') == 'Ausflug') {
               console.log('if abfrage funktioniert');

               queryString = '\
               select distinct\
               (strafter(str(?j), "#") AS ?property)\
               where\
               { ?j  rdfs:subClassOf :Jahreszeit   }';
               queries.push(performQuery('Jahreszeit abhängig?:', queryString, 'subClassOf'));

               queryString = '\
               select distinct\
               (strafter(str(?r), "#") AS ?property)\
               where\
               { ?r  rdf:type :Region}';
               queries.push(performQuery('Wähle eine Region aus', queryString, 'individuum'));
               };
               if (reiseModel.get('routeName') == 'Restaurant'){
               queryString = '\
               select distinct\
               (strafter(str(?r), "#") AS ?property)\
               where\
               { ?r  rdfs:subClassOf :Restaurant}';
               queries.push(performQuery('Welcher Restaurant', queryString, 'subClassOf'));
               };
            */
          });
          return Ember.RSVP.allSettled(queries).then(function (data) {
            console.log("promise all ", data);
            return data;
          });
        },
        fillModelList: function() {
          this.store.all('reiseModel').get('content').forEach(function(reiseModel) {
            this.propertyList = [];

            var dataproperty = document.querySelectorAll(".dataproperty");
            nodes = Array.prototype.slice.call(dataproperty,0);

            nodes.forEach((function(r) {
              if (r.checked) {
                console.log("checked: " + r.name);
                var name = r.name;
                this.propertyList.push(name);
              } else{
                console.log("not checked: " + r.name);
              }
            }).bind(this));

            reiseModel.set('dataPropertyList', this.propertyList);
          });
        },
        actions: {
          step1: function() {
            console.log("function: step1");
            this.transitionTo('step1');
          },
          step3: function() {
            this.fillModelList();
            this.transitionTo('step3');
          }
        }
      });

      App.Step3Route = Ember.Route.extend({
        beforeModel: function() {
          console.log("step 3 before Model");
        },
        model: function () {
          var queryString = '';

          this.store.all('reiseModel').get('content').forEach(function(route) {
            console.log("step3 for Propschleife");

            queryString = '\
              select distinct \
                (strafter(str(?o), "#") AS ?object) \
                ?url \
                (strafter(str(?or), "#") AS ?ort)';

            queryString += ' where { ';

            route.get("dataPropertyList").forEach(function(property) {
              queryString += '?o :' + property + ' true. '
            });

            queryString += ' ?o :hatStandort ?or. '
            queryString += ' ?o :url ?url. '

            queryString +=  '}';
          });

          console.log("where: ", queryString);

          return performQuery("Ergebnis: ", queryString, 'output').then(function(result) {
            console.log("output Query result ", result);
            return result.data.results.bindings;
          }).catch(function(data){
            // TODO Fehlerhandling
            console.log("catch: ", data);
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

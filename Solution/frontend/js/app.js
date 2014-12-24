(function(root) {
  require(['config'], function(config) {
    requirejs.config(config);

    require(['ember', 'stardog','ember-data'], function(Ember, stardog,DS) {
      function performQuery(modelName, queryString, type) {
        return new Ember.RSVP.Promise(function(resolve, reject) {
          var connection = new Stardog.Connection();

          connection.setEndpoint(config.sparql.endpoint);
          connection.setCredentials(
              config.sparql.user,
              config.sparql.password
              );
          connection.setReasoning("SL");

          console.log("Performing query: ", queryString.replace('\t', '').replace(/\s+/g, ' ').trim());

          connection.query({
            database: config.sparql.database,
            query: queryString,
            offset: 0
          }, function(data, response) {
            if (!data) {
              reject({
                statusText: 'Die Verbindung zur Datenbank konnte nicht hergestellt werden'
              });
            }
            else {
              if (!data.results) {
                reject(response);
              }
              else {
                console.log("Got query results: ", data.results.bindings, typeof(data.results.bindings));
                var result = {
                  type: type,
                  modelName: modelName,
                  data: data.results.bindings
                };
                resolve(result);
              }
            }
          });
        });
      }

      var appName = config.appName || "App";
      var dataPropertyBlackList = blacklist.dataProperty;
      var objectPropertyBlackList = blacklist.objectProperty;

      App = Ember.Application.create();
      App.ApplicationStore = DS.Store.extend();

      App.ErrorView = Ember.View.extend({
        templateName: "error"
      });

      App.ReiseModel = DS.Model.extend({
        routeName: DS.attr('string'),
        isSelected: DS.attr('boolean'),
        dataProperties: DS.hasMany('DataProperty'),
        objectAssociations: DS.hasMany('ObjectAssociation'),
        dataPropertiesUpdater: function() {
          console.log('dataPropertiesUpdater got triggered..');
          var self = this;
          var filter = "";

          dataPropertyBlackList.forEach(function(item){
              filter += ' filter(!regex(str(?s), "' + item + '", "i")) ';
          });

          var queryString = '\
            select distinct\
              (strafter(str(?s), "#") AS ?property)\
            where {\
              ?s rdfs:domain :' + this.get('routeName') + '. \
              ?s a owl:DatatypeProperty . \
              ' + filter + ' \
            }';
          performQuery(this.get('routeName'), queryString, 'dataproperty').then(function (dataPropertySets) {
            dataPropertySets.data.forEach(function(prop) {
              var id = prop.property.value;
              var dataProperty = self.store.getById('DataProperty', id);

              if (!dataProperty) {
                dataProperty = self.store.createRecord('DataProperty',{
                  id: prop.property.value,
                  propertyName: prop.property.value,
                });
                self.get('dataProperties').pushObject(dataProperty);
              }
            });
          });
        }.observes('routeName'),
        objectAssociationsUpdate: function() {
          console.log('objectsAssociationsUpdater got triggered.. ', this);
          var self = this;
          var filter = "";

          objectPropertyBlackList.forEach(function(item){
              filter += ' filter(!regex(str(?rel), "' + item + '", "i")) ';
          });

          var queryString = '\
            select distinct \
              (strafter(str(?rel), "#") AS ?property) \
            where { \
              ?ind ?rel ?ziel. \
              ?ind a :' + this.get('routeName') + '. \
              ?rel a owl:ObjectProperty. \
              ' + filter + ' \
            }';
          performQuery(this.get('routeName'), queryString, 'objectproperty').then(function(objectAssociationsSets) {

            objectAssociationsSets.data.forEach(function(association) {
              var propertyName = association.property.value;

              var queryString = ' \
                SELECT DISTINCT \
                  (strafter(str(?target), "#") AS ?property) \
                WHERE { \
                  ?ind :' + propertyName + ' ?target. \
                }';
              performQuery(propertyName, queryString, 'objectproperty').then(function(objectPropertySet) {
                var objectAssociation = self.store.createRecord('ObjectAssociation', {
                  propertyName: objectPropertySet.modelName
                });

                console.log("got props for ObjectAssociation: ", objectPropertySet);

                objectPropertySet.data.forEach(function(prop) {
                  var objectProperty = self.store.createRecord('ObjectProperty', {
                    propertyName: prop.property.value
                  });
                  objectAssociation.get('objectProperties').pushObject(objectProperty);
                });

                self.get('objectAssociations').pushObject(objectAssociation);
              });

            });
          });
        }.observes('routeName')
      });

      App.DataPropertyModel = DS.Model.extend({
        propertyName: DS.attr('string'),
        isSelected: DS.attr('boolean')
      });

      App.ObjectAssociationModel = DS.Model.extend({
        propertyName: DS.attr('string'),
        isSelected: DS.attr('boolean'),
        objectProperties: DS.hasMany('ObjectProperty')
      });

      App.ObjectPropertyModel = DS.Model.extend({
        propertyName: DS.attr('string'),
        isSelected: DS.attr('boolean')
      });

      App.Router.map(function() {
        this.route('welcome');
        this.route('about');
        this.route('contact');
        this.route('step1');
        this.route('step2');
        this.route('step3');
        this.resource('reiseModels');
        this.resource('reiseModel', { path: ' /reiseModel/:routeName' });
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
          step1: function() {
            this.transitionTo('step1');
          }
        }
      });

      App.AboutRoute = Ember.Route.extend({
        afterModel: function() {
          $(document).attr('title', 'Traveling OWL - About');
        }
      });

      App.ReiseModelController = Ember.ObjectController.extend({
      });

      App.ReiseModelRoute = Ember.Route.extend({
        model: function() {
          console.log("Setting up modelu");
        },
        setupController: function(controller, model) {
          console.log("Setting up controllu");
        }
      });

      App.Step1Route = Ember.Route.extend({
        model: function () {
          var self = this;

          var queryString = '\
            select distinct\
              (strafter(str(?s), "#") AS ?travel)\
            where\
              { ?s :reise true }\
          ';
          return performQuery(null, queryString, 'travel').then(function(r) {
            console.log("r ", r)
            r.data.forEach(function(travelItem) {
              var id = travelItem.travel.value;
              var tempModel = self.store.filter('reiseModel', function(travel) {
                  return travel.get('routeName') === id;
              }).then(function(travel) {
                  if (travel.content.length === 0) {
                    console.log('Step1: Model: Creating model.. ', id);
                    self.store.createRecord('reiseModel', {
                      routeName: id
                    });
                  }
              });;
            });

            return self.store.filter('reiseModel').then(function(models) {
              return models;
            });
          }).catch(function(data) {
            console.log("error data: ", data);
            var errorData = {
              errors: [
                {message: data.statusText}
              ]
            };
            return Ember.RSVP.reject(errorData);
          });
        },
        actions: {
          step2: function() {
            this.transitionTo('step2');
          },
          error: function(error, transition) {
            return true;
          },
        }
      });

      App.Step2Route = Ember.Route.extend({
        model: function () {
          return this.store.filter('reiseModel', function(travel) {
            console.log("Step2: Record: ", travel._attributes);
            return travel.get('isSelected') === true;
          });
        },
        actions: {
          step1: function() {
            console.log("function: step1");
            this.transitionTo('step1');
          },
          step3: function() {
            this.transitionTo('step3');
          }
        }
      });

      App.Step3Route = Ember.Route.extend({
        model: function () {
          var self = this;

          return this.store.filter('reiseModel', function(travel) {
            console.log("Step3: Record: ", travel._attributes);
            return travel.get('isSelected') === true;
          }).then(function(travels) {
            var travelQueries = [];

            travels.forEach(function(travel) {
              var queryString = ' \
                SELECT \
                  (strafter(str(?obj), "#") AS ?travel) \
                  (strafter(str(?loc), "#") AS ?location) \
                  ?url \
                WHERE { \
                  ?obj a :' + travel.get('routeName') + '. \
                  ?obj :url ?url. \
                  ?obj :hatStandort ?loc. ';

              travel.get('dataProperties').forEach(function(dataProperty) {
                if (dataProperty.get('isSelected')) {
                  queryString += ' \
                    ?obj :' + dataProperty.get('propertyName') + ' true. \
                  ';
                }
              });

              travel.get('objectAssociations').forEach(function(objectAssoc) {
                console.log(objectAssoc);
                var objectProperties = objectAssoc.get('objectProperties');

                objectProperties.forEach(function(objectProp) {
                  if (objectProp.get('isSelected')) {
                    queryString += ' \
                      { ?obj :' + objectAssoc.get('propertyName') + ' :' + objectProp.get('propertyName') + '.} \
                    UNION \
                    ';
                  }
                });

                if (objectProperties.content.length > 0) {
                  console.log('Sersios trimming here..');
                  queryString = queryString.replace(/UNION\s*$/, '');
                }
              });

              queryString += '}';
              console.log("Step3 query: ", queryString.replace('\t', '').replace(/\s+/g, ' ').trim());
              travelQueries.push(performQuery('travels', queryString, travel.get('routeName')));
            });
            return Ember.RSVP.all(travelQueries).then(function(foundTravels) {
              console.log("Got res: ", foundTravels);
              return foundTravels;
            }).catch(function(data) {
              console.log("error data: ", data);
              var errorData = {
                errors: [
                  {message: data.statusText}
                ]
              };
              return Ember.RSVP.reject(errorData);
            });
          });
        },
        actions: {
          step2: function() {
            this.transitionTo('step2');
          },
          error: function(error, transition) {
            return true;
          },
        }
      });
    });
  });
})(this);

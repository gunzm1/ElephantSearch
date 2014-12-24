define({
  appName:        'traveling-owl',
  sparql: {
      'endpoint': 'http://elephantsearch.bfh.ch:5820/',
      'database': 'reiseplaner',
      'user':     'admin',
      'password': 'admin'
  },
  baseUrl: 'js/',
  paths: {
    /* libs */
    'bootstrap':        'lib/bootstrap/dist/js/bootstrap',
    'domReady':         'lib/domReady/domready',
    'ember':            'lib/ember/ember',
    'ember-data':       'lib/ember-data/ember-data',
    'handlebars':       'lib/handlebars/handlebars',
    'jquery':           'lib/jquery/dist/jquery',
    'lodash':           'lib/lodash/dist/lodash',
    'stardog':          'lib/stardog/js/stardog',
    'text':             'lib/text/text'
  },
  shim: {
    "ember": {
      deps: ["handlebars", "jquery"],
      exports: "Ember"
    },
    "ember-data":{
      deps:["ember"],
      exports: "DS"
    },
    "handlebars": {
      exports: "Handlebars"
    },
    "stardog": {
      deps: ["lodash"]
    }
  }
});

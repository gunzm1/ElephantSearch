//the require library is configuring paths
requirejs.config({
  paths: {
    'jquery': 'lib/jquery/dist/jquery',
    'bootstrap': "lib/bootstrap/dist/js/bootstrap",
    'underscore': "lib/underscore/underscore-min",
    'backbone': "lib/backbone/backbone",
  },
  shim: {
    "backbone": {
      //loads dependencies first
      deps: ["jquery", "underscore"],
      //custom export name, this would be lowercase otherwise
      exports: "Backbone"
    }
  },
  //how long the it tries to load a script before giving up, the default is 7
  waitSeconds: 10
});

//requiring the scripts in the first argument and then passing the library namespaces into a callback
//you should be able to console log all of the callback arguments
require(['jquery', 'underscore', 'backbone', 'app/main'], function(jquery, _, Backbone, App){
    new App;
});

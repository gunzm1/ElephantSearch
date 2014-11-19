App = Ember.Application.create({});
var posts = [{
  id: '1',
  title: "Rails is Omakase",
  author: { name: "d2h" },
  date: new Date('12-27-2012'),
  excerpt: "There are lots of à la carte software environments in this world. Places where in order to eat, you must first carefully look over the menu of options to order exactly what you want.",
  body: "I want this for my ORM, I want that for my template language, and let's finish it off with this routing library. Of course, you're going to have to know what you want, and you'll rarely have your horizon expanded if you always order the same thing, but there it is. It's a very popular way of consuming software.\n\nRails is not that. Rails is omakase."
}, {
  id: '2',
  title: "The Parley Letter",
  author: { name: "d2h" },
  date: new Date('12-24-2012'),
  excerpt: "My [appearance on the Ruby Rogues podcast](http://rubyrogues.com/056-rr-david-heinemeier-hansson/) recently came up for discussion again on the private Parley mailing list.",
  body: "A long list of topics were raised and I took a time to ramble at large about all of them at once. Apologies for not taking the time to be more succinct, but at least each topic has a header so you can skip stuff you don't care about.\n\n### Maintainability\n\nIt's simply not true to say that I don't care about maintainability. I still work on the oldest Rails app in the world."  
}];

App.Router.map(function() {
  this.resource('step2');
  this.resource('step1', function() {
  });
});

App.Step1Controller = Ember.ArrayController.extend({
    actions : {
        goToStep2 : function() {
            console.log('step1 trallalaaa');
			this.transitionToRoute('step2'); 
			this.createConnection()
        },		
    },
	
	createConnection: function(){
	   this.conn = new Stardog.Connection();
	   this.conn.setEndpoint("http://elephantsearch.bfh.ch:5820/");
	   this.conn.setCredentials("admin", "admin");	
		console.log('createConnection function aus action aufgerufen');
		//this.query();
	}//,
	// query: function() {
		// this.conn.query({
			// database: "reiseplaner",
			// query: '\
				// select distinct\
					// (strafter(str(?s), "#") AS ?haaas)\
				// where\
					// { ?s ?p ?o }\
			// ',
			// limit: 10,
			// offset: 0
		// },this.setResult.bind(this));
	// },
	// setResult: function(data){
		// step1Result = data.results.bindings;
	// }
});
	
App.Step2Controller = Ember.ArrayController.extend({
    actions : {
        logtest : function() {
            console.log('tralalaaaa');
        }	
    }
	
});
App.Step2Route = Ember.Route.extend({
  model: function() {
  return posts;
    //return step1Result;
  }
});

var showdown = new Showdown.converter();

Ember.Handlebars.helper('format-markdown', function(input) {
  return new Handlebars.SafeString(showdown.makeHtml(input));
});

Ember.Handlebars.helper('format-date', function(date) {
  return moment(date).fromNow();
});
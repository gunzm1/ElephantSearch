define(
	["backbone", "stardog","underscore","text!app/templates/main.html", "text!app/templates/elements.html"],
	function(Backbone, Stardog,_, MainView, ElementsView) {
	var App = Backbone.View.extend({
		el: $('#main'),
		events: {
			'click #buttonid': 'query'
		},

		initialize: function(){			
			console.log("it's working!");
			
			this.conn = new Stardog.Connection();
			this.conn.setEndpoint("http://elephantsearch.bfh.ch:5820/");
			this.conn.setCredentials("admin", "admin");

			this.render();
		},
		render: function(){

			var temp = _.template(MainView);
			this.$el.html(temp);

		},
		query: function() {
			this.conn.query(
				{ 
					database: "reiseplaner", 
					query: '\
						select distinct\
							(strafter(str(?s), "#") AS ?haaas)\
						where\
							{ ?s ?p ?o }\
					',  
					limit: 10, 
					offset: 0 
				},
				this.processQuery.bind(this)
			);   		
		},
		processQuery: function(data) {
			console.log(data.results.bindings);
			var temp = _.template(ElementsView);
			console.log(this.el);
			$(this.$el).find("#result").html(temp({data: data.results.bindings}));				
		}
	});
	return App;
});

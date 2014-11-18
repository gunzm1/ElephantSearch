define(
	["underscore",
	 "text!app/templates/test.html"],
	// function initialize -> baut Connection zu Elephantsearch auf, ruft render

	function(_,TestView){
	
		console.log("ich bin ein test modul");
		
		var temp = _.template(TestView);
		console.log(TestView);
		//console.log(this.$el);
		//$(this.$el).html(this.temp);	
		
		
		return temp;
	});


// ich habs zwar geschaft ein modul ins main einzubinden. Das ganze ist aber immer noch relativ beschränkt
// so kann ich 1. keine Methoden in diesem .js File aufrufne (das ist wahrscheinlich irgend so ein doofer simpler fehler)
// 2. weiss ich nicht wie ich die TestView dann hinzufügen kann. Ich kann ja nicht mehr auf $el zugreifen
// dann müsst ich das ja irgendwie mitgeben
// oder ich geb das Template zurück und weiss es dann zu? das geht aber nicht
// aber ich muss jezt mal aufhören und noch englisch machen

//http://backbonetutorials.com/organizing-backbone-using-modules/

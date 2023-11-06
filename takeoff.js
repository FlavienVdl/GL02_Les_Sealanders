var colors = require("colors");
var unsafeRequire = require("./utils/unsafeRequire");

// Pour rendre node un peu plus souple pour l'exercice (ne jamais utiliser ailleurs)
var unsafeRequire = function(m, stub){
	var module;
	try{
		module = require(m);
	}catch(e){
		if(e.code === 'MODULE_NOT_FOUND'){
			//throw e;
			module = stub;
		}
	}
	
	return module;
}

var stub = {
	check:function(){
		return false;
	}
};

var engine = unsafeRequire("./engine", stub);
var command = unsafeRequire("./command", stub);
var radio = unsafeRequire("./radio", stub);
var satellite1 = unsafeRequire("./satellite1", stub);
var satellite2 = unsafeRequire("./satellite2", stub);



var rocket = {
	engine: engine, 
	command: command, 
	radio: radio, 
	satellite1: satellite1,
	satellite2: satellite2
};

var checklist = {
	engine: 0, 
	command: 0, 
	radio: 0, 
	satellite1: 0,
	satellite2: 0
};

var takeOff = function(){
	var counter = 5;
	for(var part in rocket){
		console.log(counter + "..");
		checklist[part] = rocket[part].check();
		
		// S'il manque le moteur ou les commandes Crash
		if(!checklist[part] && (part === "engine" || part === "command")){
			var crashMsg = "Crash ! "+part+" is missing !!";
			console.log(crashMsg.red);
			break;
		// S'il manque un composant optionnel
		}else if(!checklist[part]){
			var alertMsg = "Woops ! "+ part+ " is missing. Do we really need it?";
			console.log(alertMsg.yellow);
		}
		counter--;
	}
	
	// Décollage
	if(counter === 0){
		console.log("0.. Fire \nTaaaaakkke Oooooofffff".green);
	}
}

takeOff();
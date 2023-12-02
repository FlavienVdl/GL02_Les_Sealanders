const fs = require('fs');
const { Comment, Category, Question, Quiz, ReponseVraiFaux, ReponseMatchingPairs, ReponseNumerique, ReponseAutre } = require('./Quiz.js');
// GiftParser

var GiftParser = function(sTokenize, sParsedSymb) {
    this.parsedGIFT = [];
    this.symb = ["//", "$CATEGORY:", "::", "#", "=", "->", "~"];
    this.showTokenize = sTokenize;
    this.showParsedSymbols = sParsedSymb;
    this.errorCount = 0;
    this.currentQuiz = null;  // Ajout de la propriété currentQuiz
    this.currentCategory = null;  // Ajout de la propriété currentCategory
};

// Parser procedure

// tokenize : tranform the data input into a list
// <eol> = CRLF
GiftParser.prototype.tokenize = function(data) {
    var separator = /(\$CATEGORY:|\/\/|::[^:]+::)(.*?)(?=\$CATEGORY:|\/\/|::[^:]+::|$)/gs;
    data = data.match(separator);
    // data = data.filter((val, idx) => !val.match(separator));
    data = data.filter((val) => val.trim() !== "");
    console.log(data);
    return data;
};

// GiftParser.prototype.tokenize

// parse : analyze data by calling the first non terminal rule of the grammar
GiftParser.prototype.parse = function(data){
	var tData = this.tokenize(data);
	if(this.showTokenize){
		console.log(tData);
	}
	this.grammaireGift(tData);
}

// Parser operand

GiftParser.prototype.errMsg = function(msg, input){
	this.errorCount++;
	console.log("Parsing Error ! on "+input+" -- msg : "+msg);
}

// Read and return a symbol from input
GiftParser.prototype.next = function(input){
	var curS = input.shift();
	if(this.showParsedSymbols){
		console.log(curS);
	}
	return curS
}

// accept : verify if the arg s is part of the language symbols.
GiftParser.prototype.accept = function(s){
	var idx = this.symb.indexOf(s);
	// index 0 exists
	if(idx === -1){
		this.errMsg("symbol "+s+" unknown", [" "]);
		return false;
	}

	return idx;
}



// check : check whether the arg elt is on the head of the list
GiftParser.prototype.check = function(s, input){
    if (input.length > 0 && this.accept(input[0]) == this.accept(s)) {
        return true;
    }
    return false;
}


// expect : expect the next symbol to be s.
GiftParser.prototype.expect = function(s, input){
	if(s == this.next(input)){
		console.log("Reckognized! "+s)
		return true;
	}else{
		this.errMsg("symbol "+s+" doesn't match", input);
	}
	return false;
}

// checkComment : Check if the input is a comment
GiftParser.prototype.checkComment = function(input){
    console.log(input[0])
	return (input.length > 0 && input[0].startsWith("//"));
}

// checkCategory : Check if the input is a category
GiftParser.prototype.checkCategory = function(input){
    return (input.length > 0 && input[0].startsWith("$CATEGORY:"));
}

// checkQuestion : Check if the input is a question
GiftParser.prototype.checkQuestion = function(input){
    return (input.length > 0 && input[0].startsWith("::"));
}


// Parser rules

// <grammaire-gift> = *(<element>)
GiftParser.prototype.grammaireGift = function(input){
	this.currentQuiz = new Quiz();
	while (input.length > 0) {
        this.currentQuiz.elements.push(this.element(input));
        console.log(this.currentQuiz.elements);
    }
}

// *(WSP)(commentaire/categorie/question) *(WSP)/CRLF
GiftParser.prototype.element = function(input){
    var element;
    if (this.checkComment(input)) {
        console.log("c'est un commentaire")
        element = this.commentaire(input);
    } else if (this.checkCategory(input)) {
        console.log("c'est une categorie")  
        element = this.categorie(input);
    } else if (this.checkQuestion(input)) {
        console.log("c'est une question")
        element = this.question(input);
    } else {
        this.errMsg("Invalid element", input);
    }
    return element;
}

// "//" 1*(VCHAR/WSP) CRLF
GiftParser.prototype.commentaire = function(input){
    input[0] = input[0].substring(2);
    var text = this.next(input); // obtenir le texte du commentaire
    return new Comment(text);
}

// "$CATEGORY:" (VCHAR/WSP) CRLF
GiftParser.prototype.categorie = function(input) {
    input[0] = input[0].substring("$CATEGORY:".length);
    var categoryName = this.next(input);

    return new Category(categoryName);

};

// [titre] [text-formating] texte [reponse] texte
GiftParser.prototype.question = function(input){
    parsedQuestion = input[0].match(/::(.*?)::(?:\[(.*?)\])?(.*)/)
    var titre = this.titre(parsedQuestion[1]);
    var textFormatting = this.textFormating(parsedQuestion[2]);
    var question = new Question(titre, textFormatting);
    var texte = this.reponse(parsedQuestion[3]);
    question.textesReponses.push(texte);
    this.next(input);
    return question;
}


// "::" texte "::"
GiftParser.prototype.titre = function(input) {
    var text = this.texte(input);
    return text;
};

// "[" (%s"moodle" / %s"html" / %s"markdown" / %s"plain") "]"
GiftParser.prototype.textFormating = function(input){
    if (input != null) {
        var format = input;
    }else{
        var format = "plain";
    }
    return format;
}

// "{" type-reponse "}"
GiftParser.prototype.reponse = function(input){
    texteReponses = input.match(/(?:\{([^{}]+)\}|([^{}]+))/g);
    for (var i = 0; i < texteReponses.length; i++) {
        if (texteReponses[i].startsWith("{")) {
            this.typeReponse(texteReponses[i].substring(1, texteReponses[i].length - 1));
        } else {
            var texte = this.texte(texteReponses[i]);
        }
    }
}

// vrai-faux/matching/numerique/autre
GiftParser.prototype.typeReponse = function(input){
    if (this.isTrueFalse(input)) {
        console.log("c'est un vrai faux")
        this.vraiFaux(input);
    } else if (this.isMatching(input)) {
        console.log("c'est un matching")
        this.matchingPairs(input);
    } else if (this.isNumerique(input)) {
        console.log("c'est un numerique")
        this.numerique(input);
    } else if (this.isAutre(input)) {
        console.log("c'est un autre")
        this.autre(input);
    } else {
        this.errMsg("Invalid typeReponse", input);
    }
}

GiftParser.prototype.isTrueFalse = function(input){
    return (input.startsWith("T") || input.startsWith("F") || input.startsWith("TRUE") || input.startsWith("FALSE")) ;
}

GiftParser.prototype.isMatching = function(input){
    return /(\d+)\*\('=(.*?)'->'(.*?)'\)/.test(input);
}

GiftParser.prototype.isNumerique = function(input){
    return input.startsWith("#");
}

GiftParser.prototype.isAutre = function(input){
    return input.startsWith("~ ") || input.startsWith("=");
}

// ("T"/"F"/"TRUE"/"FALSE") [feedback] [feedback]
GiftParser.prototype.vraiFaux = function(input){
    var elems = input.match(/\(("T"|"F"|"TRUE"|"FALSE")\)\s+(#[^\s]+)/g);
    var reponse = new ReponseVraiFaux(elems[0]);
    for (var i = 1; i < elems.length; i++) {
        reponse.feedbacks.push(this.feedback(elems[i]));
    }
    return reponse;
}

// 3*("=" texte "->" texte)
GiftParser.prototype.matchingPairs = function(input){
	for (var i = 0; i < 3; i++) {
        var texte1 = this.texte(input);
        this.expect("->", input);
        var texte2 = this.texte(input);
        // Process texte1 and texte2 as needed
    }
}

// 1*("~"/"=")[poids] texte [feedback]
GiftParser.prototype.autre = function(input){
    console.log(input);
    var elems = input.match(/^((~|=))(?:%([^%]+))?%([^#]+)?(?:#([^]+))?$/);
    console.log("rrrrrrrrrrr",elems);
    var poids = this.poids(elems[1]);
    var texte = this.texte(elems[2]);
    var feedback = this.feedback(input);
    return new ReponseAutre(texte, poids, feedback);
}

// "#" (reponse-numerique / 2*("="[poids] reponse-numerique [feedback]))
GiftParser.prototype.numerique = function(input){
	this.expect("#", input);
    if (this.check("reponse-numerique", input)) {
        this.reponseNumerique(input);
    } else {
        for (var i = 0; i < 2; i++) {
            this.expect("=", input);
            this.poids(input);
            this.reponseNumerique(input);
            this.feedback(input);
        }
    }
}

// nombre[":"nombre/".."nombre]
GiftParser.prototype.reponseNumerique = function(input){
	var nombre1 = this.nombre(input);
    if (this.check(":", input)) {
        this.expect(":", input);
        var nombre2 = this.nombre(input);
    } else if (this.check("..", input)) {
        this.expect("..", input);
        var nombre2 = this.nombre(input);
    }
	
}

// "#"texte
GiftParser.prototype.feedback = function(input){
	this.expect("#", input);
    var texte = this.texte(input);
}

// "%" nombre "%"
GiftParser.prototype.poids = function(input){
    if (input.match(/%(\d+)%/)) {
        return input.match(/%(\d+)%/)[1];
    } else {
        this.errMsg("Invalid poids", input);
    }
}

GiftParser.prototype.nombre = function(input){
    var digit = this.digit(input);
    while (this.check("digit", input)) {
        digit += this.digit(input);
    }
    return digit;
}

GiftParser.prototype.digit = function(input){
    if (input.length > 0) {
        return this.next(input);
    } else {
        this.errMsg("Unexpected end of input", input);
        return null; // ou une valeur par défaut appropriée
    }
}

// 1*(WSP/VCHAR)
GiftParser.prototype.texte = function(input){
    console.log("*****"+input)
    if (matched = input.match(/.+/i)) {
        return matched[0];
    } else {
        this.errMsg("Invalid texte", input);
    }
}


// POI DU TD POUR AIDER

// <poi> = "START_POI" <eol> <body> "END_POI"
GiftParser.prototype.poi = function(input){

	if(this.check("START_POI", input)){
		this.expect("START_POI", input);
		var args = this.body(input);
		var p = new POI(args.nm, args.lt, args.lg, []);
		this.note(input, p);
		this.expect("END_POI",input);
		this.parsedPOI.push(p);
		if(input.length > 0){
			this.poi(input);
		}
		return true;
	}else{
		return false;
	}

}

// <body> = <name> <eol> <latlng> <eol> <optional>
GiftParser.prototype.body = function(input){
	var nm = this.name(input);
	var ltlg = this.latlng(input);
	return { nm: nm, lt: ltlg.lat, lg: ltlg.lng };
}

// <name> = "name: " 1*WCHAR
GiftParser.prototype.name = function(input){
	this.expect("name",input)
	var curS = this.next(input);
	if(matched = curS.match(/[\wàéèêîù'\s]+/i)){
		return matched[0];
	}else{
		this.errMsg("Invalid name", input);
	}
}

// <latlng> = "latlng: " ?"-" 1*3DIGIT "." 1*DIGIT", " ?"-" 1*3DIGIT "." 1*DIGIT
GiftParser.prototype.latlng = function(input){
	this.expect("latlng",input)
	var curS = this.next(input);
	if(matched = curS.match(/(-?\d+(\.\d+)?);(-?\d+(\.\d+)?)/)){
		return { lat: matched[1], lng: matched[3] };
	}else{
		this.errMsg("Invalid latlng", input);
	}
}

// <optional> = *(<note>)
// <note> = "note: " "0"/"1"/"2"/"3"/"4"/"5"
GiftParser.prototype.note = function (input, curPoi){
	if(this.check("note", input)){
		this.expect("note", input);
		var curS = this.next(input);
		if(matched = curS.match(/-?\d+/)){
			var rating = parseInt(matched[0]);
            if (rating >= 0 && rating <= 5) {
				curPoi.addRating(rating);
				if(input.length > 0){
					this.note(input, curPoi);
				}
			}
		}else{
			this.errMsg("Invalid note");
		}
	}
}

module.exports = GiftParser;
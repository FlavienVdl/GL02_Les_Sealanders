const fs = require('fs');
const { Comment, Category, Question, Quiz, ReponseVraiFaux, ReponseMatchingPairs, ReponseNumerique, ReponseAutre, ReponseSimple, ReponseMultiple } = require('./Quiz.js');
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
    var separator = /(\$CATEGORY:|\/\/|::(?:[^:]+|[\s\S]+?)::)(.*?)(?=\$CATEGORY:|\/\/|::(?:[^:]+|[\s\S]+?)::|$)/gs;
    data = data.match(separator);
    // data = data.filter((val, idx) => !val.match(separator));
    data = data.filter((val) => val.trim() !== "");

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
    }
}

// *(WSP)(commentaire/categorie/question) *(WSP)/CRLF
GiftParser.prototype.element = function(input){
    var element;
    if (this.checkComment(input)) {
        element = this.commentaire(input);
    } else if (this.checkCategory(input)) {
        element = this.categorie(input);
    } else if (this.checkQuestion(input)) {
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
    parsedQuestion = input[0].match(/::(.*?)::(?:\[(.*?)\])?(.*)/s)
    var titre = this.titre(parsedQuestion[1]);
    var textFormatting = this.textFormating(parsedQuestion[2]);
    var question = new Question(titre, textFormatting);
    this.reponse(parsedQuestion[3], question);
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
GiftParser.prototype.reponse = function(input,question) {
    elems = input.split(/(\{[^{}]+\})/s)
    for (var i = 0; i < elems.length; i++) {
        if (this.isReponse(elems[i])) {
            this.typeReponse(elems[i].replace(/[\{\}]/g, ''), question);
        } else if (elems[i].trim() != ""){
            question.textesReponses.push(this.texte(elems[i])); 
        }
    }
}

GiftParser.prototype.isReponse = function(input){
    return input.startsWith("{");
}


// vrai-faux/matching/numerique/autre
GiftParser.prototype.typeReponse = function(input, question){
    if (this.isTrueFalse(input)) {
        this.vraiFaux(input, question);
    } else if (this.isMatching(input)) {
        this.matchingPairs(input,question);
    } else if (this.isNumerique(input)) {
        this.numerique(input,question);
    } else if (this.isAutre(input)) {
        this.autre(input,question);
    } else if (this.isSA(input)){
        this.simpleAnswer(input,question);
    } else if (this.isMC(input)){
        this.multipleChoice(input,question);
    } else {
        this.errMsg("Invalid typeReponse", input);
    }
}

GiftParser.prototype.isTrueFalse = function(input){
    return (input.trim().startsWith("T") || input.trim().startsWith("F") || input.trim().startsWith("TRUE") || input.trim().startsWith("FALSE")) ;
}

GiftParser.prototype.isMatching = function(input){
    return /->/.test(input.trim());
}

GiftParser.prototype.isNumerique = function(input){
    return input.trim().startsWith("#");
}

GiftParser.prototype.isAutre = function(input){
    input = input.replace(/[\r\n]+/g, "").trim();
    return input.startsWith("~") || input.startsWith("=");
}

GiftParser.prototype.isSA = function(input){
    return input.trim().startsWith("1:SA:");
}

GiftParser.prototype.isMC = function(input){
    return input.trim().startsWith("1:MC:");
}

// ("T"/"F"/"TRUE"/"FALSE") [feedback] [feedback]
GiftParser.prototype.vraiFaux = function(input, question) {
    console.log(input);
    var elems = input.match(/^(FALSE|TRUE|T|F)(#(?:.+))?$/);
    console.log(elems);
    if (elems) {
        var reponse = new ReponseVraiFaux(elems[1]);
        if (elems[2]) {
            reponse.feedbacks.push(this.feedback(elems[2]));
        }
        question.textesReponses.push(reponse);
    } else {
        console.log("La chaîne d'entrée ne correspond pas au format attendu.");
    }
}

// 3*("=" texte "->" texte)
GiftParser.prototype.matchingPairs = function(input,question) {
    var pairs = input.split(/=/);
    var reponse = new ReponseMatchingPairs();
    for (var i = 0; i < pairs.length; i++) {
        if (/(.+?)\s*->\s*(.+)/.test(pairs[i])) {
            pair = pairs[i].match(/(.+?)\s*->\s*(.+)/);
            reponse.pairs[pair[1]] = pair[2];
        }
    }
    question.textesReponses.push(reponse);
}

// 1*("~"/"=")[poids] texte [feedback]
GiftParser.prototype.autre = function(input,question) {
    var elems = input.match(/[^~=]+|~|=+/g);
    let i = 0;
    while (i+1 < elems.length) {
        if (elems[i] == "~" || elems[i] == "=") {
            question.textesReponses.push(new ReponseAutre(elems[i+1], 1, null));
            i++;
        } else {
            i++;
            continue;
        }  
    }
}

// "#" (reponse-numerique / 2*("="[poids] reponse-numerique [feedback]))
GiftParser.prototype.numerique = function(input,question) {
    // retirer le # en début de chaîne (en utilisant substring)
    input = input.substring(1);
    // Séparer la chaîne en fonction des "="
    var elems = input.split(/=/);
    console.log(elems);
    for (var i = 0; i < elems.length; i++) {
        if (elems[i].trim() != "") {
            console.log(elems[i]);
            this.reponseNumerique(elems[i],question);
        }
    }
}

// nombre[":"nombre/".."nombre]
GiftParser.prototype.reponseNumerique = function(input,question){
	//Séparer la chaîne en fonction des ":" ou ".."
    var elems = input.split(/:|\.\./);
    console.log(elems);
    if (elems && elems[0].trim() != ""){
        question.textesReponses.push(new ReponseNumerique(elems[0].trim(), elems[1].trim()));
    }
}

// "{1:SA:" 1*(WSP/VCHAR) "}"
GiftParser.prototype.simpleAnswer = function(input,question) {
    // on retire les accolades et le 1:SA: au début de la chaîne
    input = input.substring(6);
    input = input.substring(0, input.length - 1);
    // séparer la chaine en fonction des =
    var elems = input.split(/=/);
    // si le premier caractère du premier élément est un ~, alors c'est une bonne réponse
    let nextAnswerTrue = elems[0].trim().startsWith("~") || elems.length == 1;
    let reponse = new ReponseSimple();
    for (var i = 0; i < elems.length; i++) {
        if (elems[i].trim() != "") {
            reponse.addReponse(elems[i].trim(), nextAnswerTrue);
        }
        nextAnswerTrue = false;
        if (i+1 < elems.length) {
            nextAnswerTrue = elems[i].trim().endsWith("~");
        }
    }
}

// "{1:MC:" 1*(WSP/VCHAR) "}"
GiftParser.prototype.multipleChoice = function(input,question) {
    // on retire les accolades et le 1:MC: au début de la chaîne
    input = input.substring(6);
    input = input.substring(0, input.length - 1);
    // séparer la chaine en fonction des =
    var elems = input.split(/~/);
    // si le premier caractère du premier élément est un ~, alors c'est une bonne réponse
    let reponse = new ReponseMultiple();
    for (var i = 0; i < elems.length; i++) {
        nextAnswerTrue = elems[i].trim().startsWith("=");
        if (elems[i].trim() != "") {
            reponse.addReponse(elems[i].trim(), nextAnswerTrue);
        }
    }
}

// "#"texte
GiftParser.prototype.feedback = function(input){
    return this.texte(input);
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
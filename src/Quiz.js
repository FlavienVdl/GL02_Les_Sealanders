var Comment = function(text) {
    this.type = 'comment';
    this.text = text;
};

var Category = function(name) {
    this.type = 'category';
    this.name = name;
    this.elements = [];
};

Category.prototype.addElement = function(element) {
    this.elements.push(element);
};

var Question = function(titre, textFormatting){
    this.type = 'question';
    this.titre = titre;
    this.textFormatting = textFormatting;
    //Liste de textes (énoncés) et de réponses, pour garder l'ordre
    this.textesReponses = []; 
}

Question.prototype.toGift = function(){
    let gift = '::' + this.titre + '::[' + this.textFormatting+']\n';
    this.textesReponses.forEach(function(texteReponse){
        //Si c'est un string, on l'ajoute
        if(typeof texteReponse === 'string'){
            gift += texteReponse;
        } else {
            gift+= "{"+texteReponse.toGift()+"}";
        }
    });
    return gift;
}

var ReponseVraiFaux = function(texte){
    this.texte = texte;
    this.feedbacks = [];
}

ReponseVraiFaux.toGift = function(){
    let giftRep = texte;
    this.feedbacks.forEach(function(feedback){
        giftRep += "#" + feedback;
    });
    return giftRep;
}

var ReponseMatchingPairs = function(){
    this.pairs = {};
}

ReponseMatchingPairs.prototype.toGift = function(){
    let giftRep = '';
    for(let key in this.pairs){
        giftRep += "="+key + " -> " + this.pairs[key] + "\n";
    }
    return giftRep;
}

var ReponseNumerique = function(reponse, reponseAltUne,poids=1){
    this.poids = poids;
    this.reponse = reponse;
    this.reponseAlt = reponseAltUne;
}

ReponseNumerique.prototype.toGift = function(){
    let giftRep = "#"+this.reponse;
    if(this.reponseAlt){
        giftRep += "=" + this.reponseAlt;
    }
    return giftRep;
}

var ReponseAutre = function(texte, poids, feedback){
    this.texte = texte;
    this.poids = poids;
    this.feedback = feedback;
}

ReponseAutre.prototype.toGift = function(){
    let giftRep = "="+ this.texte;
    if (this.poids !=undefined){
        giftRep += "%"+this.poids+"%";
    }
    if(this.feedback != undefined){
        giftRep += "#"+this.feedback;
    }
    return giftRep;
}

var ReponseSimple = function(bonneRep = null){
    this.reponses = [];
    this.bonneReponse = bonneRep;
}

ReponseSimple.prototype.toGift = function(){
    let giftRep = "1:SA:"
    if (this.bonneReponse != null){
        giftRep += "~"+this.bonneReponse;
    }
    this.reponses.forEach(function(reponse){
        giftRep += "="+reponse;
    });
    return giftRep;
}

ReponseSimple.prototype.addReponse = function(reponse, bonneRep = false){
    this.reponses.push(reponse);
    if(bonneRep){
        this.bonneReponse = reponse;
    }
}

var ReponseMultiple = function(){
    this.reponses = [];
    this.bonnesReponses = [];
}

ReponseMultiple.prototype.addReponse = function(reponse, bonneRep = false){
    if (bonneRep){
        reponse = reponse.substring(1)
    }
    this.reponses.push(reponse);
    if(bonneRep){
        this.bonnesReponses.push(reponse);
    }
}

ReponseMultiple.prototype.toGift = function(){
    let giftRep = "1:MC:";
    this.bonnesReponses.forEach(function(reponse){
        giftRep += "="+reponse;
    });
    this.reponses.forEach(function(reponse){
        giftRep += "~"+reponse;
    });
    return giftRep;
}

var Quiz = function() {
    this.elements = [];
};

Quiz.prototype.rightAmountOfQuestions = function() {
    let nbQuestion = this.getNumberOfQuestions();
    return nbQuestion >= 15 && nbQuestion <= 20;
}

Quiz.prototype.getNumberOfQuestions = function() {
    let nbQuestion = 0;
    this.elements.forEach(function(element){
        if(element.type == 'question'){
            nbQuestion++;
        }
    });
    return nbQuestion;
}

module.exports = {
    Comment: Comment,
    Category: Category,
    Quiz: Quiz,
    Question: Question,
    ReponseVraiFaux: ReponseVraiFaux,
    ReponseMatchingPairs: ReponseMatchingPairs,
    ReponseNumerique: ReponseNumerique,
    ReponseAutre: ReponseAutre,
    ReponseSimple: ReponseSimple,
    ReponseMultiple: ReponseMultiple
};

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

var ReponseVraiFaux = function(texte){
    this.texte = texte;
    this.feedbacks = [];
}

var ReponseMatchingPairs = function(){
    this.pairs = {};
}

var ReponseNumerique = function(reponse, reponseAltUne,poids=1){
    this.poids = poids;
    this.reponse = reponse;
    this.reponseAlt = reponseAltUne;
}

var ReponseAutre = function(texte, poids, feedback){
    this.texte = texte;
    this.poids = poids;
    this.feedback = feedback;
}

var ReponseSimple = function(bonneRep = null){
    this.reponses = [];
    this.bonneReponse = bonneRep;
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

var Quiz = function() {
    this.elements = [];
};

Quiz.prototype.rightAmountOfQuestions = function() {
    let nbQuestion = 0;
    this.elements.forEach(function(element){
        if(element.type == 'question'){
            nbQuestion++;
        }
    });
    return nbQuestion >= 15 && nbQuestion <= 20;
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

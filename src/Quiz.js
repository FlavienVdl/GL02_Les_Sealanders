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
    this.titre = titre;
    this.textFormatting = textFormatting;
    //Liste de textes (énoncés) et de réponses, pour garder l'ordre
    this.textesReponses = []; 
}

var ReponseVraiFaux = function(texte){
    this.texte = texte;
    this.feedbacks = [];
}

var ReponseMatchingPairs = function(cleUne, valeurUne, cleDeux, valeurDeux, cleTrois, valeurTrois){
    this.cleUne = cleUne;
    this.valeurUne = valeurUne;
    this.cleDeux = cleDeux;
    this.valeurDeux = valeurDeux;
    this.cleTrois = cleTrois;
    this.valeurTrois = valeurTrois;
}

var ReponseNumerique = function(reponse, reponseAltUne, poidsReponseAltUne, feedbackAltUne, reponseAltDeux, poidsReponseAltDeux, feedbackAltDeux){
    this.reponse = reponse;
    this.reponseAltUne = reponseAltUne;
    this.poidsReponseAltUne = poidsReponseAltUne;
    this.feedbackAltUne = feedbackAltUne;
    this.reponseAltDeux = reponseAltDeux;
    this.poidsReponseAltDeux = poidsReponseAltDeux;
    this.feedbackAltDeux = feedbackAltDeux;
}

var ReponseAutre = function(texte, poids, feedback){
    this.texte = texte;
    this.poids = poids;
    this.feedback = feedback;
}



var Quiz = function() {
    this.elements = [];
};

module.exports = {
    Comment: Comment,
    Category: Category,
    Quiz: Quiz,
    Question: Question,
    ReponseVraiFaux: ReponseVraiFaux,
    ReponseMatchingPairs: ReponseMatchingPairs,
    ReponseNumerique: ReponseNumerique,
    ReponseAutre: ReponseAutre
};

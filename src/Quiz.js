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
    this.type = 'vraiFaux';
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
    this.type = 'matchingPairs';
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
    this.type = 'numeric';
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
    this.type = 'autres';
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
    this.type = 'simple';
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
    this.type = 'multiple';
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

// recherche du premier type de réponse rencontré dans les questions
Question.prototype.getType = function() {
    let type = "";
    this.textesReponses.forEach(function(elem){
        // si l'élément n'est pas string alors c'est forcément une réponse
        if(typeof elem !== "string"){
            //console.log(elem.type);
            type = elem.type;
        }
    })
    return type;
};

// compter le nombre de questions par type
Quiz.prototype.dicoProfile = function() {
    // création d'un dictionnaire qui va stocker le nombre de questions par type
    dico = {}
    this.elements.forEach(function(elem){
        if(elem.type === "question"){
            type = elem.getType();
            if(type!=""){
                // si le type de la question est déjà présent, on y ajoute 1
                if (dico[type] === undefined) {
                    dico[type] = 1
                }
                // sinon, on crée ce type avec comme valeur de départ 1
                else {
                    dico[type] += 1
                    //console.log(elem.type)
                }
            }
        }
    })
    // la fonction retourne un dictionnaire avec tous les types de questions rencontrés et leur nombre d'occurences
    return dico;
};
// pour compter le nombre de questions par type de tous les tests confondus, on fait la somme de tous les dictionnaires
// on utilise une boucle for each pour calculer le dico de chaque test ety à chaque fois on ajoute le précédent dico à celui actuel

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
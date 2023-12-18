const fs = require('fs');
const GiftParser = require('../GiftParser.js');

let visualise = (args, logger) => {
    fs.readFile(args.file, 'utf8', function (err, data) {
        if (err) {
            return logger.warn(err);
        }
    
        analyzer = new GiftParser();
        analyzer.parse(data);
    
        let questionToVisualize = null; //stocker la question a visualiser
        for (const element of analyzer.currentQuiz.elements) {
          if (element.titre && element.titre === args.question) //verifier si l'element a une propriete 'titre' et si elle correspond à la question specifiee.
          {
            questionToVisualize = element; //assigner l'element a la variable questionToVisualize
            break;
          }
        }
    
        if (questionToVisualize) {
          logger.info("Question trouvée :");
          logger.info(JSON.stringify(questionToVisualize, null, 2)); //afficher la question avec 2 espaces
        } else {
          logger.info("La question n'a pas été trouvée.");
        }
      });
    };

module.exports = visualise;
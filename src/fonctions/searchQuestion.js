const fs = require('fs');
const GiftParser = require('../GiftParser.js');

let searchQuestion = (args, logger) => {
    let filesToCheck = [];
			if (fs.lstatSync(args.file).isDirectory()){
				fs.readdirSync(args.file).forEach(file => {
					if(file.endsWith(".gift")){
						filesToCheck.push(args.file+"/"+file);
					}
				});
			} else {
				filesToCheck.push(args.file);
			}
			let allQuestions = [];
			let nbFichiersLus = 0;
			filesToCheck.forEach(function(file){
				fs.readFile(file, 'utf8', function (err,data) {
					if (err) {
						return logger.warn(err);
					}
			
					analyzer = new GiftParser();
					analyzer.parse(data);
					let questionsCorrespondantes = analyzer.currentQuiz.elements.filter(function(element){
						return element.titre != undefined && element.titre.includes(args.question);
					});
					allQuestions = allQuestions.concat(questionsCorrespondantes);
					nbFichiersLus++;
					if (nbFichiersLus == filesToCheck.length){
						logger.info("Questions correspondantes :")
						allQuestions.forEach(function(question){
							console.log(allQuestions.indexOf(question)+" : "+question.titre);
						});
					}
				});
			});
};

module.exports = searchQuestion;
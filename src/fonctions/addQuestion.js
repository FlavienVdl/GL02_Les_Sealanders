const fs = require('fs');
const GiftParser = require('../GiftParser.js');
const {Quiz} = require('../Quiz.js');

let addQuestion = (args, logger) => {
    let filesToCheck = [];
			if (fs.lstatSync(args.source).isDirectory()){
				fs.readdirSync(args.source).forEach(file => {
					if(file.endsWith(".gift")){
						filesToCheck.push(args.source+"/"+file);
					}
				});
			} else {
				filesToCheck.push(args.source);
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
						if (allQuestions.length == 0){
							logger.info("Aucune question correspondante, la question sera ajoutée à la fin du fichier");
						}
						let questionAAjouter = allQuestions[0];
						// Vérifier que le fichier cible ne contient pas déjà 20 questions
						fs.readFile(args.file, 'utf8', function (err,data) {
							if (err) {
								return logger.warn(err);
							}
							analyzer = new GiftParser();
							if (data != ""){
								analyzer.parse(data);
							}else{
								analyzer.currentQuiz = new Quiz();
							}
							if (analyzer.currentQuiz.getNumberOfQuestions()>=20){
								logger.info("Le fichier contient déjà 20 questions, la question ne sera pas ajoutée".red);
								return;
							} else if (fs.readFileSync(args.file, 'utf8').includes(questionAAjouter.toGift())){
                                logger.info("La question est déjà présente dans le fichier, la question ne sera pas ajoutée".red);
                            }
							else {
								fs.appendFile(args.file, "\n\n"+questionAAjouter.toGift(), function(err){
									if(err){
										return logger.warn(err);
									}
									logger.info("La question a été ajoutée au fichier %s".green, args.file);
								});
							}
						});
					}
				});
			});
}

module.exports = addQuestion;
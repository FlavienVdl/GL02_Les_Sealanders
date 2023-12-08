const fs = require('fs');
const colors = require('colors');
const GiftParser = require('./GiftParser.js');
const prompt = require('prompt-sync')();
const vg = require('vega');
const vegalite = require('vega-lite');
const readline = require('readline');
const cli = require("@caporal/core").default;
const {Quiz} = require('./Quiz.js');

cli
	.version('gift-parser-cli')
	.version('0.07')
	// check gift
	.command('check', 'Check if <file> is a valid gift file')
	.argument('<file>', 'The file to check with gift parser')
	.option('-s, --showSymbols', 'log the analyzed symbol at each step', { validator : cli.BOOLEAN, default: false })
	.option('-t, --showTokenize', 'log the tokenization results', { validator: cli.BOOLEAN, default: false })
	.action(({args, options, logger}) => {
		
		// vérification de l'identité 
		let connexion=login();
		if (connexion === "Professeur"){  

			fs.readFile(args.file, 'utf8', function (err,data) {
				if (err) {
					return logger.warn(err);
				}
		
				var analyzer = new GiftParser(options.showTokenize, options.showSymbols);
				analyzer.parse(data);
				
				if(analyzer.errorCount === 0){
					logger.info("The .gift file is a valid gift file".green);
				}else{
					logger.info("The .gift file contains error".red);
				}
				
				logger.debug(analyzer.parsedGIFT);

			});
		}	
		else{console.log('**Vous n\'avez pas les droits pour utiliser cette commande**');}
	})

	// create
	.command('create', 'Create a gift file')
	.argument('<file>', 'The file to create')
	.action(({args, options, logger}) => {
		
		// vérification de l'identité 
		let connexion=login();
		if (connexion === "Professeur"){  

			if(!args.file.endsWith(".gift")){
				return logger.warn("The file extension is not .gift".red);
			}
			else {
				fs.writeFile(args.file, "", function(err){
					if(err){
						return logger.warn(err);
					}
					logger.info("The file %s has been created".green, args.file);
				});
			}
		}
		else{console.log('**Vous n\'avez pas les droits pour utiliser cette commande**');}
	})

	//setCategory
	.command('setCategory', 'Set the category of a GIFT file')
	.argument('<file>', 'The gift file to modify')
	.argument('<category>', 'The category to set')
	.action(({args, options, logger}) => {
		
		// vérification de l'identité 
		let connexion=login();
		if (connexion === "Professeur"){  

			fs.readFile(args.file, 'utf8', function (err,data) {
				if (err) {
					return logger.warn(err);
				}
		
				// Parcourir ligne par ligne et voir si la ligne commence par $CATEGORY:
				var lines = data.split("\n");
				var newLines = [];
				var categoryFound = false;
				lines.forEach(function(line){
					if(line.startsWith("$CATEGORY:")){
						newLines.push("$CATEGORY: "+args.category);
						categoryFound = true;
					}else{
						newLines.push(line);
					}
				});
				if (!categoryFound){
					newLines.unshift("$CATEGORY: "+args.category);
				}
				var newData = newLines.join("\n");
				fs.writeFile(args.file, newData, function(err){
					if(err){
						return logger.warn(err);
					}
					logger.info("The category of %s has been set to %s".green, args.file, args.category);
				});
			});
		}
		else{console.log('**Vous n\'avez pas les droits pour utiliser cette commande**');}
	})

	//addComment
	.command('addComment', 'Add a comment to a GIFT file')
	.argument('<file>', 'The gift file to modify')
	.argument('<comment>', 'The comment to add')
	.action(({args, options, logger}) => {
		
		// vérification de l'identité 
		let connexion=login();
		if (connexion === "Professeur"){  

			fs.appendFile(args.file, "\n// "+args.comment, function(err){
				if(err){
					return logger.warn(err);
				}
				logger.info("The comment has been added to %s".green, args.file);
			});
		}
		else{console.log('**Vous n\'avez pas les droits pour utiliser cette commande**');}
	})

	//searchQuestion
	.command('searchQuestion', 'Search a question in a GIFT file')
	.argument('<file>', 'The gift file or repository to search')
	.argument('<question>', 'The question to search')
	.action(({args, options, logger}) => {

		// vérification de l'identité 
		let connexion=login();
		if (connexion === "Professeur"){  

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
		}
		else{console.log('**Vous n\'avez pas les droits pour utiliser cette commande**');}
	})

	// Permet de créer la Vcard 
	.command('Vcard', 'Create a Vcard')
	.action(({args,options,logger})=>{

		let connexion=login();
		if (connexion === "Professeur"){  

			// Validation pour le nom et prénom (lettres uniquement)
			const regexNomPrenom = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/;
	
			// Validation pour le numéro de téléphone (10 chiffres)
			const regexTelephone = /^(?:(?:\+|00)33[\s.-]{0,3}(?:\(0\)[\s.-]{0,3})?|0)[1-9](?:(?:[\s.-]?\d{2}){4}|\d{2}(?:[\s.-]?\d{3}){2})$/;
		
			// Validation pour l'adresse email
			const regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
		
			//affichage infos
			console.log("**Remplissez la Vcard**\n")

			let nom, prenom, telephone, adresse, matiere, email;
		
			do {
			nom = prompt("Entrez votre nom: ");
			} while (!regexNomPrenom.test(nom));
		
			do {
			prenom = prompt("Entrez votre prénom: ");
			} while (!regexNomPrenom.test(prenom));
		
			do {
			telephone = prompt("Entrez votre numéro de téléphone (10 chiffres): ");
			} while (!regexTelephone.test(telephone));

			do {
			email = prompt("Entrez votre adresse email: ");
			} while (!regexEmail.test(email));
		
			const vCardData = `BEGIN:VCARD
			VERSION:4.0
			FN:${prenom} ${nom}
			TEL:${telephone}
			ADR:${adresse}
			EMAIL:${email}
			ROLE:${matiere}
			END:VCARD`;
		
			// Génération de la vCard
			console.log(vCardData);
		
			// Enregistrer la vCard dans un fichier
			const nomFichier = `${nom}_${prenom}_vcard.vcf`; // Nom du fichier
			fs.writeFile(nomFichier, vCardData, (err) => {
			if (err) {
				console.error('Erreur lors de l\'enregistrement du fichier:', err);
				return;
			}
			console.log('La vCard a été enregistrée avec succès dans', nomFichier);
			});
		}
		else{console.log('**Vous n\'avez pas les droits pour utiliser cette commande**');}
	})

	//addQuestion
	.command('addQuestion', 'Add a question to a GIFT file')
	.argument('<source>', 'The source folder or file')
	.argument('<file>', 'The gift file to modify')
	.argument('<question>', 'The title of the question to add')
	.action(({args, options, logger}) => {
		let connexion=login();
		if (connexion === "Professeur"){
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
	})

			// profile with chart
			.command('profileChart', 'Generate the profile of a test or question bank and export it as Vega-lite chart')
			.alias('pflChart')
			.argument('<file>', 'The Gift file to use')
			// example : EM-U4-p32_33-Review.gift
			.action(({args, options, logger}) => {
				fs.readFile(args.file, 'utf8', function (err,data) {
					if (err) {
						return logger.warn(err);
					}
	
					analyzer = new GiftParser();
					analyzer.parse(data);
					analyzer.currentQuiz.dicoProfile();
					console.log(analyzer.currentQuiz.dicoProfile());
				});
			})

		// **** SPEC 8 : Comparaison du profil d'un test avec un ou plusieurs fichiers de la banque nationale de questions ****
		.command('compareTestProfiles', "Comparaison du profil d'un test avec un ou plusieurs fichiers de la banque nationale de questions")
		.argument('<file>', 'un test')
		.argument('<dir>', 'un ou plusieurs fichiers de la banque nationale de questions')
		.alias('compare')
		.action(({args,options,logger})=>{
			
			// ** Vérification de l'identité **
			let connexion=login();
			if (connexion === "Professeur") {
				
				// ** Création d'une liste contenant les fichiers à comparer **
				let filesToCompare = [];
				if (fs.lstatSync(args.dir).isDirectory()){
					fs.readdirSync(args.dir).forEach(file => {
						if(file.endsWith(".gift")){
							filesToCompare.push(args.dir+"/"+file);
						}
					});
				} else {
					filesToCompare.push(args.dir);
				}

				// ** Création d'un dictionnaire de fréquence des types de questions dans les fichiers à comparer **
				let dicoFilesToCompare = {}
				let containsNoQuestions = false;
				// Parcours des fichiers
				filesToCompare.forEach(function(file){
					fs.readFile(file, 'utf8', function (err,data) {
						if (err) {
							return logger.warn(err);
						}
						analyzer = new GiftParser();
						analyzer.parse(data);
						let dicoFile = analyzer.currentQuiz.dicoProfile();
						let dicoFileKeys = Object.keys(dicoFile);
						// vérifier que le fichier contient des questions
						if (dicoFileKeys.length === 0) {
							containsNoQuestions = true;
						}
						// Parcours des types questions dans le fichier
						dicoFileKeys.forEach(function(key){
							if (dicoFilesToCompare[key] === undefined) {
								dicoFilesToCompare[key] = dicoFile[key];
							}
							else {
								dicoFilesToCompare[key] += dicoFile[key];
							}
						});
					});
				});
				
				// ** Création d'un dictionnaire de fréquence des types de questions dans le test **
				fs.readFile(args.file, 'utf8', function (err,data) {
					if (err) {
						return logger.warn(err);
					}
					analyzer = new GiftParser();
					analyzer.parse(data);
					let dicoTest = analyzer.currentQuiz.dicoProfile();
					const dicoTestKeys = Object.keys(dicoTest);
					// vérifier que le test contient des questions
					if (dicoTestKeys.length === 0) {
						containsNoQuestions = true;
					}

					// ** Si un des fichiers ne contient pas de question(s) => affichage d'un message d'erreur **
					try {
						if (containsNoQuestions) {
							throw new Error("\n**Attention !!! Un des fichiers ne contient pas de question(s) !**\n");
						}
					} catch (erreur) {
						console.error(erreur.message);
					}
				
					// ** Création d'un dictionnaire de fréquence MOYENNE des types de questions dans les fichiers à comparer **
					const nbFichiers = filesToCompare.length;
					const dicoFilesToCompareKeys = Object.keys(dicoFilesToCompare);
					dicoFilesToCompareKeys.forEach(function(key){
						dicoFilesToCompare[key] = Math.round(dicoFilesToCompare[key]/nbFichiers);
					});

					// ** Visualisation avec vega-lite dans un fichier .svg **
					let formattedData = [];
					const allKeys = new Set([...dicoTestKeys, ...dicoFilesToCompareKeys]);
					allKeys.forEach(function(type) {
						for (let i = 0; i < 2; i++) {
							let src = "";
							let value = 0;
							if (i===0) {
								src = "Votre test";
								value = dicoTest[type] || 0;
							} else {
								src = "Autre(s) fichier(s)";
								value = dicoFilesToCompare[type] || 0;
							}
							formattedData.push({
								questionType: type,
								source: src,
								count: value
							});
						}
					});
					const spec = {
						"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
						"width": 150,
						"height": 200,
						"data": {
							"values": formattedData
						},
						"mark": "bar",
						"title": {
							"text": "Comparaison du profil de votre test avec le profil moyen des fichiers de la banque nationale de questions",
							"fontSize": 18
						},
						"encoding": {
							"column": {
								"field": "questionType", "type": "ordinal",
								"axis":{"title": "Type de question"}
							},
							"y": {
								"field": "count", "type": "quantitative",
								"axis":{"title": "Nombre de question"}
							},
							"x": {
								"field": "source", "type": "nominal",
								"scale": {"rangeStep": 12},
								"axis": {"title": "", "labels": false}
							},
							"color": {
								"field": "source", "type": "nominal",
								"scale": {"range": ["#EA98D2", "#659CCA"]},
								"legend": {"title": "Source"}
							}
						},
						"config": {
							"legend": {
								"labelLimit": 0,
								"titleLimit": 0 
							}
						}
					};
					const vegaSpec = vegalite.compile(spec).spec;
					const runtime = vg.parse(vegaSpec);
					const view = new vg.View(runtime).renderer('svg').run();
					const mySvg = view.toSVG();
					mySvg.then(function (res) {
						fs.writeFileSync("./result.svg", res);
						view.finalize();
					});
				});

				// ** Indication de l'emplacement du fichier .svg **
				console.log("\n**Comparaison terminée ! Retrouvez le résultat dans le fichier ./result.svg**\n");
			}
			else {
				// Message si l'identification a échouée
				console.log('**Vous n\'avez pas les droits pour utiliser cette commande**');
			}
		})	
	
	// *************** TD Commands ***************
	
	// readme
	.command('readme', 'Display the README.txt file')
	.action(({args, options, logger}) => {
		fs.readFile("./README.txt", 'utf8', function(err, data){
			if(err){
				return logger.warn(err);
			}
			
			logger.info(data);
		});
		
	})
	
	// search
	.command('search', 'Free text search on POIs\' name')
	.argument('<file>', 'The gift file to search')
	.argument('<needle>', 'The text to look for in POI\'s names')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
		if (err) {
			return logger.warn(err);
		}
  
		analyzer = new GiftParser();
		analyzer.parse(data);
		
		if(analyzer.errorCount === 0){
			var n = new RegExp(args.needle);
			var filtered = analyzer.parsedPOI.filter( p => p.name.match(n, 'i'));
			logger.info("%s", JSON.stringify(filtered, null, 2));
			
		}else{
			logger.info("The .gift file contains error".red);
		}
		
		});
	})

	// average
	.command('average', 'Compute the average note of each POI')
	.alias('avg')
	.argument('<file>', 'The gift file to use')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
		if (err) {
			return logger.warn(err);
		}
  
		analyzer = new GiftParser();
		analyzer.parse(data);
		
		if(analyzer.errorCount === 0){

			var avg = analyzer.parsedPOI.map(p => {
				var m = 0	
				// compute the average for each POI
				if(p.ratings.length > 0){
					m = p.ratings.reduce((acc, elt) => acc + parseInt(elt), 0) / p.ratings.length;
				}
				p["averageRatings"] = m;
				return p;
			})
			logger.info("%s", JSON.stringify(avg, null, 2));
			
		}else{
			logger.info("The .gift file contains error".red);
		}
		
		});
	})	
	
	// average with chart
	.command('averageChart', 'Compute the average note of each POI and export a Vega-lite chart')
	.alias('avgChart')
	.argument('<file>', 'The gift file to use')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
		if (err) {
			return logger.warn(err);
		}
  
		analyzer = new GiftParser();
		analyzer.parse(data);		
		
		if(analyzer.errorCount === 0){

			var avg = analyzer.parsedPOI.map(p => {
				var m = 0
				// compute the average for each POI
				if(p.ratings.length > 0){
					m = p.ratings.reduce((acc, elt) => acc + parseInt(elt), 0) / p.ratings.length;
				}
				p["averageRatings"] = m;
				return p;
			})
			
			var avgChart = {
				//"width": 320,
				//"height": 460,
				"data" : {
						"values" : avg
				},
				"mark" : "bar",
				"encoding" : {
					"x" : {"field" : "name", "type" : "nominal",
							"axis" : {"title" : "Restaurants' name."}
						},
					"y" : {"field" : "averageRatings", "type" : "quantitative",
							"axis" : {"title" : "Average ratings for "+args.file+"."}
						}
				}
			}
			
			
			
			const myChart = vegalite.compile(avgChart).spec;
			
			/* SVG version */
			var runtime = vg.parse(myChart);
			var view = new vg.View(runtime).renderer('svg').run();
			var mySvg = view.toSVG();
			mySvg.then(function(res){
				fs.writeFileSync("./result.svg", res)
				view.finalize();
				logger.info("%s", JSON.stringify(myChart, null, 2));
				logger.info("Chart output : ./result.svg");
			});
			
			/* Canvas version */
			/*
			var runtime = vg.parse(myChart);
			var view = new vg.View(runtime).renderer('canvas').background("#FFF").run();
			var myCanvas = view.toCanvas();
			myCanvas.then(function(res){
				fs.writeFileSync("./result.png", res.toBuffer());
				view.finalize();
				logger.info(myChart);
				logger.info("Chart output : ./result.png");
			})			
			*/
			
			
		}else{
			logger.info("The .gift file contains error".red);
		}
		
		});
	})	
	
	
	// abc
	.command('abc', 'Organize POI in an Object grouped by name')
	.argument('<file>', 'The gift file to group by')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
		if (err) {
			return logger.warn(err);
		}
  
		analyzer = new GiftParser();
		analyzer.parse(data);
		
		if(analyzer.errorCount === 0){

			var abc = analyzer.parsedPOI.reduce(function(acc, elt){
				var idx = elt.name.charAt(0);
				if(acc[idx]){
					acc[idx].push(elt);
				}else{
					acc[idx] = [elt];
				}
				return acc;
			}, {})

			logger.info("%s", JSON.stringify(abc, null, 2));
			
		}else{
			logger.info("The .gift file contains error".red);
		}
		
		});
	})
	
	
cli.run(process.argv.slice(2));
	
// Partie fonctions ***************************************************************************************

  // fonction connexion

  function login(){
	const users = [
		{ username: 'prof', password: 'profpass', role: 'Professeur' },
		{ username: 'etu', password: 'etupass', role: 'étudiant' }
	  ];
	  
	  // Fonction de connexion
	  function login(username, password) {
		const user = users.find(user => user.username === username && user.password === password);
		return user ? user : null;
	  }
	  
	  // Demander le nom d'utilisateur et le mot de passe à l'utilisateur
	  const usernameInput = prompt('Entrez votre nom d\'utilisateur : ');
	  const passwordInput = prompt.hide('Entrez votre mot de passe : '); // Masque le mot de passe lors de la saisie
	  
	  const loggedInUser = login(usernameInput, passwordInput);
	  
	  if (loggedInUser) {
		console.log(`\n**Connecté en tant que ${loggedInUser.username}. Rôle : ${loggedInUser.role}**\n`);
		if (loggedInUser.role === 'Professeur' || loggedInUser.role === 'étudiant') {
		  return loggedInUser.role
		} 
	  } else {
		console.log('**Mot de passe ou Nom d\'utilisateur invalide**');
	  }
  }

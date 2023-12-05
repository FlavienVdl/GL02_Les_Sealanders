const fs = require('fs');
const colors = require('colors');
const GiftParser = require('./GiftParser.js');

const vg = require('vega');
const vegalite = require('vega-lite');

const cli = require("@caporal/core").default;



cli
	.version('gift-parser-cli')
	.version('0.07')
	// check gift
	.command('check', 'Check if <file> is a valid gift file')
	.argument('<file>', 'The file to check with gift parser')
	.option('-s, --showSymbols', 'log the analyzed symbol at each step', { validator : cli.BOOLEAN, default: false })
	.option('-t, --showTokenize', 'log the tokenization results', { validator: cli.BOOLEAN, default: false })
	.action(({args, options, logger}) => {
		
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
			
			logger.debug(analyzer.parsedPOI);

		});
			
	})
	
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
	

	//Permet de connecter l'utilisateur 
	.command('Connexion', 'Display the login menu')
	.action(({args,options,logger})=>{
		const readline = require('readline');
		const prompt = require('prompt-sync')();
		
		
		const users = [
			{ username: 'prof', password: 'profpass', role: 'Professeur' },
			{ username: 'admin', password: 'adminpass', role: 'administrateur' },
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
			console.log(`Connecté en tant que ${loggedInUser.username}. Rôle : ${loggedInUser.role}`);
			if (loggedInUser.role === 'Professeur' || loggedInUser.role === 'étudiant') {
				console.log("Connecté");
			  Menu(loggedInUser.role);
			} 
		  } else {
			console.log('Identifiants incorrects. Connexion échouée.');
		  }
			
		



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

// fonction afficher le menu professeur
function Menu(role){

	const prompt = require('prompt-sync')();
	
	
	// Fonction pour afficher le menu des professeurs
	function afficherMenu() {
		console.log("Menu :");
		console.log("1. Lire un fichier");
		console.log("2. Créer une Vcard");
		console.log("3. Option 3");
		console.log("4. Quitter");
	}


		
		let choix =0;
		// Appeler la fonction correspondante en fonction du choix
		// Menu pour les professeurs
		if (role === 'Professeur'){
			while(choix!=4){
				afficherMenu();
				// Récupérer le choix de l'utilisateur
				choix = parseInt(prompt("Choisissez une option (1-4) :"));
			
				switch (choix) {
					case 1:
						fonctionOption1();
						break;
					case 2:
						genererVCard();
						break;
					case 3:
						fonctionOption3();
						break;
					case 4:
						console.log("Au revoir !");
						break;
					default:
						console.log("Choix invalide. Veuillez choisir une option valide.");
						afficherMenu(); // Afficher à nouveau le menu en cas de choix invalide
						break;
				}
			}
		}

		// Menu pour les étudiants 
		else if (role === 'étudiant'){
			while(choix!=4){
				afficherMenu();
				// Récupérer le choix de l'utilisateur
				choix = parseInt(prompt("Choisissez une option (1-4) :"));
			
				switch (choix) {
					case 1:
						fonctionOption1();
						break;
					case 2:
						genererVCard();
						break;
					case 3:
						fonctionOption3();
						break;
					case 4:
						console.log("Au revoir !");
						break;
					default:
						console.log("Choix invalide. Veuillez choisir une option valide.");
						afficherMenu(); // Afficher à nouveau le menu en cas de choix invalide
						break;
				}
			}
		
	}
	
	// Fonctions à implémenter ultérieurement
	function fonctionOption1() {
		console.log("Fonction de l'option 1 à implémenter ultérieurement.");
		// Implémenter la logique de l'option 1 ici
		afficherMenu(); // Retourner au menu principal
	}
	
	function fonctionOption2() {
		console.log("Fonction de l'option 2 à implémenter ultérieurement.");
		// Implémenter la logique de l'option 2 ici
		afficherMenu; // Retourner au menu principal
	}
	
	function fonctionOption3() {
		console.log("Fonction de l'option 3 à implémenter ultérieurement.");
		// Implémenter la logique de l'option 3 ici
		afficherMenu(); // Retourner au menu principal
	}
	
	
}
	

// fonction pour générer la vcard
function genererVCard() {
    const prompt = require('prompt-sync')();
    const fs = require('fs');
   
  
    // Validation pour le nom et prénom (lettres uniquement)
    const regexNomPrenom = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/;
  
    // Validation pour le numéro de téléphone (10 chiffres)
    const regexTelephone = /^(?:(?:\+|00)33[\s.-]{0,3}(?:\(0\)[\s.-]{0,3})?|0)[1-9](?:(?:[\s.-]?\d{2}){4}|\d{2}(?:[\s.-]?\d{3}){2})$/;
  
    // Validation pour l'adresse email
    const regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
  
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
  
    adresse = prompt("Entrez votre adresse: ");
    matiere = prompt("Entrez la matière enseignée: ");
  
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
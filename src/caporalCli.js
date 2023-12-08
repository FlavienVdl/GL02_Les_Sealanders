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
			
			logger.debug(analyzer.parsedGIFT);

		});
			
	})

	// create
	.command('create', 'Create a gift file')
	.argument('<file>', 'The file to create')
	.action(({args, options, logger}) => {
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
	})

	//setCategory
	.command('setCategory', 'Set the category of a GIFT file')
	.argument('<file>', 'The gift file to modify')
	.argument('<category>', 'The category to set')
	.action(({args, options, logger}) => {
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
	})

	//addComment
	.command('addComment', 'Add a comment to a GIFT file')
	.argument('<file>', 'The gift file to modify')
	.argument('<comment>', 'The comment to add')
	.action(({args, options, logger}) => {
		fs.appendFile(args.file, "\n// "+args.comment, function(err){
			if(err){
				return logger.warn(err);
			}
			logger.info("The comment has been added to %s".green, args.file);
		});
	})

	//searchQuestion
	.command('searchQuestion', 'Search a question in a GIFT file')
	.argument('<file>', 'The gift file or repository to search')
	.argument('<question>', 'The question to search')
	.action(({args, options, logger}) => {
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
			//var filtered = analyzer.parsedPOI.filter( p => p.name.match(n, 'i'));
			var filtered = analyzer.parsedGIFT.filter( p => p.name.match(n, 'i'));
			logger.info("%s", JSON.stringify(filtered, null, 2));
			
		}else{
			logger.info("The .gift file contains error".red);
		}
		
		});
	})


	// visualise
	.command('visualise', 'Visualiser une question d\'un questionnaire')
	.argument('<file>', 'Le fichier questionnaire')
	.argument('<question>', 'Le titre exact de la question à visualiser')
	.action(({ args, options, logger }) => {
		console.log("Coucou a marche !");
	  fs.readFile(args.file, 'utf8', function (err, data) {
		if (err) {
			console.log("Coucou a marche !");
			return logger.warn(err);
		}
		console.log("Coucou a marche !");
		console.log(data);
  
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
	
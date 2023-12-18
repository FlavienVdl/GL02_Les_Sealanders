const fs = require('fs');
const GiftParser = require('../GiftParser.js');
const vegalite = require('vega-lite');
const vg = require('vega');

let compareTestProfiles = (args, logger) => {
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
module.exports = compareTestProfiles;
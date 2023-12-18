const fs = require('fs');
const GiftParser = require('../GiftParser.js');
const vg = require('vega');
const vegalite = require('vega-lite');

let profileChart = (args, logger) => {
    fs.readFile(args.file, 'utf8', function (err,data) {
        if (err) {
            return logger.warn(err);
        }

        analyzer = new GiftParser();
        analyzer.parse(data);
        let dico = analyzer.currentQuiz.dicoProfile();

        // gestion d'erreur : aucune question dans le test sélectionné
        if (dico == {}){ 
            console.log('Le test sélectionné ne contient aucune question.')
        }

        // on créé un tableau pour stocker les données du dictionnaire
        let dicoKey = Object.keys(dico);
        let tabDico = []
        dicoKey.forEach(function (key){
            tabDico.push({type:key,nombre:dico[key]});
        })
        console.log(tabDico);

        //console.log(dicoValues);
        if(analyzer.errorCount === 0){
            var avgChart = {
                "width": 600,
                "height": 600,
                "data" : {
                    // on utilise les données du tableau pour l'affichage
                    "values":tabDico
                },
                
                "mark" : "bar",
                "title" : "Répartition des différents types de questions", // Profil "+args.file,
                "subtitle" : "'Répartition des différents types de questions.",
                "encoding" : {
                    "x" : {"field" : "type", "type" : "nominal",
                            "axis" : {"title" : "Type de questions"}
                        },
                    "y" : {"field" : "nombre", "type" : "quantitative",
                            "axis" : {"title" : "Nombre de questions"}
                        }
                }
            }
            
            const myChart = vegalite.compile(avgChart).spec;
            
            // SVG version
            var runtime = vg.parse(myChart);
            var view = new vg.View(runtime).renderer('svg').run();
            var mySvg = view.toSVG();
            mySvg.then(function(res){
                fs.writeFileSync("data/profil_"+args.file.substring(20)+".svg", res)
                view.finalize();
                //logger.info("%s", JSON.stringify(myChart, null, 2));
                logger.info("Chart output : profil_"+args.file.substring(20)+".svg");
                // affichage dans le cmd car histogramme incomplet
                console.log("Voici les différents types de questions du test "+args.file.substring(20)+" : ")
                console.log(analyzer.currentQuiz.dicoProfile());
            });  
        }
        else{
            logger.info("The .gift file contains error".red);
        }
    });
}

module.exports = profileChart;
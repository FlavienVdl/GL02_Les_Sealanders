function Menu_etu(){

    const prompt = require('prompt-sync')();
    const Vcard=require('../generationVcard/generation.js')
    
    // Fonction pour afficher le menu des étudiants
    function afficherMenu_etu() {
        console.log("Menu :");
        console.log("1. Lire un fichier");
        console.log("2. Créer une Vcard");
        console.log("3. Option 3");
        console.log("4. Quitter");
    
        // Récupérer le choix de l'utilisateur
        let choix = parseInt(prompt("Choisissez une option (1-4) :"));
    
        // Appeler la fonction correspondante en fonction du choix
        switch (choix) {
            case 1:
                fonctionOption1();
                break;
            case 2:
                Vcard.genererVCard();
                break;
            case 3:
                fonctionOption3();
                break;
            case 4:
                console.log("Au revoir !");
                break;
            default:
                console.log("Choix invalide. Veuillez choisir une option valide.");
                afficherMenu_etu(); // Afficher à nouveau le menu en cas de choix invalide
                break;
        }
    }
    
    // Fonctions à implémenter ultérieurement
    function fonctionOption1() {
        console.log("Fonction de l'option 1 à implémenter ultérieurement.");
        // Implémenter la logique de l'option 1 ici
        afficherMenu_etu(); // Retourner au menu principal
    }
    
    function fonctionOption2() {
        console.log("Fonction de l'option 2 à implémenter ultérieurement.");
        // Implémenter la logique de l'option 2 ici
        afficherMenu_etu(); // Retourner au menu principal
    }
    
    function fonctionOption3() {
        console.log("Fonction de l'option 3 à implémenter ultérieurement.");
        // Implémenter la logique de l'option 3 ici
        afficherMenu_etu(); // Retourner au menu principal
    }
    
    // Lancement du menu principal
    afficherMenu_etu();
    }


module.exports={ Menu_etu };
# GL02_Les_Sealanders
Ce fichier README.md a été généré le 2023-12-06 par Tifenn NOËL.

## Table des matières
* [Projet](#projet)
* [Installation](#installation)
* [Git](#git)
* [Node.js](#node)
* [Utilisation](#utilisation)
* [Gift Parser CLI](#gift-parser-cli)
* [Roadmap](#roadmap)
* [Spécifications fonctionnelles SPEC](#spécifications_fonctionnelles_spec)
* [Contributeurs](#contributeurs)
* [Contact](#contact)

## Projet
Dans le cadre de l'Unité d'Enseignement GL02, dispensée à l'UTT, notre équipe, **Les Sealanders**, se lance dans un projet proposé par le Ministère de l'éducation nationale de la République de Sealand : Un **system de gestion et de préparation de tests et examens en ligne.**

> Notre objectif est de permettre aux enseignants de compiler un ensemble de **questions** et de les rassembler dans un **fichier d'examen_** au **format GIFT**. Le dossier résultant sera éventuellement déposé sur le serveur d'examen, bien que cet aspect spécifique soit hors du cadre de ce projet. De plus, notre outil facilitera la génération des **informations d'identification** et de contact d'un enseignant au **format VCard** (RFC 6350 et 6868). Notre logiciel offrira également la possibilité de **simuler l'expérience de test** d'un étudiant, en évitant la présence d'une même question plus d'une fois dans un examen contenant au moins **15 questions** et **pas plus de 20** et de générer un **rapport** de ses réponses.

## Installation

#### Git
Pour cloner le dépôt : `git clone https://github.com/FlavienVdl/GL02_Les_Sealanders/`  
Pour accéder au répertoire du projet : `cd GL02_Les_Sealanders`

#### Node.js
Cet outil nécessite l'installation de Node.js | Version : **v21.3.0** ou +  
Pour vérifier votre version : `node -v`  
Pous installer Node.js : `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash`  
Pour mettre à jour Node.js : `nvm install <version>`  
Documentation Node.js : [Documentation](https://nodejs.org/docs/latest/api/)  

## Utilisation

#### Gift Parser CLI 
Le Gift Parser CLI est une interface en ligne de commande (CLI) développée en Node.js qui facilite la manipulation de fichiers au format GIFT (General Import Format Technology).

Il propose plusieurs **commandes** pour travailler avec des fichiers GIFT :
* Pour créer un quizz : `node caporalCLI.js create ../data/newQuiz.gift`
* Pour ajouter une catégorie : `node caporalCLI.js setCategory ../data/newQuiz.gift "categorie"`
* Pour ajouter un commentaire : `node caporalCLI.js addComment ../data/newQuiz.gift "Commentaire a ajouter"`
* Pour ajouter une question : `node caporalCLI.js addQuestion d../data/SujetB_data test.gift "chaine de caractère"`
* Pour rechercher une question : `node caporalCLI.js searchQuestion ../data/SujetB_data/ "chaine de caractère"` 
* Pour visualiser une question et ses réponses : `node caporalCLI.js visualise ../data/ "titre exact"`
* Pour afficher un fichier Vcard : `node caporalCLI.js Vcard`
    * Connection possible que pour le rôle de professeur
* Pour comparer le profil d'un test avec un ou plusieurs fichiers de la banque nationale de questions : `node caporalCli.js compare <test> <directory>`
* Pour afficher le profil d'un test ou d'une banque de questions en générant un histogramme (svg) des types de questions : `node caporalCli.js profileChart ../data/SujetB_data/EM-U4-p32_33-Review.gift`


## Roadmap

#### Spécifications fonctionnelles SPEC

- [x] **SPEC1** : Composer un test au format GFIT (MUST)
- [x] **SPEC2** : Rechercher et visualiser des questions (MUST)
- [x] **SPEC3** : Sélectionner une question (MUST)
- [x] **SPEC4** : Vérifier la qualité du test (MUST)
- [x] **SPEC5** : Générer des fichiers VCard (SHOULD)
- [ ] **SPEC6** : Simuler la passation d'un test (COULD)
- [x] **SPEC7** : Afficher le profil d'un test GIFT ou d'une banque de questions (SHOULD)
- [ ] **MAINTENANCE** : Le code sera maintenu et corriger au besoin. N'hésitez pas à nous contacter [Contact](#contact)


## Contributeurs
Flavien VIDAL (Chef des Sealanders)  
Olivier BESNARD  
Aurele CHAMBON  
Tifenn NOËL  
Adrien TORRENT  

## Contact
tifenn.noel@utt.fr
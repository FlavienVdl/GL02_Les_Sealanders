# GL02_Les_Sealanders
Ce fichier README.md a été généré le 2023-12-06 par Tifenn NOËL.

## Table des matières
1. [Projet](#projet)
2. [Installation](#installation)
3. [Roadmap](#roadmap)
4. [Spécifications fonctionnelles SPEC](#spécifications_fonctionnelles_spec)
5. [Contributeurs](#contributeurs)

## Projet
Dans le cadre de l'Unité d'Enseignement GL02, dispensée à l'UTT, notre équipe, **Les Sealanders**, se lance dans un projet proposé par le Ministère de l'éducation nationale de la République de Sealand : Un **system gestion et de préparation de tests et examens en ligne.**

> Citation

## Installation

### Git
Pour cloner le dépôt : `git clone https://github.com/FlavienVdl/GL02_Les_Sealanders/`
Pour accéder au répertoire du projet : `cd GL02_Les_Sealanders`

### Node
Cet outil nécessite l'installation de Node.js | Version : **v21.3.0** ou +
Pour vérifier votre version, taper la commande : `node -v`
Pous installer Node.js : `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash`
Pour mettre à jour Node.js : `nvm install <version>`
Documentation Node.js : [Documentation](https://nodejs.org/docs/latest/api/)

## Utilisation

### Gift Parser CLI 
Le Gift Parser CLI est une interface en ligne de commande (CLI) développée en Node.js qui facilite la manipulation de fichiers au format GIFT (General Import Format Technology).

Il propose plusieurs **commandes** pour travailler avec des fichiers GIFT :
* Pour créer un quizz : `node caporalCLI.js create ../data/newQuiz.gift`
* * Pour ajouter une catégorie : `node caporalCLI.js setCategory ../data/newQuiz.gift "categorie"`
* Pour ajouter un commentaire : `node caporalCLI.js addComment ../data/newQuiz.gift "Commentaire a ajouter"`
* Pour ajouter une question : `node caporalCLI.js addQuestion dossier-source fichier-dest "titre question a ajouter"`
* Pour rechercher une question : `node caporalCLI.js searchQuestion ../data/ "chaine à rechercher">` 
`* Sans la chaine, il affiche les x premières questions (n'affiche que les titres)`
* Pour visualiser une question et ses réponses : `node caporalCLI.js visualise ../data/ "titre exact"`


## Roadmap

### Spécifications fonctionnelles SPEC

- [x] **SPEC1** : Composer un test au format GFIT (MUST)
- [ ] **SPEC2** : Rechercher et visualiser des questions (MUST)
- [ ] **SPEC3** : Sélectionner une question (MUST)
- [ ] **SPEC4** : Vérifier la qualité du test (MUST)
- [x] **SPEC5** : Générer des fichiers VCard (SHOULD)
- [ ] **SPEC6** : Simuler la passation d'un test (COULD)
- [ ] **SPEC7** : Afficher le profil d'un test GIFT ou d'une banque de questions (SHOULD)


## Contributeurs
Flavien VIDAL (Chef des Sealanders)
Olivier BESNARD
Aurele CHAMBON
Tifenn NOËL
Adrien TORRENT

## Contact
tifenn.noel@utt.fr
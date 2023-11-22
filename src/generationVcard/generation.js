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
  
  // Appel de la fonction pour générer la vCard et l'enregistrer dans un fichier
  module.exports = { genererVCard };
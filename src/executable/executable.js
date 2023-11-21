const prompt = require('prompt-sync')();
const Menu_prof=require('./Menu_prof.js')
const Menu_etu=require('./Menu_etu.js')
// Base de données interne (simulée)
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
const passwordInput = prompt('Entrez votre mot de passe : ');

const loggedInUser = login(usernameInput, passwordInput);

if (loggedInUser) {
  console.log(`Connecté en tant que ${loggedInUser.username}. Rôle : ${loggedInUser.role}`);
  if(loggedInUser.role==='Professeur'){
    Menu_prof.Menu_prof();
  }
  else{
    Menu_etu.Menu_etu();
  }
} else {
  console.log('Identifiants incorrects. Connexion échouée.');
}
const openpgp = require('openpgp');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    // Informations sur l'auteur ou le créateur
    const user = {
      name: 'Sky Genesis Enterprise', // Nom de l'auteur
      email: 'contact@skygenesisenterprise.com', // Email de l'auteur
      passphrase: 'your-secure-passphrase', // Passphrase pour protéger la clé privée
    };

    // Générer une paire de clés PGP
    const { privateKey, publicKey } = await openpgp.generateKey({
      type: 'rsa', // Type de clé (RSA)
      rsaBits: 4096, // Taille de la clé (4096 bits pour une sécurité élevée)
      userIDs: [{ name: user.name, email: user.email }], // Identité de l'utilisateur
      passphrase: user.passphrase, // Passphrase pour protéger la clé privée
    });

    // Chemins pour enregistrer les clés
    const publicKeyPath = path.join(__dirname, '../public/pgp-key.txt');

    // Enregistrer la clé publique dans le répertoire public
    fs.writeFileSync(publicKeyPath, publicKey, 'utf8');
    console.log(`Clé publique enregistrée dans : ${publicKeyPath}`);

    console.log('Clés PGP générées avec succès.');
  } catch (error) {
    console.error('Erreur lors de la génération des clés PGP :', error);
  }
})();
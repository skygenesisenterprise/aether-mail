// scripts/deploy.js

const execSync = require('child_process').execSync;

function deploy() {
  console.log('Starting deployment...');
  try {
    // Exécute les commandes de déploiement ici (ex. : push vers un serveur, etc.)
    execSync('npm run build', { stdio: 'inherit' });
    execSync('npm run deploy', { stdio: 'inherit' });
    console.log('Deployment successful!');
  } catch (error) {
    console.error('Deployment failed:', error);
  }
}

deploy();

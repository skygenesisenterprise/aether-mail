// pr.mjs
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const main = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'branch',
      message: '🔀 Nom de la branche :',
    },
    {
      type: 'input',
      name: 'commit',
      message: '✏️ Message de commit :',
    },
  ]);

  // Définir le chemin du fichier changelog.md dans le dossier .github
  const changelogDir = path.resolve(process.cwd(), '.github');
  const changelogPath = path.join(changelogDir, 'changelog.md');

  // Vérifier si le dossier .github existe, sinon le créer
  if (!fs.existsSync(changelogDir)) {
    console.log('📂 Création du dossier .github...');
    fs.mkdirSync(changelogDir);
  }

  // Ajouter une entrée au changelog
  const date = new Date().toISOString().split('T')[0]; // Date au format YYYY-MM-DD
  let changelogEntry = `## ${date}\n\n- **Branche** : ${answers.branch}\n- **Message** : ${answers.commit}\n`;

  // Récupérer les informations de l'utilisateur ayant effectué la dernière modification avec Git
  try {
    const gitLog = execSync(`git log -1 --pretty=format:"%an <%ae>" -- ${changelogPath}`).toString().trim();
    changelogEntry += `- **Dernière modification par** : ${gitLog}\n\n`;
  } catch (error) {
    changelogEntry += `- **Dernière modification par** : Non disponible\n\n`;
  }

  if (!fs.existsSync(changelogPath)) {
    console.log('📄 Création du fichier changelog.md...');
    fs.writeFileSync(changelogPath, `# Changelog\n\n${changelogEntry}`);
  } else {
    console.log('✏️ Mise à jour du fichier changelog.md...');
    fs.appendFileSync(changelogPath, changelogEntry);
  }

  // Exécuter les commandes Git
  execSync(`git checkout -b ${answers.branch}`, { stdio: 'inherit' });
  execSync(`git add .`, { stdio: 'inherit' });
  execSync(`git commit -m "${answers.commit}"`, { stdio: 'inherit' });
  execSync(`git push origin ${answers.branch}`, { stdio: 'inherit' });

  console.log("\n✅ Pull Request prête à être soumise sur GitHub !");
};

main();

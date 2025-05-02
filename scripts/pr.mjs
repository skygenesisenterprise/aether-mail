// pr.mjs
import inquirer from 'inquirer';
import { execSync } from 'child_process';

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

  execSync(`git checkout -b ${answers.branch}`, { stdio: 'inherit' });
  execSync(`git add .`, { stdio: 'inherit' });
  execSync(`git commit -m "${answers.commit}"`, { stdio: 'inherit' });
  execSync(`git push origin ${answers.branch}`, { stdio: 'inherit' });

  console.log("\n✅ Pull Request prête à être soumise sur GitHub !");
};

main();

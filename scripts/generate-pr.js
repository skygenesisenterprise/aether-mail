// scripts/generate-pr.js

const { execSync } = require('child_process');

function createPR() {
  const branchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  const prTitle = 'WIP: ' + branchName;
  const prBody = 'Auto-generated PR. Please review.';
  
  try {
    execSync(`git add .`, { stdio: 'inherit' });
    execSync(`git commit -m "WIP: Changes for PR"`, { stdio: 'inherit' });
    execSync(`git push origin ${branchName}`, { stdio: 'inherit' });
    execSync(`gh pr create --base main --head ${branchName} --title "${prTitle}" --body "${prBody}"`, { stdio: 'inherit' });
    console.log('PR created successfully!');
  } catch (error) {
    console.error('Failed to create PR:', error);
  }
}

createPR();

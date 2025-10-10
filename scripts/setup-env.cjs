#!/usr/bin/env node

/**
 * Environment Setup Script
 * Automatically configures the environment based on NODE_ENV
 */

const fs = require("fs");
const path = require("path");

const ENV_FILES = {
  development: ".env.development",
  production: ".env.production",
  test: ".env.test",
};

function setupEnvironment() {
  const nodeEnv = process.env.NODE_ENV || "development";
  const envFile = ENV_FILES[nodeEnv];

  if (!envFile) {
    console.error(`❌ Unknown environment: ${nodeEnv}`);
    console.error(
      `Available environments: ${Object.keys(ENV_FILES).join(", ")}`,
    );
    process.exit(1);
  }

  const envPath = path.join(__dirname, "..", envFile);
  const targetPath = path.join(__dirname, "..", ".env");

  try {
    // Check if the environment file exists
    if (!fs.existsSync(envPath)) {
      console.error(`❌ Environment file not found: ${envPath}`);
      console.error(`Please create ${envFile} based on .env-template`);
      process.exit(1);
    }

    // Copy the environment file
    fs.copyFileSync(envPath, targetPath);

    console.log(`✅ Environment configured for: ${nodeEnv}`);
    console.log(`📄 Using configuration: ${envFile}`);

    // Display important configuration info
    if (nodeEnv === "production") {
      const envContent = fs.readFileSync(envPath, "utf8");
      const hasApiToken =
        envContent.includes("API_TOKEN=") &&
        !envContent.includes('API_TOKEN=""') &&
        !envContent.includes('API_TOKEN="your-production-api-token"');

      if (hasApiToken) {
        console.log("🔗 API integration: ENABLED");
      } else {
        console.log("⚠️  API integration: DISABLED (configure API_TOKEN)");
      }
    } else {
      console.log("🎭 Development mode: Mock data enabled");
    }
  } catch (error) {
    console.error("❌ Failed to setup environment:", error.message);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  setupEnvironment();
}

module.exports = { setupEnvironment };

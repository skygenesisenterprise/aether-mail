#!/usr/bin/env node

/**
 * Environment Check Script
 * Validates that the environment is properly configured
 */

const fs = require("fs");
const path = require("path");

function loadEnvFile() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return {};

  const envContent = fs.readFileSync(envPath, "utf8");
  const envVars = {};

  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        let value = valueParts.join("=");
        // Remove quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        envVars[key.trim()] = value;
      }
    }
  });

  return envVars;
}

function checkEnvironment() {
  const envVars = loadEnvFile();
  const nodeEnv = envVars.NODE_ENV || process.env.NODE_ENV || "development";
  console.log(`🔍 Checking environment: ${nodeEnv}\n`);

  const checks = [];
  let allGood = true;

  // Check if .env file exists
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) {
    checks.push({
      name: ".env file",
      status: "❌ MISSING",
      message: 'Run "npm run env:setup" to create .env file',
    });
    allGood = false;
  } else {
    checks.push({
      name: ".env file",
      status: "✅ EXISTS",
      message: "Environment file found",
    });
  }

  // Check NODE_ENV
  if (!envVars.NODE_ENV) {
    checks.push({
      name: "NODE_ENV",
      status: "⚠️  NOT SET",
      message: "Will default to development",
    });
  } else {
    checks.push({
      name: "NODE_ENV",
      status: "✅ SET",
      message: `Set to ${nodeEnv}`,
    });
  }

  // Check database URL
  if (!envVars.DATABASE_URL) {
    checks.push({
      name: "DATABASE_URL",
      status: "❌ MISSING",
      message: "Database connection required",
    });
    allGood = false;
  } else {
    checks.push({
      name: "DATABASE_URL",
      status: "✅ SET",
      message: "Database configured",
    });
  }

  // Check Better Auth configuration
  if (!envVars.BETTER_AUTH_SECRET) {
    checks.push({
      name: "BETTER_AUTH_SECRET",
      status: "❌ MISSING",
      message: "Authentication secret required",
    });
    allGood = false;
  } else {
    checks.push({
      name: "BETTER_AUTH_SECRET",
      status: "✅ SET",
      message: "Authentication configured",
    });
  }

  // Environment-specific checks
  if (nodeEnv === "production") {
    // Check API configuration for production
    if (
      !envVars.API_TOKEN ||
      envVars.API_TOKEN === "your-production-api-token"
    ) {
      checks.push({
        name: "API_TOKEN",
        status: "❌ MISSING",
        message: "Production API token required",
      });
      allGood = false;
    } else {
      checks.push({
        name: "API_TOKEN",
        status: "✅ SET",
        message: "API integration enabled",
      });
    }

    if (
      !envVars.API_BASE_URL ||
      envVars.API_BASE_URL === "https://api.skygenesisenterprise.com"
    ) {
      checks.push({
        name: "API_BASE_URL",
        status: "⚠️  DEFAULT",
        message: "Using default API URL",
      });
    } else {
      checks.push({
        name: "API_BASE_URL",
        status: "✅ SET",
        message: "Custom API URL configured",
      });
    }
  } else {
    // Development checks
    if (envVars.API_TOKEN) {
      checks.push({
        name: "API_TOKEN",
        status: "⚠️  SET IN DEV",
        message: "API token set in development (will use mock data)",
      });
    } else {
      checks.push({
        name: "API_TOKEN",
        status: "✅ NOT SET",
        message: "Using mock data (development mode)",
      });
    }
  }

  // Display results
  checks.forEach((check) => {
    console.log(`${check.name.padEnd(20)} ${check.status} - ${check.message}`);
  });

  console.log("\n" + "=".repeat(50));

  if (allGood) {
    console.log("🎉 Environment configuration is valid!");
    console.log(`🚀 Ready to run in ${nodeEnv} mode`);
  } else {
    console.log("❌ Environment configuration has issues");
    console.log('🔧 Run "npm run env:setup" to fix configuration');
    process.exit(1);
  }

  // Additional recommendations
  console.log("\n💡 Recommendations:");
  if (nodeEnv === "development") {
    console.log('   • Use "npm run dev" to start development servers');
    console.log('   • Use "npm run docker:dev" for containerized development');
  } else {
    console.log('   • Use "npm run prod" to build and start production');
    console.log("   • Ensure API_TOKEN is properly configured");
    console.log('   • Use "npm run docker:prod" for containerized production');
  }
}

// Run the check
if (require.main === module) {
  checkEnvironment();
}

module.exports = { checkEnvironment };

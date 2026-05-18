const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// ANSI Escape sequences for premium logging aesthetics
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

// 1. Determine environment and source file
const envFile = process.argv[2] || '.env.vercel';
const targetEnv = process.argv[3] || 'production'; // default to production

const sourcePath = path.resolve(process.cwd(), envFile);

log(colors.bright + colors.blue, `\n=== Vercel Environment Variables Synchronizer ===`);
log(colors.dim, `Source File: ${sourcePath}`);
log(colors.dim, `Target Environment: ${targetEnv}\n`);

// 2. Read and parse the file
if (!fs.existsSync(sourcePath)) {
  log(colors.bright + colors.red, `❌ Error: Env file not found at ${sourcePath}`);
  process.exit(1);
}

const content = fs.readFileSync(sourcePath, 'utf-8');
const lines = content.split(/\r?\n/);
const envVars = [];

for (let line of lines) {
  line = line.trim();
  // Skip comments and empty lines
  if (!line || line.startsWith('#')) {
    continue;
  }

  // Parse KEY=VALUE
  const eqIdx = line.indexOf('=');
  if (eqIdx === -1) continue;

  const key = line.substring(0, eqIdx).trim();
  let value = line.substring(eqIdx + 1).trim();

  // Strip wrapping quotes if any
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.substring(1, value.length - 1);
  }

  if (key) {
    envVars.push({ key, value });
  }
}

if (envVars.length === 0) {
  log(colors.yellow, `⚠️ No environment variables parsed from ${envFile}`);
  process.exit(0);
}

log(colors.green, `Parsed ${envVars.length} environment variables successfully. Starting sync...\n`);

// 3. Verify Vercel link exists
const vercelDir = path.join(process.cwd(), '.vercel');
if (!fs.existsSync(vercelDir)) {
  log(colors.bright + colors.yellow, `⚠️ WARNING: .vercel directory not found. This project might not be linked yet!`);
  log(colors.yellow, `Please run 'vercel link' in this directory first to link it to your Vercel project.`);
  log(colors.yellow, `Once linked, run this script again.\n`);
  process.exit(1);
}

// 4. Sync variables one by one
let successCount = 0;
let failCount = 0;

for (const { key, value } of envVars) {
  // Hide actual values of sensitive variables in log print for privacy/security
  const isSensitive = key.toLowerCase().includes('secret') || key.toLowerCase().includes('key') || key.toLowerCase().includes('token');
  const displayValue = isSensitive ? '********' : value;

  log(colors.cyan, `🔄 Syncing [${key}] = [${displayValue}] to ${targetEnv}...`);

  const args = [
    'env',
    'add',
    key,
    targetEnv,
    '--value',
    value,
    '--yes',
    '--force'
  ];

  // Run vercel command
  const result = spawnSync('vercel', args, { 
    encoding: 'utf-8',
    shell: true // needed on Windows for commands installed globally via npm/pnpm
  });

  if (result.status === 0) {
    log(colors.green, `   ✅ Successfully synced ${key}`);
    successCount++;
  } else {
    log(colors.bright + colors.red, `   ❌ Failed to sync ${key}`);
    if (result.stderr) {
      console.error(colors.dim + result.stderr.trim() + colors.reset);
    }
    failCount++;
  }
}

log(colors.bright + colors.blue, `\n=== Sync Completed ===`);
log(colors.green, `✨ Successfully synced: ${successCount} variables`);
if (failCount > 0) {
  log(colors.red, `❌ Failed to sync: ${failCount} variables`);
}

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');
const envPath = path.join(repoRoot, '.env');
const env = { ...process.env };

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');

    if (key) {
      env[key] = value;
    }
  }
}

const mode = process.argv[2];
const resolvedBaseUrl = env.HUGO_BASEURL
  ? env.HUGO_BASEURL
  : env.VERCEL_URL
    ? `https://${env.VERCEL_URL}/`
    : '';

const run = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

run('npm', ['run', 'build:css']);

if (mode === 'dev') {
  run('hugo', ['server']);
} else {
  const args = [];

  if (resolvedBaseUrl) {
    args.push('--baseURL', resolvedBaseUrl);
  }

  run('hugo', args);
}

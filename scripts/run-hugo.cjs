const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');
const envPath = path.join(repoRoot, '.env');
const env = { ...process.env };
const isWindows = process.platform === 'win32';

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
const quoteWindowsArg = (value) => {
  if (!/[\s"]/u.test(value)) return value;

  return `"${value.replace(/"/gu, '\\"')}"`;
};

const run = (command, args) => {
  const result = spawnSync(
    isWindows ? 'cmd.exe' : command,
    isWindows
      ? ['/d', '/s', '/c', [command, ...args].map(quoteWindowsArg).join(' ')]
      : args,
    {
      cwd: repoRoot,
      env,
      stdio: 'inherit',
    },
  );

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

run(isWindows ? 'npm.cmd' : 'npm', ['run', 'build:css']);

if (mode === 'dev') {
  run(isWindows ? 'hugo.exe' : 'hugo', ['server']);
} else {
  const args = [];

  if (resolvedBaseUrl) {
    args.push('--baseURL', resolvedBaseUrl);
  }

  run(isWindows ? 'hugo.exe' : 'hugo', args);
}

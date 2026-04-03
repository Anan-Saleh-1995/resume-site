const fs = require('node:fs');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');

const createRuntime = (options = {}) => {
  const repoRoot = options.repoRoot ?? path.resolve(__dirname, '..', '..');
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

  if (options.stripLocalhostBaseUrl) {
    const localBaseUrlPattern =
      /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/?$/u;

    if (localBaseUrlPattern.test(env.HUGO_BASEURL ?? '')) {
      delete env.HUGO_BASEURL;
    }
  }

  const quoteWindowsArg = (value) => {
    if (!/[\s"]/u.test(value)) return value;
    return `"${value.replace(/"/gu, '\\"')}"`;
  };

  const spawnCommand = (command, args, extraOptions = {}) =>
    spawn(
      isWindows ? 'cmd.exe' : command,
      isWindows
        ? ['/d', '/s', '/c', [command, ...args].map(quoteWindowsArg).join(' ')]
        : args,
      {
        cwd: repoRoot,
        env,
        stdio: 'inherit',
        shell: false,
        ...extraOptions,
      },
    );

  const spawnCommandSync = (command, args, extraOptions = {}) =>
    spawnSync(
      isWindows ? 'cmd.exe' : command,
      isWindows
        ? ['/d', '/s', '/c', [command, ...args].map(quoteWindowsArg).join(' ')]
        : args,
      {
        cwd: repoRoot,
        env,
        stdio: 'inherit',
        shell: false,
        ...extraOptions,
      },
    );

  return {
    repoRoot,
    envPath,
    env,
    isWindows,
    quoteWindowsArg,
    spawnCommand,
    spawnCommandSync,
    commands: {
      hugo: isWindows ? 'hugo.exe' : 'hugo',
      npm: isWindows ? 'npm.cmd' : 'npm',
      browserSync: isWindows
        ? path.join(repoRoot, 'node_modules', '.bin', 'browser-sync.cmd')
        : path.join(repoRoot, 'node_modules', '.bin', 'browser-sync'),
    },
  };
};

module.exports = { createRuntime };

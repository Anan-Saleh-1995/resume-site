const { createRuntime } = require('./lib/dev-runtime.cjs');
const { findOpenPort } = require('./lib/find-open-port.cjs');

const runtime = createRuntime({ stripLocalhostBaseUrl: true });
const sassArgs = [
  'assets/scss/main.scss',
  'assets/css/main.css',
  '--no-source-map',
  '--watch',
];
let shuttingDown = false;
const children = [];

const spawnProcess = (command, args, name) => {
  const child = runtime.spawnCommand(command, args);

  child.on('exit', (code, signal) => {
    if (shuttingDown) return;

    if (code !== 0) {
      console.error(`${name} exited with code ${code ?? 'unknown'}.`);
      shutdown(code ?? 1);
      return;
    }

    if (signal) {
      console.error(`${name} stopped with signal ${signal}.`);
      shutdown(1);
    }
  });

  children.push(child);
  return child;
};

const shutdown = (code = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGINT');
    }
  }

  process.exit(code);
};

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

const main = async () => {
  const hugoPort = await findOpenPort(1314);
  const browserSyncPort = await findOpenPort(3001);

  console.log(`Hugo port: ${hugoPort}`);
  console.log(`BrowserSync port: ${browserSyncPort}`);

  spawnProcess(runtime.commands.npm, ['run', 'build:css'], 'Initial CSS build');
  spawnProcess(
    runtime.commands.npm,
    ['run', 'build:css', '--', ...sassArgs.slice(3)],
    'Sass watcher',
  );
  spawnProcess(
    runtime.commands.hugo,
    ['server', '--bind', '0.0.0.0', '--port', String(hugoPort)],
    'Hugo server',
  );

  setTimeout(() => {
    spawnProcess(
      runtime.commands.browserSync,
      [
        'start',
        '--proxy',
        `http://127.0.0.1:${hugoPort}`,
        '--host',
        '0.0.0.0',
        '--port',
        String(browserSyncPort),
        '--no-open',
        '--no-ui',
        '--no-notify',
        '--no-ghost-mode',
      ],
      'BrowserSync',
    );
  }, 1500);
};

main().catch((error) => {
  console.error(error.message);
  shutdown(1);
});

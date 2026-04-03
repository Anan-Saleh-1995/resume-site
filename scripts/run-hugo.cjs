const { createRuntime } = require('./lib/dev-runtime.cjs');

const runtime = createRuntime();
const mode = process.argv[2];
const resolvedBaseUrl = runtime.env.HUGO_BASEURL
  ? runtime.env.HUGO_BASEURL
  : runtime.env.VERCEL_URL
    ? `https://${runtime.env.VERCEL_URL}/`
    : '';

const run = (command, args) => {
  const result = runtime.spawnCommandSync(command, args);

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

run(runtime.commands.npm, ['run', 'build:css']);

if (mode === 'dev') {
  run(runtime.commands.hugo, ['server']);
} else {
  const args = [];

  if (resolvedBaseUrl) {
    args.push('--baseURL', resolvedBaseUrl);
  }

  run(runtime.commands.hugo, args);
}

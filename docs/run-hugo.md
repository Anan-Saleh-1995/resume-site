<!-- markdownlint-disable MD024 -->

# `run-hugo.cjs` Explained Slowly

This document explains [run-hugo.cjs](C:\Users\Anan\Desktop\hugo\scripts\run-hugo.cjs) in the smallest practical steps.

The goal is not just to say "what it does", but also:

- what values go in
- what values come out
- what is stored in memory
- what command runs next
- why that command exists

## The real script

```js
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
```

## Short purpose first

This script does 4 jobs:

1. load local environment variables from `.env`
2. decide whether this is:
   - dev mode
   - build mode
3. build CSS first
4. run Hugo with the right arguments

Without this file, that logic would be spread across:

- `package.json`
- shell commands
- manual terminal setup

This file keeps it in one place.

## How this script gets called

From [package.json](C:\Users\Anan\Desktop\hugo\package.json):

```json
"dev": "node scripts/run-hugo.cjs dev",
"build": "node scripts/run-hugo.cjs build"
```

That means:

- `npm run dev` runs:

```bash
node scripts/run-hugo.cjs dev
```

- `npm run build` runs:

```bash
node scripts/run-hugo.cjs build
```

So the script always starts through Node, and then receives one extra word:

- `dev`
- or `build`

That extra word becomes important later.

---

## Line 1

```js
const fs = require('node:fs');
```

### What this means

Load Node's built-in file system module.

### Why

The script needs to:

- check whether `.env` exists
- read the `.env` file

### Input

- nothing from you yet

### Output

- a variable named `fs`
- it contains functions like:
  - `existsSync`
  - `readFileSync`

Think of it as:

```text
fs = "toolbox for reading files"
```

---

## Line 2

```js
const path = require('node:path');
```

### What this means

Load Node's built-in path utility module.

### Why

The script needs to safely build filesystem paths like:

- repo root
- `.env` path

### Output

- a variable named `path`

Think of it as:

```text
path = "toolbox for joining and resolving file paths"
```

---

## Line 3

```js
const { spawnSync } = require('node:child_process');
```

### What this means

Load the `spawnSync` function from Node's child process module.

### Why

This script does not build CSS or run Hugo by itself.
It launches other programs:

- `npm`
- `hugo`
- or on Windows:
  - `npm.cmd`
  - `hugo.exe`
  - `cmd.exe`

### Output

- a function named `spawnSync`

Think of it as:

```text
spawnSync = "run another command, wait until it finishes, then continue"
```

---

## Line 5

```js
const repoRoot = path.resolve(__dirname, '..');
```

### Inputs

- `__dirname`

### What is `__dirname`

In Node, `__dirname` is the directory containing the current script file.

For this file, it is approximately:

```text
C:\Users\Anan\Desktop\hugo\scripts
```

### What `path.resolve(__dirname, '..')` does

It moves one folder up from `scripts`.

So:

```text
C:\Users\Anan\Desktop\hugo\scripts
```

becomes:

```text
C:\Users\Anan\Desktop\hugo
```

### Output

```js
repoRoot = 'C:\\Users\\Anan\\Desktop\\hugo';
```

### Why

Every command should run from the repository root.

That is where these things live:

- `package.json`
- `hugo.toml`
- `content/`
- `layouts/`
- `assets/`

---

## Line 6

```js
const envPath = path.join(repoRoot, '.env');
```

### Input

- `repoRoot`

### What happens

It adds `.env` onto the repo path.

### Output

```js
envPath = 'C:\\Users\\Anan\\Desktop\\hugo\\.env';
```

### Why

The script wants to look for a local environment file.

---

## Line 7

```js
const env = { ...process.env };
```

### What is `process.env`

In Node, `process.env` is an object containing environment variables.

Examples:

```text
PATH
USERPROFILE
APPDATA
HUGO_VERSION
VERCEL_URL
```

### What `{ ...process.env }` does

It copies all current environment variables into a new plain object.

### Output

```js
env = copy of process.env
```

### Why copy it instead of using `process.env` directly

Because the script wants to safely modify the values it passes into child commands without mutating the process-global object.

So think of it like:

```text
process.env = the original environment
env = a working copy the script is allowed to change
```

---

## Line 8

```js
const isWindows = process.platform === 'win32';
```

### What is `process.platform`

It is Node's way of telling you the current operating system.

On Windows:

```js
process.platform === 'win32';
```

is true.

On Linux:

```js
process.platform === 'linux';
```

On macOS:

```js
process.platform === 'darwin';
```

### Output on your machine

```js
isWindows = true;
```

### Why it matters

Because running commands on Windows often needs:

- `cmd.exe`
- `npm.cmd`
- `hugo.exe`

not just:

- `npm`
- `hugo`

---

## The `.env` loading block

```js
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
```

We will break this into tiny parts.

---

## Step A: check whether `.env` exists

```js
fs.existsSync(envPath);
```

### Input

```js
envPath = 'C:\\Users\\Anan\\Desktop\\hugo\\.env';
```

### Output

- `true` if the file exists
- `false` if it does not

### Example on your machine

If you have `.env`, result is:

```js
true;
```

Then the script enters the block.

---

## Step B: read the file into one big string

```js
fs.readFileSync(envPath, 'utf8');
```

### Input

- path to `.env`
- encoding `utf8`

### Example `.env`

```env
HUGO_SHOW_PRIVATE_CONTACT=false
HUGO_VERSION=0.159.1
HUGO_BASEURL=http://localhost:1313/
```

### Output

One big string:

```text
"HUGO_SHOW_PRIVATE_CONTACT=false\nHUGO_VERSION=0.159.1\nHUGO_BASEURL=http://localhost:1313/\n"
```

---

## Step C: split that string into lines

```js
.split(/\r?\n/)
```

### Why that regex

Because different systems may use:

- `\n`
- or `\r\n`

### Output

```js
[
  'HUGO_SHOW_PRIVATE_CONTACT=false',
  'HUGO_VERSION=0.159.1',
  'HUGO_BASEURL=http://localhost:1313/',
  '',
];
```

That final empty string usually comes from the last newline in the file.

---

## Step D: loop through each line

```js
for (const line of lines)
```

This means:

```text
Take one item from the array, call it line, and process it.
Then take the next one.
Repeat until finished.
```

### Example passes

Pass 1:

```js
line = 'HUGO_SHOW_PRIVATE_CONTACT=false';
```

Pass 2:

```js
line = 'HUGO_VERSION=0.159.1';
```

Pass 3:

```js
line = 'HUGO_BASEURL=http://localhost:1313/';
```

Pass 4:

```js
line = '';
```

---

## Step E: trim each line

```js
const trimmed = line.trim();
```

### What `.trim()` does

It removes whitespace at the beginning and end.

### Example

Input:

```js
'  HUGO_VERSION=0.159.1  ';
```

Output:

```js
'HUGO_VERSION=0.159.1';
```

### Why

To avoid problems from accidental spaces.

---

## Step F: skip empty lines and comments

```js
if (!trimmed || trimmed.startsWith('#')) continue;
```

### `!trimmed`

Means:

```text
If trimmed is an empty string, skip it.
```

### `trimmed.startsWith('#')`

Means:

```text
If the line starts with #, treat it as a comment and skip it.
```

### `continue`

Means:

```text
Stop processing this line and jump to the next loop iteration.
```

### Example

Input line:

```env
# local-only setting
```

Output:

```text
This line is ignored.
```

---

## Step G: find the `=` separator

```js
const separatorIndex = trimmed.indexOf('=');
```

### What it does

Finds the position of the first `=` in the string.

### Example

Input:

```js
'HUGO_VERSION=0.159.1';
```

Output:

```js
separatorIndex = 12;
```

because the `=` appears after `HUGO_VERSION`.

### Why this matters

The script needs to split the line into:

- key
- value

---

## Step H: skip lines that do not contain `=`

```js
if (separatorIndex === -1) continue;
```

If no `=` was found:

```js
separatorIndex = -1;
```

Then the line is invalid for this tiny parser, so the script ignores it.

---

## Step I: extract the key

```js
const key = trimmed.slice(0, separatorIndex).trim();
```

### Example

Input:

```js
'HUGO_VERSION=0.159.1';
```

If:

```js
separatorIndex = 12;
```

Then:

```js
trimmed.slice(0, 12);
```

returns:

```js
'HUGO_VERSION';
```

Then `.trim()` runs again just in case.

### Output

```js
key = 'HUGO_VERSION';
```

---

## Step J: extract the raw value

```js
const rawValue = trimmed.slice(separatorIndex + 1).trim();
```

### Example

Input:

```js
'HUGO_VERSION=0.159.1';
```

Then:

```js
trimmed.slice(13);
```

returns:

```js
'0.159.1';
```

### Output

```js
rawValue = '0.159.1';
```

---

## Step K: remove wrapping quotes if they exist

```js
const value = rawValue.replace(/^['"]|['"]$/g, '');
```

### What this regex means

Remove:

- one quote at the start
- or one quote at the end

If present.

### Example 1

Input:

```js
rawValue = '0.159.1';
```

Output:

```js
value = '0.159.1';
```

### Example 2

Input:

```js
rawValue = "'true'";
```

Output:

```js
value = 'true';
```

### Why

So both of these work:

```env
HUGO_SHOW_PRIVATE_CONTACT=true
HUGO_SHOW_PRIVATE_CONTACT="true"
```

---

## Step L: store the value in `env`

```js
if (key) {
  env[key] = value;
}
```

### Example

If:

```js
key = 'HUGO_VERSION';
value = '0.159.1';
```

Then:

```js
env['HUGO_VERSION'] = '0.159.1';
```

After this line, the `env` object now contains that setting.

### Important detail

This does not change the terminal’s real environment.
It only changes the environment object that this script will pass to child commands.

---

## The `mode` line

```js
const mode = process.argv[2];
```

This is one of the most important lines, so here is the smallest explanation possible.

### What is `process.argv`

It is an array.

That array contains:

1. the path to the Node executable
2. the path to the current script
3. any extra arguments passed after the script name

### Example: `npm run dev`

`package.json` says:

```json
"dev": "node scripts/run-hugo.cjs dev"
```

So the actual command that runs is:

```bash
node scripts/run-hugo.cjs dev
```

That makes `process.argv` approximately:

```js
[
  'C:\\Program Files\\nodejs\\node.exe',
  'C:\\Users\\Anan\\Desktop\\hugo\\scripts\\run-hugo.cjs',
  'dev',
];
```

So:

```js
process.argv[0] === 'path to node';
process.argv[1] === 'path to script';
process.argv[2] === 'dev';
```

Then:

```js
const mode = process.argv[2];
```

becomes:

```js
const mode = 'dev';
```

### Example: `npm run build`

`package.json` says:

```json
"build": "node scripts/run-hugo.cjs build"
```

So the actual command becomes:

```bash
node scripts/run-hugo.cjs build
```

That makes:

```js
process.argv[2] === 'build';
```

So:

```js
const mode = 'build';
```

### Example: no extra argument

If you ran:

```bash
node scripts/run-hugo.cjs
```

then:

```js
process.argv[2] === undefined;
```

So:

```js
const mode = undefined;
```

That matters later.

---

## The `resolvedBaseUrl` line

```js
const resolvedBaseUrl = env.HUGO_BASEURL
  ? env.HUGO_BASEURL
  : env.VERCEL_URL
    ? `https://${env.VERCEL_URL}/`
    : '';
```

This is a nested conditional.

It means:

```text
If HUGO_BASEURL exists, use it.
Otherwise, if VERCEL_URL exists, build a full https URL from it.
Otherwise, use an empty string.
```

### Case 1: local `.env`

Input:

```env
HUGO_BASEURL=http://localhost:1313/
```

Then:

```js
env.HUGO_BASEURL === 'http://localhost:1313/';
```

So:

```js
resolvedBaseUrl = 'http://localhost:1313/';
```

### Case 2: Vercel deploy

Input:

```env
VERCEL_URL=resume-site-opal-phi.vercel.app
```

Then:

```js
resolvedBaseUrl = 'https://resume-site-opal-phi.vercel.app/';
```

### Case 3: neither exists

Then:

```js
resolvedBaseUrl = '';
```

That means:

```text
Do not pass --baseURL to Hugo.
Let Hugo use the value from hugo.toml instead.
```

---

## `quoteWindowsArg()`

```js
const quoteWindowsArg = (value) => {
  if (!/[\s"]/u.test(value)) return value;

  return `"${value.replace(/"/gu, '\\"')}"`;
};
```

This helper only matters on Windows.

### What it does

If an argument contains:

- spaces
- or quotes

then it wraps it in quotes and escapes internal quotes.

### Example

Input:

```js
'C:\\Program Files\\something';
```

Output:

```js
"\"C:\\Program Files\\something\"";
```

### Why

Because later the script builds a Windows command string for `cmd.exe`.

Without quoting, Windows would split arguments incorrectly.

---

## The `run()` helper

```js
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
```

This is the heart of the script.

It means:

```text
Run a command.
Wait for it to finish.
Show its output directly in the terminal.
If it fails, stop everything immediately.
```

### Inputs

- `command`
- `args`

### Example call

```js
run('npm.cmd', ['run', 'build:css']);
```

### Windows branch

If:

```js
isWindows === true;
```

then the actual program executed is:

```js
'cmd.exe';
```

and the arguments become something like:

```js
['/d', '/s', '/c', 'npm.cmd run build:css'];
```

Meaning:

```text
Ask cmd.exe to execute the command string "npm.cmd run build:css"
```

### Non-Windows branch

If:

```js
isWindows === false;
```

then it simply runs:

```js
command + args;
```

directly.

### `cwd: repoRoot`

Means:

```text
Pretend the terminal is currently at the repository root.
```

So commands behave as if you ran them from:

```text
C:\Users\Anan\Desktop\hugo
```

### `env`

Means:

```text
Pass the environment object we built earlier, including .env overrides.
```

### `stdio: 'inherit'`

Means:

```text
Show the child command's output directly in the current terminal.
```

That is why when the child process prints logs, you see them immediately.

### `result.error`

If process spawning itself fails, `spawnSync` returns an error object.

Then the script:

1. prints the error message
2. exits with code 1

### `result.status`

This is the child process exit code.

Examples:

- `0` means success
- non-zero means failure

If non-zero, this script exits too.

That means:

```text
If CSS build fails, stop.
If Hugo build fails, stop.
Never continue after a broken step.
```

---

## First real command: build CSS

```js
run(isWindows ? 'npm.cmd' : 'npm', ['run', 'build:css']);
```

### Input

- operating system
- npm script name: `build:css`

### On your machine

Because `isWindows === true`, it becomes:

```text
npm.cmd run build:css
```

### Output

That runs:

```bash
sass assets/scss/main.scss assets/css/main.css --no-source-map
```

and generates:

```text
assets/css/main.css
```

### Why this must happen first

Because Hugo later reads that generated CSS file.

Without this step:

- the site build would miss the latest stylesheet output

---

## Final branch: dev or build

### Branch 1: dev mode

```js
if (mode === 'dev') {
  run(isWindows ? 'hugo.exe' : 'hugo', ['server']);
}
```

If:

```js
mode === 'dev';
```

then on your machine this becomes:

```text
hugo.exe server
```

### Output

- starts Hugo local dev server
- watches content/layout changes
- serves local pages

### Full local dev flow

Input:

```bash
npm run dev
```

Internal trace:

```text
mode = "dev"
load .env
resolve repoRoot
resolve envPath
merge .env into env
resolve resolvedBaseUrl
run npm.cmd run build:css
run hugo.exe server
```

Final output:

```text
local dev server is running
```

---

### Branch 2: build mode

```js
else {
  const args = [];

  if (resolvedBaseUrl) {
    args.push('--baseURL', resolvedBaseUrl);
  }

  run(isWindows ? 'hugo.exe' : 'hugo', args);
}
```

If:

```js
mode !== 'dev';
```

then the script enters this branch.

### Step 1: start with an empty args array

```js
const args = [];
```

Output:

```js
args = [];
```

### Step 2: add `--baseURL` only when one exists

If:

```js
resolvedBaseUrl = 'http://localhost:1313/';
```

then:

```js
args.push('--baseURL', resolvedBaseUrl);
```

changes:

```js
args = [];
```

into:

```js
args = ['--baseURL', 'http://localhost:1313/'];
```

If `resolvedBaseUrl` is empty, then `args` stays:

```js
[];
```

### Step 3: run Hugo build

On your machine:

- if args is empty:

```text
hugo.exe
```

- if args contains baseURL:

```text
hugo.exe --baseURL http://localhost:1313/
```

### Full build flow

Input:

```bash
npm run build
```

Internal trace:

```text
mode = "build"
load .env
resolve repoRoot
resolve envPath
merge .env into env
resolve resolvedBaseUrl
run npm.cmd run build:css
create args array
if resolvedBaseUrl exists, add --baseURL and its value
run hugo.exe with those args
```

Final output:

```text
site is built into public/
```

---

## Fake debugger-style examples

## Example 1: `npm run dev`

Assume `.env` contains:

```env
HUGO_SHOW_PRIVATE_CONTACT=true
HUGO_BASEURL=http://localhost:1313/
HUGO_VERSION=0.159.1
```

Think of the script as if it logged this:

```text
[start]
process.argv = [
  "C:\\Program Files\\nodejs\\node.exe",
  "C:\\Users\\Anan\\Desktop\\hugo\\scripts\\run-hugo.cjs",
  "dev"
]

[paths]
repoRoot = C:\Users\Anan\Desktop\hugo
envPath = C:\Users\Anan\Desktop\hugo\.env

[env]
copied process.env into env
loaded .env
env.HUGO_SHOW_PRIVATE_CONTACT = "true"
env.HUGO_BASEURL = "http://localhost:1313/"
env.HUGO_VERSION = "0.159.1"

[mode]
mode = "dev"

[baseURL]
resolvedBaseUrl = "http://localhost:1313/"

[run]
npm.cmd run build:css

[output]
assets/css/main.css generated

[run]
hugo.exe server

[output]
local dev server started
```

---

## Example 2: `npm run build`

Assume `.env` contains:

```env
HUGO_SHOW_PRIVATE_CONTACT=false
HUGO_BASEURL=http://localhost:1313/
HUGO_VERSION=0.159.1
```

Think of the script as if it logged this:

```text
[start]
process.argv = [
  "C:\\Program Files\\nodejs\\node.exe",
  "C:\\Users\\Anan\\Desktop\\hugo\\scripts\\run-hugo.cjs",
  "build"
]

[paths]
repoRoot = C:\Users\Anan\Desktop\hugo
envPath = C:\Users\Anan\Desktop\hugo\.env

[env]
copied process.env into env
loaded .env
env.HUGO_SHOW_PRIVATE_CONTACT = "false"
env.HUGO_BASEURL = "http://localhost:1313/"
env.HUGO_VERSION = "0.159.1"

[mode]
mode = "build"

[baseURL]
resolvedBaseUrl = "http://localhost:1313/"

[run]
npm.cmd run build:css

[output]
assets/css/main.css generated

[args]
args = ["--baseURL", "http://localhost:1313/"]

[run]
hugo.exe --baseURL http://localhost:1313/

[output]
public/ generated
```

---

## Example 3: Vercel build

Assume:

- there is no local `.env`
- Vercel provides:
  - `VERCEL_URL=resume-site-opal-phi.vercel.app`
- Vercel env also provides:
  - `HUGO_SHOW_PRIVATE_CONTACT=false`
  - `HUGO_VERSION=0.159.1`

Then the internal trace looks more like:

```text
[start]
process.argv = [
  "/node",
  "/vercel/path0/scripts/run-hugo.cjs",
  "build"
]

[env]
copied process.env into env
no local .env file loaded
env.VERCEL_URL = "resume-site-opal-phi.vercel.app"
env.HUGO_SHOW_PRIVATE_CONTACT = "false"

[mode]
mode = "build"

[baseURL]
resolvedBaseUrl = "https://resume-site-opal-phi.vercel.app/"

[run]
npm run build:css

[run]
hugo --baseURL https://resume-site-opal-phi.vercel.app/

[output]
public/ generated for the deployed domain
```

---

## Smallest possible mental model

This script is basically:

```text
read .env
decide dev or build
build CSS
run Hugo with the right URL
stop immediately if anything fails
```

That is all.

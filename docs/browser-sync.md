# BrowserSync Notes

This repo uses BrowserSync for real-phone preview during mobile debugging, especially for iPhone/iOS issues that do not show up in desktop emulation.

## Basic BrowserSync Example

If you already have a local server running on port `1313`, the simplest BrowserSync usage is:

```bash
npx browser-sync start --proxy http://127.0.0.1:1313 --port 3000
```

That gives you a second URL, usually on port `3000`, which you can open from another device on the same network.

For a plain static folder, a minimal example is:

```bash
npx browser-sync start --server . --port 3000
```

## What Was Added In This Repo

Files:

- `package.json`
- `package-lock.json`
- `scripts/mobile-preview.cjs`

Script:

```bash
npm run dev:mobile
```

What `dev:mobile` does:

1. builds CSS once
2. starts the Sass watcher
3. starts `hugo server`
4. starts BrowserSync as a proxy in front of Hugo

## Why This Repo Needed More Than The Basic Example

A one-line BrowserSync command was not enough here for a few reasons:

### 1. Hugo already owns the actual site rendering

This repo is not a static HTML folder. Hugo generates the pages, handles language routes such as `/en/` and `/he/`, and rebuilds on content/template changes.

BrowserSync should not replace Hugo here. It should sit in front of Hugo and expose a LAN-friendly mobile URL.

### 2. Sass needs to rebuild alongside Hugo

The site CSS is compiled from:

```text
assets/scss/main.scss
```

So mobile preview needed both:

- Hugo watching templates/content
- Sass watching stylesheet changes

Without that, phone testing would lag behind local edits.

### 3. `.env` settings matter, but localhost base URLs break phones

This repo uses `.env` for Hugo-related settings such as:

```text
HUGO_SHOW_PRIVATE_CONTACT=true
HUGO_BASEURL=http://localhost:1313/
```

For mobile testing, `localhost` is wrong because on a phone `localhost` means the phone itself, not the development machine.

So the custom runner loads `.env`, but deliberately ignores localhost-style `HUGO_BASEURL` values in mobile mode.

### 4. Port conflicts were common during local testing

While debugging, older `hugo server` processes were sometimes still running. The mobile runner was adjusted to search for open ports instead of assuming `1313` and `3000` were always free.

That avoids brittle startup failures and makes repeated testing easier.

## Current Workflow

Run:

```bash
npm run dev:mobile
```

The script prints the selected Hugo and BrowserSync ports. Open the BrowserSync URL from your phone on the same Wi-Fi network, using your computer's LAN IP.

Example:

```text
http://10.0.0.9:3001
```

## Full Command And Output Walkthrough

This section shows what you type, what starts, and what the terminal output means.

### Input

```bash
npm run dev:mobile
```

### What `npm` does

`package.json` maps that command to:

```bash
node scripts/mobile-preview.cjs
```

So the actual process flow starts in:

```text
scripts/mobile-preview.cjs
```

### What the script does internally

In order:

1. loads `.env`
2. removes `HUGO_BASEURL` if it points to `localhost` or `127.0.0.1`
3. finds a free Hugo port starting from `1314`
4. finds a free BrowserSync port starting from `3001`
5. runs one CSS build
6. starts the Sass watcher
7. starts `hugo server`
8. starts BrowserSync as a proxy in front of Hugo

### Typical startup output

Example:

```text
> hugo@1.0.0 dev:mobile
> node scripts/mobile-preview.cjs

Hugo port: 1314
BrowserSync port: 3001

> hugo@1.0.0 build:css
> sass assets/scss/main.scss assets/css/main.css --no-source-map

> hugo@1.0.0 build:css
> sass assets/scss/main.scss assets/css/main.css --no-source-map --watch

Watching for changes in C:/Users/Anan/Desktop/github/hugo/archetypes, C:/Users/Anan/Desktop/github/hugo/assets/{css,js,scss}, C:/Users/Anan/Desktop/github/hugo/content/en, C:/Users/Anan/Desktop/github/hugo/content/he, C:/Users/Anan/Desktop/github/hugo/data/resumes, C:/Users/Anan/Desktop/github/hugo/i18n, C:/Users/Anan/Desktop/github/hugo/layouts/{_default,partials}, C:/Users/Anan/Desktop/github/hugo/package.json, C:/Users/Anan/Desktop/github/hugo/static
Watching for config changes in C:\Users\Anan\Desktop\github\hugo\hugo.toml
Start building sites …
hugo v0.159.1-86c7d3afacab79dc53325602d77ef884b7570268 windows/amd64 BuildDate=2026-03-26T09:54:15Z VendorInfo=gohugoio

                  │ EN │ HE
──────────────────┼────┼────
 Pages            │  6 │  5
 Paginator pages  │  0 │  0
 Non-page files   │  0 │  0
 Static files     │  1 │  1
 Processed images │  0 │  0
 Aliases          │  1 │  0
 Cleaned          │  0 │  0

Built in 110 ms
Environment: "development"
Serving pages from disk
Running in Fast Render Mode. For full rebuilds on change: hugo server --disableFastRender
Web Server is available at http://localhost:1314/ (bind address 0.0.0.0)
Press Ctrl+C to stop

Sass is watching for changes. Press Ctrl-C to stop.

[Browsersync] Proxying: http://127.0.0.1:1314
[Browsersync] Access URLs:
 -------------------------------
    Local: http://localhost:3001
 External: http://0.0.0.0:3001
 -------------------------------
```

### Line-by-line explanation

```text
> hugo@1.0.0 dev:mobile
```

`npm` is starting the `dev:mobile` script from `package.json`.

```text
> node scripts/mobile-preview.cjs
```

Node is running the custom mobile preview script.

```text
Hugo port: 1314
BrowserSync port: 3001
```

The script found open ports and chose them for this run.

```text
> hugo@1.0.0 build:css
> sass assets/scss/main.scss assets/css/main.css --no-source-map
```

This is the one-time CSS build so the site has current styles before live preview starts.

```text
> hugo@1.0.0 build:css
> sass assets/scss/main.scss assets/css/main.css --no-source-map --watch
```

This is the long-running Sass watcher. It rebuilds CSS whenever SCSS changes.

```text
Watching for changes in ...
Watching for config changes in ...
```

These lines come from Hugo. Hugo is now watching content, templates, config, and static assets.

```text
Start building sites …
```

Hugo is doing the first render.

```text
hugo v0.159.1-...
```

Hugo version and build metadata.

```text
                  │ EN │ HE
──────────────────┼────┼────
 Pages            │  6 │  5
 ...
```

Hugo build summary for both language versions of the resume site.

```text
Built in 110 ms
Environment: "development"
Serving pages from disk
```

The initial site build completed and Hugo is serving the generated output locally.

```text
Web Server is available at http://localhost:1314/ (bind address 0.0.0.0)
```

Hugo itself is listening on port `1314`. The `0.0.0.0` bind means other devices on the same network can potentially reach it.

```text
Sass is watching for changes. Press Ctrl-C to stop.
```

SCSS live compilation is active.

```text
[Browsersync] Proxying: http://127.0.0.1:1314
```

BrowserSync sits in front of Hugo and forwards requests to Hugo's local server.

```text
[Browsersync] Access URLs:
```

BrowserSync is printing its own entry points.

```text
Local: http://localhost:3001
```

This is the BrowserSync URL on the same machine.

```text
External: http://0.0.0.0:3001
```

This means BrowserSync is listening on all interfaces. In practice, on your phone you should open your machine's LAN IP with the same port, for example:

```text
http://10.0.0.9:3001
```

### What happens after a file change

If you edit SCSS, template, content, or data files, you will usually see output like:

```text
Change detected, rebuilding site (#1).
2026-04-03 08:47:43.046 +0300
Asset changed /css/main.css
Web Server is available at http://localhost:1314/ (bind address 0.0.0.0)
Total in 3 ms
```

Meaning:

1. Hugo detected a file change
2. Hugo rebuilt the relevant pages
3. the CSS asset changed
4. the local site is still being served on the same Hugo port

BrowserSync then refreshes the phone/browser session against the proxy URL.

### The URLs You Actually Use

For local desktop checking:

```text
http://localhost:3001
```

For phone testing on the same Wi-Fi:

```text
http://10.0.0.9:3001
```

Replace `10.0.0.9` with the current LAN IPv4 address of the development machine.

### Why The Output Matters

The output tells you exactly which layer is running:

- Sass output means CSS compilation is alive
- Hugo output means the site renderer is alive
- BrowserSync output means the mobile proxy is alive

If one of those is missing, you know which part failed.

## Code Walkthrough

This section explains `scripts/mobile-preview.cjs` from top to bottom so you can understand what each part of the code is doing and what visible effect it has.

### 1. Imports

Code:

```js
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
```

What goes in:

- built-in Node modules

Example output values after these imports are used later:

```text
fs -> used to read .env
path -> used to build paths like docs/browser-sync.md and scripts/mobile-preview.cjs
net -> used to test ports like 1314 and 3001
spawn -> used to start npm.cmd, hugo.exe, and browser-sync.cmd
```

Why it exists:

- `fs` reads `.env`
- `path` builds safe file paths
- `net` checks whether ports are available
- `spawn` starts Sass, Hugo, and BrowserSync

### 2. Path and command setup

Code:

```js
const repoRoot = path.resolve(__dirname, '..');
const envPath = path.join(repoRoot, '.env');
const env = { ...process.env };
const isWindows = process.platform === 'win32';
const hugoCommand = isWindows ? 'hugo.exe' : 'hugo';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const browserSyncCommand = isWindows
  ? path.join(repoRoot, 'node_modules', '.bin', 'browser-sync.cmd')
  : path.join(repoRoot, 'node_modules', '.bin', 'browser-sync');
```

Input:

- current script location
- current OS
- current shell environment

Example resolved values on Windows:

```text
repoRoot = C:\...\github\hugo
envPath = C:\...\github\hugo\.env
isWindows = true
hugoCommand = hugo.exe
npmCommand = npm.cmd
browserSyncCommand = C:\...\github\hugo\node_modules\.bin\browser-sync.cmd
```

Why it exists:

- the script must work from the repo root
- Windows needs `npm.cmd` and `browser-sync.cmd`
- BrowserSync is installed locally in `node_modules/.bin`

### 3. Sass arguments and process state

Code:

```js
const sassArgs = [
  'assets/scss/main.scss',
  'assets/css/main.css',
  '--no-source-map',
  '--watch',
];
let shuttingDown = false;
const children = [];
```

Input:

- source SCSS path
- output CSS path

Example runtime values:

```text
sassArgs[0] = assets/scss/main.scss
sassArgs[1] = assets/css/main.css
sassArgs[2] = --no-source-map
sassArgs[3] = --watch
shuttingDown = false
children = []
```

Why it exists:

- Sass needs one stable command definition
- the script needs to keep track of spawned processes so it can stop them cleanly

### 4. Load `.env`

Code shape:

```js
if (fs.existsSync(envPath)) {
  // read lines
  // ignore blanks and comments
  // split KEY=VALUE
  // store into env
}
```

Input:

- `.env` file

Example `.env` input:

```text
HUGO_SHOW_PRIVATE_CONTACT=true
HUGO_VERSION=0.159.1
HUGO_BASEURL=http://localhost:1313/
```

Example `env` values after loading:

```text
env.HUGO_SHOW_PRIVATE_CONTACT = true
env.HUGO_VERSION = 0.159.1
env.HUGO_BASEURL = http://localhost:1313/
```

Why it exists:

- local Hugo settings such as `HUGO_SHOW_PRIVATE_CONTACT` should still work in mobile mode

### 5. Remove bad localhost base URLs for phone testing

Code:

```js
if (
  /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/?$/u.test(
    env.HUGO_BASEURL ?? '',
  )
) {
  delete env.HUGO_BASEURL;
}
```

Input:

- `env.HUGO_BASEURL`

Example before:

```text
env.HUGO_BASEURL = http://localhost:1313/
```

Example after:

```text
env.HUGO_BASEURL = undefined
```

Why it exists:

- on a phone, `localhost` points to the phone itself
- leaving `HUGO_BASEURL=http://localhost:1313/` in place can produce wrong absolute URLs for mobile devices

### 6. Quote Windows arguments safely

Code:

```js
const quoteWindowsArg = (value) => {
  if (!/[\s"]/u.test(value)) return value;
  return `"${value.replace(/"/gu, '\\"')}"`;
};
```

Input:

- a command argument

Example input/output:

```text
input  = C:\Program Files\Some Tool\tool.exe
output = "C:\Program Files\Some Tool\tool.exe"
```

Why it exists:

- paths and arguments with spaces break easily on Windows if they are not quoted correctly

### 7. Find an open port

Code shape:

```js
const findOpenPort = (startPort) =>
  new Promise((resolve, reject) => {
    const tryPort = (port) => {
      const server = net.createServer();
      server.listen(port, '0.0.0.0', () => {
        server.close(() => resolve(port));
      });
      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          tryPort(port + 1);
          return;
        }
        reject(error);
      });
    };
    tryPort(startPort);
  });
```

Input:

- starting port, such as `1314` or `3001`

Example input/output:

```text
findOpenPort(1314) -> 1314
findOpenPort(3001) -> 3001
```

If the first port is busy:

```text
findOpenPort(1314) -> 1315
```

Why it exists:

- old Hugo or BrowserSync processes may still be running
- the script should recover automatically instead of failing on the first busy port

Visible result in terminal:

```text
Hugo port: 1314
BrowserSync port: 3001
```

#### What `tryPort(startPort);` is doing exactly

The part that usually looks confusing is this shape:

```js
const findOpenPort = (startPort) =>
  new Promise((resolve, reject) => {
    const tryPort = (port) => {
      // test the port
    };

    tryPort(startPort);
  });
```

What is happening, bit by bit:

1. `findOpenPort(1314)` is called.
2. JavaScript immediately creates a new `Promise`.
3. When that `Promise` is created, JavaScript calls the function inside it right away:

```js
(resolve, reject) => {
  ...
}
```

1. `resolve` and `reject` are functions provided by JavaScript itself for that specific promise.
2. Inside that function, `tryPort` is defined.
3. `tryPort(startPort)` runs immediately, so with `findOpenPort(1314)` it becomes:

```js
tryPort(1314);
```

1. `tryPort(1314)` creates a temporary server and tries to listen on port `1314`.
2. One of two things happens next:

- if port `1314` is free, the `listen` callback runs, the temporary server closes, and `resolve(1314)` is called
- if port `1314` is busy, the `error` callback runs with `EADDRINUSE`, and `tryPort(1315)` is called

So the promise is not magically checking ports by itself. The promise is just waiting until your code eventually calls either:

```js
resolve(freePort);
```

or

```js
reject(error);
```

#### Is the first `tryPort(startPort)` call recursive?

No. The first call is a normal function call, not a recursive one.

This line:

```js
tryPort(startPort);
```

means:

```text
run tryPort once with the starting port
```

If `startPort` is `1314`, then the real first call is:

```js
tryPort(1314);
```

That first call is just the entry point. It is the same as calling any normal function for the first time.

Recursion only starts later if `tryPort` calls itself from inside its own body:

```js
tryPort(port + 1);
```

So these are different:

Initial call:

```js
tryPort(1314);
```

Recursive call:

```js
tryPort(1315);
```

The first one starts the process.
The later ones continue the process if the current port is busy.

#### Exact timeline of the first call

Suppose this line runs:

```js
tryPort(startPort);
```

and `startPort` is `1314`.

The exact meaning is:

```text
1. look up the current value of startPort
2. the value is 1314
3. call tryPort with that value
4. inside tryPort, port is now 1314
```

So:

```js
tryPort(startPort);
```

becomes:

```js
tryPort(1314);
```

and inside the function:

```js
const tryPort = (port) => {
  // here, port === 1314
};
```

#### When does it become recursive?

It becomes recursive only if this path is reached:

```js
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    tryPort(port + 1);
    return;
  }

  reject(error);
});
```

That means:

```text
1. tryPort(1314) is already running
2. it tries to listen on port 1314
3. Node reports "that port is already in use"
4. the code runs tryPort(1315)
5. that new call came from inside tryPort itself
6. now it is recursion
```

So recursion does not happen at the beginning.
Recursion happens only after the first attempt fails because the port is occupied.

#### Full example: no recursion needed

Input:

```js
await findOpenPort(1314);
```

Exact flow:

```text
1. findOpenPort(1314) starts
2. Promise executor runs
3. tryPort is defined
4. tryPort(1314) is called
5. port 1314 is free
6. resolve(1314) is called
7. Promise completes
8. await returns 1314
```

Important detail:

```text
there was only one tryPort call
```

So in this case, there was no recursion at all.

#### Full example: recursion happens once

Input:

```js
await findOpenPort(1314);
```

Exact flow:

```text
1. findOpenPort(1314) starts
2. Promise executor runs
3. tryPort is defined
4. tryPort(1314) is called
5. port 1314 is busy
6. tryPort(1315) is called from inside tryPort
7. port 1315 is free
8. resolve(1315) is called
9. Promise completes
10. await returns 1315
```

Important detail:

```text
the first call was normal
the second call was recursive
```

#### Full example: recursion happens multiple times

Input:

```js
await findOpenPort(1314);
```

Exact flow:

```text
1. tryPort(1314) -> busy
2. tryPort(1315) -> busy
3. tryPort(1316) -> busy
4. tryPort(1317) -> free
5. resolve(1317)
6. await returns 1317
```

Important detail:

```text
only calls 2, 3, and 4 are recursive calls
call 1 is still just the first normal call
```

#### Simple mental model

You can think of it like this:

```text
first call = knock on the first door
recursive call = move to the next door if this one is occupied
```

In port form:

```text
first call:
tryPort(1314)

if busy:
tryPort(1315)

if busy again:
tryPort(1316)

if busy again:
tryPort(1317)
```

So the behavior is:

```text
start once normally
repeat only when needed
stop as soon as one port works
```

#### Exact control flow with a free port

Input:

```js
await findOpenPort(1314);
```

Exact flow:

```text
findOpenPort(1314)
-> create Promise
-> JavaScript calls the Promise executor with resolve and reject
-> define tryPort(port)
-> call tryPort(1314)
-> create temporary server
-> server.listen(1314, '0.0.0.0', callback)
-> port is free
-> callback runs
-> server.address() returns 1314
-> server.close(...)
-> resolve(1314)
-> Promise finishes successfully
-> await returns 1314
```

Final result:

```text
hugoPort = 1314
```

#### Exact control flow with a busy port

Input:

```js
await findOpenPort(1314);
```

Exact flow:

```text
findOpenPort(1314)
-> create Promise
-> define tryPort(port)
-> call tryPort(1314)
-> create temporary server
-> server.listen(1314, '0.0.0.0', callback)
-> port 1314 is already taken
-> error event fires
-> error.code === 'EADDRINUSE'
-> call tryPort(1315)
-> create a new temporary server
-> server.listen(1315, '0.0.0.0', callback)
-> port 1315 is free
-> callback runs
-> server.close(...)
-> resolve(1315)
-> Promise finishes successfully
-> await returns 1315
```

Final result:

```text
hugoPort = 1315
```

#### Where `resolve` is actually called

It happens here:

```js
server.close(() => resolve(freePort));
```

Meaning:

1. the port worked
2. the temporary server is no longer needed
3. close the temporary server
4. after it closes, finish the promise with the free port

That value becomes the result of:

```js
await findOpenPort(1314);
```

#### Where `reject` is actually called

It happens only for errors that are not "port already in use":

```js
reject(error);
```

Meaning:

- if the port is busy, keep trying the next one
- if some other networking error happens, stop and fail

#### Why recursion is used here

This line:

```js
tryPort(port + 1);
```

just means:

```text
this port did not work, so try the next port
```

So the function keeps walking upward:

```text
1314 -> 1315 -> 1316 -> ...
```

until one works and calls `resolve(...)`.

### 8. Spawn a child process

Code shape:

```js
const spawnProcess = (command, args, name) => {
  const child = spawn(...);
  child.on('exit', ...);
  children.push(child);
  return child;
};
```

Input:

- command
- args
- human-readable process name

Example input:

```text
command = npm.cmd
args = [run, build:css]
name = Initial CSS build
```

Example effect:

```text
children[0] = ChildProcess for npm.cmd run build:css
```

Why it exists:

- all subprocess startup is handled in one place
- failures are detected centrally
- cleanup becomes simpler

### 9. Shutdown handling

Code shape:

```js
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
```

Input:

- Ctrl+C
- process failure

Example visible effect:

```text
Ctrl+C
-> Sass watcher stops
-> Hugo server stops
-> BrowserSync stops
-> node process exits
```

Why it exists:

- without this, Sass, Hugo, or BrowserSync could be left running in the background

### 10. Main flow

Code shape:

```js
const main = async () => {
  const hugoPort = await findOpenPort(1314);
  const browserSyncPort = await findOpenPort(3001);

  console.log(`Hugo port: ${hugoPort}`);
  console.log(`BrowserSync port: ${browserSyncPort}`);

  spawnProcess(npmCommand, ['run', 'build:css'], 'Initial CSS build');
  spawnProcess(
    npmCommand,
    ['run', 'build:css', '--', ...sassArgs.slice(3)],
    'Sass watcher',
  );
  spawnProcess(
    hugoCommand,
    ['server', '--bind', '0.0.0.0', '--port', String(hugoPort)],
    'Hugo server',
  );

  setTimeout(() => {
    spawnProcess(
      browserSyncCommand,
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
```

Input:

- free ports
- local executables
- local source files

Example visible output:

```text
Hugo port: 1314
BrowserSync port: 3001

> hugo@1.0.0 build:css
> sass assets/scss/main.scss assets/css/main.css --no-source-map

> hugo@1.0.0 build:css
> sass assets/scss/main.scss assets/css/main.css --no-source-map --watch

Web Server is available at http://localhost:1314/ (bind address 0.0.0.0)
[Browsersync] Proxying: http://127.0.0.1:1314
    Local: http://localhost:3001
 External: http://0.0.0.0:3001
```

Why each line exists:

1. `findOpenPort(1314)`:
   avoids colliding with old Hugo sessions on `1313`
2. `findOpenPort(3001)`:
   avoids colliding with old BrowserSync sessions on `3000`
3. `console.log(...)`:
   prints the ports so you know which URLs to use
4. `npm run build:css`:
   ensures CSS exists before the site is served
5. second `build:css` with `--watch`:
   keeps CSS updated after edits
6. `hugo server --bind 0.0.0.0`:
   serves the site and allows LAN access
7. `setTimeout(...1500)`:
   gives Hugo a moment to start before BrowserSync tries to proxy it
8. BrowserSync `--proxy http://127.0.0.1:${hugoPort}`:
   tells BrowserSync to forward all requests to Hugo
9. BrowserSync `--host 0.0.0.0`:
   allows access from the phone
10. BrowserSync `--no-open --no-ui --no-notify --no-ghost-mode`:
    keeps the setup minimal for debugging

### 11. Final error handling

Code:

```js
main().catch((error) => {
  console.error(error.message);
  shutdown(1);
});
```

Input:

- any uncaught startup error

Example visible output:

```text
ERROR command error: server startup failed: listen tcp 0.0.0.0:1313: bind: Only one usage of each socket address (protocol/network address/port) is normally permitted.
Hugo server exited with code 1.
```

Why it exists:

- async startup failures should not leave half-started processes running

### End-to-end summary

Literal input:

```bash
npm run dev:mobile
```

Literal code path:

```text
package.json
-> node scripts/mobile-preview.cjs
-> load .env
-> strip localhost HUGO_BASEURL if needed
-> find free ports
-> build CSS
-> start Sass watch
-> start Hugo server
-> start BrowserSync proxy
```

Literal useful output:

```text
Hugo port: 1314
BrowserSync port: 3001
[Browsersync] Proxying: http://127.0.0.1:1314
Local: http://localhost:3001
```

Real phone URL:

```text
http://10.0.0.9:3001
```

## Why BrowserSync Was Useful Here

Desktop mobile emulation was not enough for this bug. The rendering issue appeared on mobile WebKit behavior, especially with mixed Hebrew and English text. BrowserSync made it easy to test the real page from an actual phone without deploying every change.

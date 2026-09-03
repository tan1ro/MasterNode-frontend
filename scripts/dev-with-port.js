const { connect, createServer } = require("net");
const { spawn } = require("child_process");
const path = require("path");

const START_PORT = Number(process.env.PORT) || 3000;
const MAX_ATTEMPTS = 20;
const PROBE_HOSTS = ["127.0.0.1", "::1"];
const PROBE_TIMEOUT_MS = 400;

function isPortListening(port, host) {
  return new Promise((resolve) => {
    const socket = connect({ port, host });
    socket.setTimeout(PROBE_TIMEOUT_MS);

    const finish = (listening) => {
      socket.destroy();
      resolve(listening);
    };

    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", (error) => {
      finish(error.code !== "ECONNREFUSED");
    });
  });
}

function canBindPort(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.unref();
    server.once("error", () => resolve(false));
    server.listen({ port, host: "0.0.0.0" }, () => {
      server.close(() => resolve(true));
    });
  });
}

async function isPortAvailable(port) {
  for (const host of PROBE_HOSTS) {
    if (await isPortListening(port, host)) {
      return false;
    }
  }

  return canBindPort(port);
}

async function findAvailablePort(startPort) {
  for (let offset = 0; offset < MAX_ATTEMPTS; offset++) {
    const port = startPort + offset;
    if (await isPortAvailable(port)) {
      return port;
    }
  }

  throw new Error(
    `No free port found in range ${startPort}-${startPort + MAX_ATTEMPTS - 1}`,
  );
}

async function main() {
  const port = await findAvailablePort(START_PORT);

  if (port !== START_PORT) {
    console.log(
      `Port ${START_PORT} is unavailable, starting dev server on ${port}.`,
    );
  }

  const nextBin = require.resolve("next/dist/bin/next");
  const child = spawn(process.execPath, [nextBin, "dev", "-p", String(port)], {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const args = new Set(process.argv.slice(2));
const runBackend = args.size === 0 || args.has("--backend");
const runFrontend = args.size === 0 || args.has("--frontend");

const processes = [];

const run = (label, cwd, command, commandArgs) => {
  const child = spawn(command, commandArgs, {
    cwd,
    shell: true,
    stdio: "inherit",
  });

  child.on("exit", (code) => {
    if (typeof code === "number" && code !== 0) {
      process.exitCode = code;
    }
  });

  processes.push({ label, child });
};

if (runBackend) {
  run("backend", path.join(repoRoot, "backend"), "npm", ["run", "dev"]);
}

if (runFrontend) {
  run("frontend", path.join(repoRoot, "frontend"), "npm", ["run", "dev"]);
}

const shutdown = (signal) => {
  for (const { child } of processes) {
    child.kill(signal);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));


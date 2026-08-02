/* global process */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");

const results = [];

function runStep(name, cmd) {
    process.stdout.write(`\n▶ ${name}...\n`);
    try {
        const output = execSync(cmd, { cwd: webRoot, stdio: "inherit" });
        results.push({ name, pass: true, output: String(output) });
        process.stdout.write(`✔ ${name} PASS\n`);
    } catch (error) {
        results.push({ name, pass: false, output: String(error.stderr || error.message) });
        process.stdout.write(`✘ ${name} FAIL\n`);
    }
}

runStep("ESLint (npm run lint)", "npm run lint");
runStep("Build production (npm run build)", "npm run build");

const failed = results.filter((r) => !r.pass);
process.stdout.write("\n===== TỔNG KẾT SMOKE TEST WEB =====\n");
results.forEach((r) => process.stdout.write(`${r.pass ? "PASS" : "FAIL"}  ${r.name}\n`));
process.stdout.write(`\n${results.length - failed.length}/${results.length} bước thành công\n`);

process.exit(failed.length > 0 ? 1 : 0);

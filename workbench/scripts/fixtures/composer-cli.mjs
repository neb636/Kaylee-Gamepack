// Deterministic interactive CLI fixture for Electron composer QA; no model calls.
import { appendFileSync } from "node:fs";
import { setTimeout } from "node:timers";

process.stdin.setRawMode(true);
process.stdin.setEncoding("utf8");
const screen = (text) => process.stdout.write(`\x1b[2J\x1b[H\x1b[?2004h${text}`);
const ready = () => screen("ERROR: Connection refused\r\n› ");
let pending = "";
let prompt = "";
let model = "";
let effort = "";
ready();
process.stdin.on("data", (data) => {
  if (data === "\x03") { pending = ""; prompt = ""; ready(); return; }
  pending += data;
  if (pending.startsWith("/model ") && !pending.includes("\x1b[200~")) {
    if (!pending.includes("\r")) { screen(`› ${pending}`); return; }
    const match = pending.match(/^\/model (\S+) --reasoning=(\S+)\r$/);
    pending = "";
    if (match) { model = match[1]; effort = match[2]; screen(`• Model changed to ${model} ${effort} for this session only\r\n› `); }
    return;
  }
  if (pending === "/plan ") screen("› /plan ");
  const start = pending.indexOf("\x1b[200~");
  const end = pending.indexOf("\x1b[201~");
  if (start >= 0 && end >= start) {
    prompt = pending.slice(0, start) + pending.slice(start + 6, end);
    pending = pending.slice(end + 6);
    screen("› pasted draft");
  }
  if (pending.includes("\r") && prompt) {
    appendFileSync(process.env.COMPOSER_QA_LOG, JSON.stringify({ prompt, model, effort, cwd: process.cwd() }) + "\n");
    const sent = prompt;
    pending = ""; prompt = "";
    setTimeout(() => {
      if (sent.includes("UNCERTAIN")) screen("Do you want to proceed?\r\n› Yes, proceed");
      else ready();
    }, 700);
  }
});

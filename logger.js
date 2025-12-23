/**
 * logger.js — logger simples (console + logs/bot.log)
 */

const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "logs");
const LOG_FILE = path.join(LOG_DIR, "bot.log");

function ensureLogFile() {
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
    if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, "");
  } catch (e) {
    // se falhar, pelo menos não quebra o robô
    console.log("⚠ logger: não consegui criar pasta/arquivo de log:", e.message);
  }
}

function safeStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch {
    return String(obj);
  }
}

function logEvent(event, data = {}) {
  ensureLogFile();
  const line = `${new Date().toISOString()} | ${event} | ${safeStringify(data)}\n`;
  try {
    fs.appendFileSync(LOG_FILE, line, "utf8");
  } catch (e) {
    console.log("⚠ logger: falha ao escrever no log:", e.message);
  }
  // também mostra no console (pra você ver ao vivo)
  if (event === "pair_error" || event.includes("error")) {
    console.log(`⚠ ${event}`, data?.error || data);
  }
}

module.exports = { logEvent };

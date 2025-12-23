/**
 * utils.js — Pool INFINITO e direto (sem dependência de timing)
 * Usa a lista fixa e embaralha na hora
 */

const TOP_USDT_PAIRS = [
  "BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "DOGEUSDT",
  "ADAUSDT", "AVAXUSDT", "BNBUSDT", "TRXUSDT", "LINKUSDT",
  "DOTUSDT", "MATICUSDT", "LTCUSDT", "BCHUSDT", "SHIBUSDT",
  "NEARUSDT", "TONUSDT", "SUIUSDT", "APTUSDT", "HBARUSDT",
  "ICPUSDT", "PEPEUSDT", "ARBUSDT", "OPUSDT", "INJUSDT",
  "RUNEUSDT", "FILUSDT", "ETCUSDT", "ATOMUSDT", "UNIUSDT",
  "AAVEUSDT", "MKRUSDT", "STXUSDT", "ALGOUSDT", "VETUSDT",
  "EOSUSDT", "XLMUSDT", "THETAUSDT", "MANAUSDT", "SANDUSDT",
  "GRTUSDT", "EGLDUSDT", "FTMUSDT", "AXSUSDT", "CHZUSDT",
  "RNDRUSDT", "WIFUSDT", "ONDOUSDT", "JUPUSDT", "FETUSDT"
];

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function nowBR() {
  return new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function since(ms) {
  const s = Math.floor(ms / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

let currentPool = [];
let lastReload = 0;

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickSymbol() {
  if (currentPool.length === 0 || Date.now() - lastReload > 15 * 60 * 1000) {
    const shuffled = shuffleArray(TOP_USDT_PAIRS);
    currentPool = shuffled.map(symbol => ({ exchange: "BINANCE", symbol }));
    console.log(`🔄 Pool recarregado e embaralhado: ${currentPool.length} pares prontos!`);
    lastReload = Date.now();
  }

  if (currentPool.length === 0) return null;

  const picked = currentPool[0];
  currentPool.push(currentPool.shift());

  return picked;
}

module.exports = { sleep, pickSymbol, nowBR, since };
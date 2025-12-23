/**
 * universe.js — Universo TOP 50 pares (síncrono e direto)
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

let pool = [];

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Síncrono agora
function buildPool() {
  const shuffled = shuffleArray(TOP_USDT_PAIRS);
  pool = shuffled.map(symbol => ({ exchange: "BINANCE", symbol }));
  console.log(`🌍 Universo carregado: ${pool.length} pares top de liquidez`);
}

module.exports = { buildPool, pool };
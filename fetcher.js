// fetcher.js — Binance Futures (formato correto de interval)

const axios = require("axios");

const BINANCE_FAPI = "https://fapi.binance.com";

function mapInterval(tf) {
  const map = {
    "5m": "5m",
    "15m": "15m",
    "1h": "1h",
    "2h": "2h",
    "4h": "4h",
    "1d": "1d"
  };
  return map[tf] || "15m";
}

function normalizeKlines(raw) {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.map(r => ({
    time: Number(r[0]),
    open: Number(r[1]),
    high: Number(r[2]),
    low: Number(r[3]),
    close: Number(r[4]),
    volume: Number(r[5]),
  }));
}

async function fetchKlines(symbol, tf, limit = 500, exchange = "BINANCE") {
  const interval = mapInterval(tf);
  const safeLimit = Math.min(limit, 1500); // Futures permite até 1500

  try {
    if (exchange === "BINANCE") {
      const { data } = await axios.get(`${BINANCE_FAPI}/fapi/v1/klines`, {
        params: { symbol, interval, limit: safeLimit },
        timeout: 20000,
      });
      const klines = normalizeKlines(data);
      console.log(`✅ Dados carregados ${symbol} ${tf}: ${klines.length} candles`);
      return klines;
    }
    return [];
  } catch (err) {
    const status = err.response?.status || 'desconhecido';
    const message = err.message || '';
    console.log(`❌ Erro fetch ${symbol} ${tf}: status ${status} - ${message}`);
    return [];
  }
}

module.exports = { fetchKlines };
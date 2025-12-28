// fetcher.js — Endpoint spot + fallback Bybit, evita 451
const axios = require("axios");
const BINANCE_API = "https://api.binance.com"; // Endpoint público spot
const BYBIT_API = "https://api.bybit.com";

function mapInterval(tf) {
  const map = { "5m": "5m", "15m": "15m", "1h": "1h", "2h": "2h", "4h": "4h", "1d": "1d" };
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

async function fetchKlines(symbol, tf, limit = 500) {
  const safeLimit = Math.min(limit, 1500);
  const interval = mapInterval(tf);
  try {
    const { data } = await axios.get(`${BINANCE_API}/api/v3/klines`, {
      params: { symbol, interval, limit: safeLimit },
      timeout: 15000
    });
    const klines = normalizeKlines(data);
    console.log(`✅ Binance ${symbol} ${tf}: ${klines.length} candles`);
    return klines;
  } catch (err) {
    console.log(`❌ Erro Binance ${symbol} ${tf}: status ${err.response?.status || 'desconhecido'} - ${err.message}`);
    // Fallback para Bybit
    try {
      const { data } = await axios.get(`${BYBIT_API}/v5/market/kline`, {
        params: { category: 'linear', symbol, interval: interval.replace('m', ''), limit: safeLimit },
        timeout: 15000
      });
      if (data.result && data.result.list) {
        const klines = normalizeKlines(data.result.list);
        console.log(`✅ Bybit ${symbol} ${tf}: ${klines.length} candles`);
        return klines;
      }
    } catch (bybitErr) {
      console.log(`❌ Bybit erro ${symbol} ${tf}: ${bybitErr.message}`);
    }
    return [];
  }
}
module.exports = { fetchKlines };

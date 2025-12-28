// fetcher.js — Somente Bybit v5, com retry e delay para evitar 403
const axios = require("axios");
const BYBIT_API = "https://api.bybit.com";

function mapInterval(tf) {
  const map = { "5m": "5", "15m": "15", "1h": "60", "2h": "120", "4h": "240", "1d": "D" };
  return map[tf] || "15";
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

async function fetchKlines(symbol, tf, limit = 500, retry = 0) {
  const safeLimit = Math.min(limit, 1500);
  const interval = mapInterval(tf);
  try {
    const { data } = await axios.get(`${BYBIT_API}/v5/market/kline`, {
      params: { category: 'linear', symbol, interval, limit: safeLimit },
      timeout: 20000
    });
    if (!data.result || !data.result.list) {
      console.log(`❌ Bybit resposta inválida ${symbol} ${tf}`);
      return [];
    }
    const klines = normalizeKlines(data.result.list);
    console.log(`✅ Bybit ${symbol} ${tf}: ${klines.length} candles`);
    return klines;
  } catch (err) {
    const status = err.response?.status || 'desconhecido';
    console.log(`❌ Bybit erro ${symbol} ${tf}: status ${status} - ${err.message}`);
    if (retry < 3 && status === 403) {
      console.log(`Tentando novamente (${retry+1}/3) após 10s...`);
      await new Promise(r => setTimeout(r, 10000));
      return fetchKlines(symbol, tf, limit, retry + 1);
    }
    return [];
  }
}
module.exports = { fetchKlines };

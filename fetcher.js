// fetcher.js — Binance primeiro, fallback Bybit se erro 451

const axios = require("axios");

const BINANCE_FAPI = "https://fapi.binance.com";
const BYBIT_API = "https://api.bybit.com";

function mapIntervalBinance(tf) {
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

function mapIntervalBybit(tf) {
  const map = {
    "5m": "5",
    "15m": "15",
    "1h": "60",
    "2h": "120",
    "4h": "240",
    "1d": "D"
  };
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

async function fetchKlines(symbol, tf, limit = 500, exchange = "BINANCE") {
  const safeLimit = Math.min(limit, 1500);

  if (exchange === "BINANCE") {
    const interval = mapIntervalBinance(tf);
    try {
      const { data } = await axios.get(`${BINANCE_FAPI}/fapi/v1/klines`, {
        params: { symbol, interval, limit: safeLimit },
        timeout: 20000
      });
      const klines = normalizeKlines(data);
      console.log(`✅ Binance carregado ${symbol} ${tf}: ${klines.length} candles`);
      return klines;
    } catch (err) {
      const status = err.response?.status || 'desconhecido';
      console.log(`❌ Binance erro ${symbol} ${tf}: status ${status}`);
      if (status === 451 || status === 400) {
        console.log(`🔄 Fallback pra Bybit ${symbol} ${tf}`);
        return fetchKlines(symbol, tf, limit, "BYBIT");
      }
      return [];
    }
  }

  if (exchange === "BYBIT") {
    const interval = mapIntervalBybit(tf);
    try {
      const { data } = await axios.get(`${BYBIT_API}/v5/market/kline`, {
        params: { category: 'linear', symbol, interval, limit: safeLimit },
        timeout: 20000
      });
      const klines = normalizeKlines(data.result.list);
      console.log(`✅ Bybit carregado ${symbol} ${tf}: ${klines.length} candles`);
      return klines;
    } catch (err) {
      console.log(`❌ Bybit erro ${symbol} ${tf}: ${err.message}`);
      return [];
    }
  }

  return [];
}

module.exports = { fetchKlines };

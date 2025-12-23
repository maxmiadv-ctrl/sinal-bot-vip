/**
 * fetcher_master.js — Binance Spot + Futures (dados reais)
 * - fetchKlines(symbol, tf) usa SPOT por padrão
 * - garante candles FECHADOS (remove candle ainda formando)
 * - fetchFundingRate(symbol) (se existir no futures)
 * - fetchOrderBook(symbol) (opcional)
 */

const axios = require("axios");
const { logEvent } = require("./logger");

const SPOT_BASE = "https://api.binance.com";
const FUT_BASE = "https://fapi.binance.com";

const TF_LIMIT = 200; // suficiente para EMAs 200 etc.

function mapKlines(raw) {
  return raw.map(k => ({
    openTime: k[0],
    open: Number(k[1]),
    high: Number(k[2]),
    low: Number(k[3]),
    close: Number(k[4]),
    volume: Number(k[5]),
    closeTime: k[6],
  }));
}

function keepClosedCandles(candles) {
  const now = Date.now();
  // garante candle fechado: closeTime <= now - 1s
  return candles.filter(c => c.closeTime <= now - 1000);
}

async function fetchKlines(symbol, interval, market = "spot") {
  try {
    const base = market === "futures" ? FUT_BASE : SPOT_BASE;
    const path = market === "futures" ? "/fapi/v1/klines" : "/api/v3/klines";
    const url = `${base}${path}`;

    const { data } = await axios.get(url, {
      params: { symbol, interval, limit: TF_LIMIT },
      timeout: 15000,
    });

    const candles = keepClosedCandles(mapKlines(data));
    return candles;
  } catch (e) {
    logEvent("fetch_error", { symbol, interval, market, error: e.message });
    return null;
  }
}

async function fetchFundingRate(symbol) {
  // tenta pegar funding atual pelo premiumIndex
  try {
    const url = `${FUT_BASE}/fapi/v1/premiumIndex`;
    const { data } = await axios.get(url, { params: { symbol }, timeout: 15000 });
    const fr = Number(data?.lastFundingRate || 0);
    return isFinite(fr) ? fr : 0;
  } catch (e) {
    return 0;
  }
}

async function fetchOrderBook(symbol, limit = 50) {
  try {
    const url = `${FUT_BASE}/fapi/v1/depth`;
    const { data } = await axios.get(url, { params: { symbol, limit }, timeout: 15000 });

    return {
      lastUpdateId: data.lastUpdateId,
      bids: (data.bids || []).map(([p, q]) => [Number(p), Number(q)]),
      asks: (data.asks || []).map(([p, q]) => [Number(p), Number(q)]),
    };
  } catch (e) {
    return null;
  }
}

module.exports = {
  fetchKlines,
  fetchFundingRate,
  fetchOrderBook,
};

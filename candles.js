/**
 * candles.js — Indicadores Institucionais ULTRA HARD
 * Versão otimizada para alta velocidade e precisão
 */

function sma(values, period) {
  if (!Array.isArray(values) || values.length < period) return null;
  let sum = 0;
  for (let i = values.length - period; i < values.length; i++) {
    sum += values[i];
  }
  return sum / period;
}

function ema(values, period) {
  if (!Array.isArray(values) || values.length < period) return null;

  const k = 2 / (period + 1);

  // SMA inicial
  let prev = sma(values.slice(0, period), period);

  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
  }

  return prev;
}

function rsi(values, period = 14) {
  if (!Array.isArray(values) || values.length < period + 1) return 50;

  let gain = 0, loss = 0;

  for (let i = values.length - period; i < values.length; i++) {
    const d = values[i] - values[i - 1];
    if (d > 0) gain += d;
    else loss -= d;
  }

  const avgGain = gain / period;
  const avgLoss = loss / period || 1e-9;

  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function macd(values, p1 = 12, p2 = 26, signalPeriod = 9) {
  if (!Array.isArray(values) || values.length < p2 + signalPeriod)
    return { macd: 0, signal: 0, hist: 0 };

  const emaFast = ema(values, p1);
  const emaSlow = ema(values, p2);
  const line = emaFast - emaSlow;

  // MACD Series
  const series = [];
  for (let i = p2; i < values.length; i++) {
    const sFast = ema(values.slice(0, i + 1), p1);
    const sSlow = ema(values.slice(0, i + 1), p2);
    series.push(sFast - sSlow);
  }

  const signal = ema(series, signalPeriod);
  const hist = line - signal;

  return { macd: line, signal, hist };
}

function stochastic(klines, kPeriod = 14) {
  if (!Array.isArray(klines) || klines.length < kPeriod)
    return { k: 50, d: 50 };

  const slice = klines.slice(-kPeriod);

  const highs = slice.map(c => c.high);
  const lows = slice.map(c => c.low);

  const high = Math.max(...highs);
  const low = Math.min(...lows);
  const close = slice[slice.length - 1].close;

  const k = ((close - low) / ((high - low) || 1)) * 100;
  return { k, d: k };
}

function obv(klines) {
  if (!Array.isArray(klines) || klines.length < 2) return 0;

  let v = 0;
  for (let i = 1; i < klines.length; i++) {
    const prev = klines[i - 1].close;
    const cur = klines[i].close;
    if (cur > prev) v += klines[i].volume;
    else if (cur < prev) v -= klines[i].volume;
  }
  return v;
}

function momentum(values, lookback = 10) {
  if (!Array.isArray(values) || values.length < lookback + 1) return 0;
  return values[values.length - 1] - values[values.length - 1 - lookback];
}

function bollinger(values, period = 20, mult = 2) {
  if (!Array.isArray(values) || values.length < period) return null;

  const slice = values.slice(-period);
  const m = sma(slice, period);
  let variance = 0;

  for (let v of slice) {
    variance += Math.pow(v - m, 2);
  }

  const std = Math.sqrt(variance / period);

  return {
    upper: m + mult * std,
    middle: m,
    lower: m - mult * std,
    std
  };
}

function atr(klines, period = 14) {
  if (!Array.isArray(klines) || klines.length < period + 1) return null;

  const ranges = [];

  for (let i = klines.length - period; i < klines.length; i++) {
    const cur = klines[i];
    const prev = klines[i - 1];

    const tr = Math.max(
      cur.high - cur.low,
      Math.abs(cur.high - prev.close),
      Math.abs(cur.low - prev.close)
    );

    ranges.push(tr);
  }

  return ranges.reduce((a, b) => a + b, 0) / period;
}

module.exports = {
  sma,
  ema,
  rsi,
  macd,
  stochastic,
  obv,
  momentum,
  bollinger,
  atr
};

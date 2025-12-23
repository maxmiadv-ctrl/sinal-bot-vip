/**
 * main.js — CÉREBRO FREE (5m-4h) — Stops mais seguros contra volatilidade
 */

const { fetchKlines } = require("./fetcher");
const { calcularScore } = require("./score_engine");
const { formatFree } = require("./formatter");

const { TIMEFRAMES_FREE, MIN_RR_FREE, DIAGNOSTIC_LOG } = require("./config");
const { bot } = require("./bot");
require('dotenv').config();
const { logSignal } = require("./monitor");

function arred(n) {
  return Number(Number(n).toFixed(6));
}

function last(arr) {
  return arr && arr.length ? arr[arr.length - 1] : null;
}

function highestHigh(klines, n = 30) {
  return Math.max(...klines.slice(-n).map(k => Number(k.high)));
}

function lowestLow(klines, n = 30) {
  return Math.min(...klines.slice(-n).map(k => Number(k.low)));
}

function atrApprox(klines, n = 14) {
  if (!klines || klines.length < n + 2) return 0;
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    const c = klines[klines.length - i];
    const p = klines[klines.length - i - 1];
    const tr = Math.max(
      Number(c.high) - Number(c.low),
      Math.abs(Number(c.high) - Number(p.close)),
      Math.abs(Number(c.low) - Number(p.close))
    );
    sum += tr;
  }
  return sum / n;
}

function rrCalc(entry, stop, tp) {
  const risk = Math.abs(entry - stop);
  const reward = Math.abs(tp - entry);
  return risk > 0 ? reward / risk : 0;
}

async function enviarSinalFree(payload, symbol) {
  const channelId = process.env.FREE_CHANNEL_ID;
  if (!channelId) {
    console.error("❌ FREE_CHANNEL_ID não encontrado no .env");
    return false;
  }

  try {
    await bot.telegram.sendMessage(channelId, payload.text, payload.options);
    console.log(`✅ ✅ SINAL FREE ENVIADO: ${symbol} | Canal: ${channelId}`);
    return true;
  } catch (error) {
    console.error("❌ Erro ao enviar FREE:", error.message);
    return false;
  }
}

async function analisarTF(symbol, exchange, tf) {
  console.log(`🔍 FREE analisando ${symbol} ${tf}...`);
  
  const klines = await fetchKlines(symbol, tf, 260, exchange);
  if (!klines || klines.length < 200) {
    if (DIAGNOSTIC_LOG) console.log(`❌ Dados insuficientes ${symbol} ${tf}`);
    return null;
  }

  const kLast = last(klines);
  const entry = arred(Number(kLast.close));

  const scoreInfo = calcularScore(klines, "FREE");
  if (!scoreInfo || scoreInfo.direction === "NEUTRO" || scoreInfo.score < 65) {
    if (DIAGNOSTIC_LOG) console.log(`❌ Score baixo ${symbol} ${tf}: ${scoreInfo?.score || 0}`);
    return null;
  }

  const tfMaior = tf === "5m" ? "15m" : tf === "15m" ? "1h" : "4h";
  const klinesMaior = await fetchKlines(symbol, tfMaior, 260, exchange);
  const scoreMaior = klinesMaior ? calcularScore(klinesMaior, "FREE") : { score: 0 };
  if (scoreInfo.direction !== scoreMaior.direction || scoreMaior.score < 60) {
    if (DIAGNOSTIC_LOG) console.log(`❌ Multi-TF falhou ${symbol} ${tf} -> ${tfMaior}`);
    return null;
  }

  const atr = atrApprox(klines, 14);
  const buffer = atr * 1.0; // AUMENTADO para mais espaço

  let stop, tp1;

  if (scoreInfo.direction === "COMPRA") {
    const swingLow = lowestLow(klines, 35);
    // Stop mínimo 1.5% abaixo da entrada para evitar stop hunt
    const minStop = entry * 0.985;
    stop = arred(Math.min(swingLow - buffer, minStop));
    tp1 = arred(entry + (entry - stop) * 1.8);
  } else {
    const swingHigh = highestHigh(klines, 35);
    const minStop = entry * 1.015;
    stop = arred(Math.max(swingHigh + buffer, minStop));
    tp1 = arred(entry - (stop - entry) * 1.8);
  }

  const rr = rrCalc(entry, stop, tp1);
  if (rr < MIN_RR_FREE) {
    if (DIAGNOSTIC_LOG) console.log(`❌ RR baixo ${symbol}: ${rr.toFixed(2)}`);
    return null;
  }

  console.log(`✅ SINAL FREE OK: ${symbol} ${tf} | Score: ${scoreInfo.score} | RR: ${rr.toFixed(2)}`);

  return {
    symbol,
    timeframe: tf,
    direction: scoreInfo.direction,
    entrada: entry,
    stop,
    tp1,
    rr,
    score: scoreInfo.score,
    estrelas: scoreInfo.stars || "★"
  };
}

async function gerarSinalFree(picked) {
  console.log(`🎯 Testando FREE para ${picked.symbol}...`);

  for (const tf of TIMEFRAMES_FREE) {
    const sinal = await analisarTF(picked.symbol, picked.exchange, tf);
    if (!sinal) continue;

    const payload = formatFree(sinal);
    if (!payload?.text || payload.text.trim().length < 50) {
      console.log("⚠️ Formatação inválida");
      continue;
    }

    const enviado = await enviarSinalFree(payload, picked.symbol);
    if (enviado) {
      logSignal(sinal, "FREE");
      return { ok: true, payload, symbol: picked.symbol };
    }
  }

  console.log("❌ Nenhum sinal FREE aprovado");
  return { ok: false };
}

module.exports = { gerarSinalFree };
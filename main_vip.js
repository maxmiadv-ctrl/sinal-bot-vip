/**
 * main_vip.js — CÉREBRO VIP — Stops profissionais (risco max 5%, RR min 2.2)
 */

const { fetchKlines } = require("./fetcher");
const { calcularScore } = require("./score_engine");
const { formatVip } = require("./formatter");

const { TIMEFRAMES_VIP, MIN_RR_VIP, DIAGNOSTIC_LOG } = require("./config");
const { bot } = require("./bot"); // Telegram
const { sendToDiscord } = require("./discord"); // Discord VIP premium

require('dotenv').config();

function arred(n) {
  return Number(Number(n).toFixed(6));
}

function last(arr) {
  return arr && arr.length ? arr[arr.length - 1] : null;
}

function highestHigh(klines, n = 40) {
  return Math.max(...klines.slice(-n).map(k => Number(k.high)));
}

function lowestLow(klines, n = 40) {
  return Math.min(...klines.slice(-n).map(k => Number(k.low)));
}

function atrApprox(klines, n = 14) {
  if (!klines || klines.length < n + 2) return 0;
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    const c = klines[klines.length - i];
    const p = klines[klines.length - i - 1]; // CORRIGIDO: declaração completa
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

// Envio VIP: Telegram + Discord (texto limpo, com espaços)
async function enviarSinalVip(payload, symbol) {
  let sucesso = false;

  // Telegram VIP
  const channelId = process.env.VIP_CHANNEL_ID;
  if (channelId) {
    try {
      await bot.telegram.sendMessage(channelId, payload.text, payload.options);
      console.log(`✅ Sinal VIP enviado para Telegram VIP: ${symbol}`);
      sucesso = true;
    } catch (error) {
      console.error("❌ Erro Telegram VIP:", error.message);
    }
  }

  // Discord VIP (formatação limpa com espaços)
  try {
    const textoDiscord = payload.text
      .replace(/<b>/g, '**')
      .replace(/<\/b>/g, '**')
      .replace(/<i>/g, '*')
      .replace(/<\/i>/g, '*')
      .replace(/\n/g, '\n\n'); // espaços entre linhas
    await sendToDiscord(`\n${textoDiscord}\n`);
    console.log(`✅ Sinal VIP enviado para Discord VIP: ${symbol}`);
    sucesso = true;
  } catch (error) {
    console.error("❌ Erro Discord VIP:", error.message);
  }

  return sucesso;
}

async function analisarTFVIP(symbol, exchange, tf) {
  console.log(`🔍 VIP analisando ${symbol} ${tf}...`);

  const klines = await fetchKlines(symbol, tf, 300, exchange);
  if (!klines || klines.length < 250) {
    if (DIAGNOSTIC_LOG) console.log(`❌ Dados insuficientes VIP ${symbol} ${tf}`);
    return null;
  }

  const kLast = last(klines);
  const entry = arred(Number(kLast.close));

  const scoreInfo = calcularScore(klines, "VIP");
  if (!scoreInfo || scoreInfo.direction === "NEUTRO" || scoreInfo.score < 80) {
    if (DIAGNOSTIC_LOG) console.log(`❌ Score VIP baixo ${symbol} ${tf}: ${scoreInfo?.score || 0}`);
    return null;
  }

  const klinesDiario = await fetchKlines(symbol, "1d", 300, exchange);
  const scoreDiario = klinesDiario ? calcularScore(klinesDiario, "VIP") : { score: 0 };
  if (scoreInfo.direction !== scoreDiario.direction || scoreDiario.score < 75) {
    if (DIAGNOSTIC_LOG) console.log(`❌ Confirmação diária falhou ${symbol} ${tf}`);
    return null;
  }

  const atr = atrApprox(klines, 14);
  const buffer = atr * 1.2;

  let stop, tp1, tp2, tpFinal;

  if (scoreInfo.direction === "COMPRA") {
    const swingLow = lowestLow(klines, 45);
    stop = arred(Math.max(swingLow - buffer, entry * 0.95)); // risco max 5%
    const risk = entry - stop;
    tp1 = arred(entry + risk * 2.2);
    tp2 = arred(entry + risk * 3.5);
    tpFinal = arred(entry + risk * 5.0);
  } else {
    const swingHigh = highestHigh(klines, 45);
    stop = arred(Math.min(swingHigh + buffer, entry * 1.05)); // risco max 5%
    const risk = stop - entry;
    tp1 = arred(entry - risk * 2.2);
    tp2 = arred(entry - risk * 3.5);
    tpFinal = arred(entry - risk * 5.0);
  }

  const rr = rrCalc(entry, stop, tp1);
  if (rr < MIN_RR_VIP) {
    if (DIAGNOSTIC_LOG) console.log(`❌ RR VIP baixo ${symbol}: ${rr.toFixed(2)}`);
    return null;
  }

  console.log(`✅ SINAL VIP APROVADO: ${symbol} ${tf} | Score: ${scoreInfo.score} | RR: ${rr.toFixed(2)}`);

  return {
    symbol,
    timeframe: tf,
    direction: scoreInfo.direction,
    entrada: entry,
    stop,
    tp1,
    tp2,
    tpFinal,
    rr,
    score: scoreInfo.score,
    estrelas: scoreInfo.stars || "★★★"
  };
}

async function gerarSinalVip(picked) {
  console.log(`🎯 Testando VIP para ${picked.symbol}...`);

  for (const tf of TIMEFRAMES_VIP) {
    const sinal = await analisarTFVIP(picked.symbol, picked.exchange, tf);
    if (!sinal) continue;

    const payload = formatVip(sinal);
    if (!payload?.text || payload.text.trim().length < 50) {
      console.log("⚠️ Formatação VIP inválida");
      continue;
    }

    const enviado = await enviarSinalVip(payload, picked.symbol);
    if (enviado) {
      return { ok: true, payload, symbol: picked.symbol };
    }
  }

  console.log("❌ Nenhum sinal VIP aprovado neste ciclo");
  return { ok: false };
}

module.exports = { gerarSinalVip };
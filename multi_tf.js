/**
 * multi_tf.js — Versão INSTITUCIONAL ULTRA HARD
 * 
 * - Usa todos indicadores profissionais (EMA, RSI, MACD, ATR, etc)
 * - Timeframes otimizados: 15m + 1h + 4h
 * - Retorna força e direção real para cada timeframe
 */

const { fetchKlines } = require("./fetchers/fetcher_master");
const { calcularEMAs } = require("./ema");
const { sma, ema, rsi, macd, stochastic, obv, momentum, bollinger, atr } = require("./candles");
const { calcularScoreFinal } = require("./score_engine");

// Timeframes realmente eficazes institucionalmente
const TIMEFRAMES = ["15m", "1h", "4h"];

/**
 * Avalia direção baseada em EMAs + MACD + RSI
 */
function avaliarDirecao({ emaInfo, rsiValue, macdHist }) {
  if (!emaInfo) return "NEUTRO";

  let alta = 0;
  let baixa = 0;

  // Tendência pelas EMAs
  if (emaInfo.ema9 > emaInfo.ema20) alta++;
  if (emaInfo.ema20 > emaInfo.ema50) alta++;
  if (emaInfo.ema9 < emaInfo.ema20) baixa++;
  if (emaInfo.ema20 < emaInfo.ema50) baixa++;

  // MACD confirma direção
  if (macdHist > 0) alta++;
  if (macdHist < 0) baixa++;

  // RSI confirma força
  if (rsiValue > 55) alta++;
  if (rsiValue < 45) baixa++;

  if (alta >= 3) return "COMPRA";
  if (baixa >= 3) return "VENDA";
  return "NEUTRO";
}

/**
 * Analisa múltiplos timeframes com indicadores reais
 */
async function analisarMultiTimeframe(par) {
  const resultados = [];

  for (const tf of TIMEFRAMES) {
    try {
      const candles = await fetchKlines(par, tf);
      if (!candles || candles.length < 50) {
        resultados.push({
          timeframe: tf,
          direction: "NEUTRO",
          score: 0,
          tendencia: "SEM DADOS"
        });
        continue;
      }

      const closeList = candles.map(c => Number(c.close));

      // Indicadores institucionais reais
      const emaInfo = calcularEMAs(candles);
      const rsiValue = rsi(closeList);
      const macdInfo = macd(closeList);
      const atrValue = atr(candles);
      const momentumValue = momentum(closeList);
      const obvValue = obv(candles);
      const boll = bollinger(closeList);
      const stoch = stochastic(candles);

      // Score HARD baseado nas EMAs
      const scoreInfo = calcularScoreFinal({ candles, ema: emaInfo });

      // Direção REAL institucional
      const direction = avaliarDirecao({
        emaInfo,
        rsiValue,
        macdHist: macdInfo.hist,
      });

      resultados.push({
        timeframe: tf,
        direction,
        tendencia: scoreInfo.score >= 40 ? "ALTA" :
                  scoreInfo.score <= -40 ? "BAIXA" : "NEUTRO",
        score: scoreInfo.score,

        ema: emaInfo,
        rsi: rsiValue,
        macd: macdInfo,
        atr: atrValue,
        momentum: momentumValue,
        obv: obvValue,
        bollinger: boll,
        stochastic: stoch
      });
    } catch (err) {
      console.log(`⚠ Erro no timeframe ${tf}:`, err.message);
      resultados.push({
        timeframe: tf,
        direction: "NEUTRO",
        score: 0,
        tendencia: "ERRO"
      });
    }
  }

  return resultados;
}

module.exports = { analisarMultiTimeframe };

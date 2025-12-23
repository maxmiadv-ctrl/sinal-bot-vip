// index.js — LOOP PRINCIPAL 24/7 (FREE + VIP) — Versão FINAL 2025

const {
  CHAT_FREE_ID,
  CHAT_VIP_ID,
  LIMIT_FREE_PER_DAY,
  LIMIT_VIP_PER_DAY,
  MINUTES_BETWEEN_SIGNALS,
  DIAGNOSTIC_LOG
} = require("./config");

const { bot } = require("./bot");
require('dotenv').config();

const { pickSymbol, sleep, nowBR, since } = require("./utils");

const { gerarSinalFree } = require("./main");
const { gerarSinalVip } = require("./main_vip");
const { getReport } = require("./monitor");
const winston = require('winston');
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'bot_logs.log' })
  ]
});

let freeCount = 0;
let vipCount = 0;
let lastSignalAt = 0;

function dateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
let day = dateKey();

function resetDailyIfNeeded() {
  const k = dateKey();
  if (k !== day) {
    day = k;
    freeCount = 0;
    vipCount = 0;
    console.log(`🗓️ Novo dia (${day}) — Contadores FREE e VIP resetados!`);
  }
}

async function mainLoop() {
  const startTime = Date.now();
  console.log("🚀 ROBÔ CRIPTO SEM CAÔ INICIADO 24/7 - VERSÃO ULTRA ASSERTIVA 2025");
  console.log("🔥 Analisando apenas os TOP 50 pares de alta liquidez");
  console.log("📊 Aguardando oportunidades...\n");

  setInterval(() => logger.info("Robô vivo – uptime: " + since(Date.now() - startTime)), 30 * 60 * 1000); // Log a cada 30 min
  setInterval(getReport, 24 * 60 * 60 * 1000); // Relatório diário

  let analyzed = 0;

  while (true) {
    try {
      resetDailyIfNeeded();

      // Cooldown entre sinais
      const now = Date.now();
      const waitMs = MINUTES_BETWEEN_SIGNALS * 60 * 1000 - (now - lastSignalAt);
      if (waitMs > 0) {
        console.log(`⏳ Cooldown: aguardando ${Math.ceil(waitMs / 60000)} minutos...`);
        await sleep(10000);
        continue;
      }

      const picked = await pickSymbol();
      if (!picked) {
        console.log("⚠️ Nenhum par disponível no momento. Recarregando pool...");
        await sleep(15000);
        continue;
      }

      analyzed++;
      console.log(`\n🔍 [${analyzed}] Analisando: ${picked.symbol} | ${nowBR()}`);

      // PRIORIDADE VIP (mais qualidade)
      if (CHAT_VIP_ID && vipCount < LIMIT_VIP_PER_DAY) {
        const vipRes = await gerarSinalVip(picked);
        if (vipRes?.ok) {
          vipCount++;
          lastSignalAt = Date.now();
          console.log(`💎 VIP ENVIADO (${vipCount}/${LIMIT_VIP_PER_DAY}) | ${picked.symbol}\n`);
          await sleep(60000); // pausa após VIP
          continue;
        }
      }

      // FREE (educacional)
      if (CHAT_FREE_ID && freeCount < LIMIT_FREE_PER_DAY) {
        const freeRes = await gerarSinalFree(picked);
        if (freeRes?.ok) {
          freeCount++;
          lastSignalAt = Date.now();
          console.log(`📢 FREE ENVIADO (${freeCount}/${LIMIT_FREE_PER_DAY}) | ${picked.symbol}\n`);
        }
      }

      // Status periódico
      if (analyzed % 15 === 0) {
        const uptime = since(Date.now() - startTime);
        console.log(`📈 STATUS: Analisados ${analyzed} pares | Uptime ${uptime} | FREE ${freeCount}/${LIMIT_FREE_PER_DAY} | VIP ${vipCount}/${LIMIT_VIP_PER_DAY}`);
      }

      await sleep(45000); // pausa suave entre ciclos

    } catch (err) {
      console.error(`❌ ERRO NO LOOP: ${err.message}`);
      await sleep(20000);
    }
  }
}

// INICIA O ROBÔ
mainLoop();
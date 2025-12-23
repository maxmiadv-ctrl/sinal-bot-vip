// config.js — Configuração central (FREE x VIP separados)
// Versão otimizada 2025 - mais sinais FREE, VIP premium

require("dotenv").config();

// ================= TELEGRAM =================
const TELEGRAM_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_TOKEN;

const CHAT_FREE_ID = process.env.FREE_CHANNEL_ID
  ? Number(process.env.FREE_CHANNEL_ID)
  : null;

const CHAT_VIP_ID = process.env.VIP_CHANNEL_ID
  ? Number(process.env.VIP_CHANNEL_ID)
  : null;

// ================= LIMITES DIÁRIOS =================
// FREE: mais sinais para atrair gente (educacional)
// VIP: poucos, mas de alta qualidade
const LIMIT_FREE_PER_DAY = 25;  // aumentamos para ter fluxo constante
const LIMIT_VIP_PER_DAY = 12;   // máximo 12 no VIP (qualidade > quantidade)

// distância mínima entre sinais (evita spam)
const MINUTES_BETWEEN_SIGNALS = 15;  // reduzimos um pouco para mais oportunidades

// ================= LOGS =================
const DIAGNOSTIC_LOG = true;  // mantenha true para ver no console o que está acontecendo

// ================= TIMEFRAMES =================
const TIMEFRAMES_FREE = ["5m", "15m", "1h", "2h", "4h"];
const TIMEFRAMES_VIP  = ["4h", "1d"];

// ================= RISCOS / RR =================
// FREE: educacional, RR mais acessível
// VIP: premium, RR mais alto
const MIN_RR_FREE = 1.6;  // mais sinais passam
const MIN_RR_VIP  = 2.0;  // mantém qualidade VIP

module.exports = {
  TELEGRAM_TOKEN,
  CHAT_FREE_ID,
  CHAT_VIP_ID,

  LIMIT_FREE_PER_DAY,
  LIMIT_VIP_PER_DAY,

  MINUTES_BETWEEN_SIGNALS,
  DIAGNOSTIC_LOG,

  TIMEFRAMES_FREE,
  TIMEFRAMES_VIP,

  MIN_RR_FREE,
  MIN_RR_VIP
};
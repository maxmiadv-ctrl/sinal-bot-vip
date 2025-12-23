/**
 * rate_limiter.js — controla quantos sinais por dia (FREE e VIP)
 * - FREE mais ativa (10 a 20 por dia)
 * - VIP mais seletiva (7 a 15 por dia)
 * - cooldown por par para não repetir
 */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function dayKeyUTC(d = new Date()) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

class RateLimiter {
  constructor({
    freeMin = 10,
    freeMax = 20,
    vipMin = 7,
    vipMax = 15,
    cooldownMinutes = 90,
    maxPerSymbolPerDay = 2,
  } = {}) {
    this.freeMin = freeMin;
    this.freeMax = freeMax;
    this.vipMin = vipMin;
    this.vipMax = vipMax;
    this.cooldownMs = cooldownMinutes * 60 * 1000;
    this.maxPerSymbolPerDay = maxPerSymbolPerDay;

    this._day = null;
    this._targets = { FREE: 0, VIP: 0 };
    this._sent = { FREE: 0, VIP: 0 };

    this._lastSentAt = new Map(); // key: tier|symbol -> timestamp
    this._sentPerSymbolDay = new Map(); // key: day|tier|symbol -> count
  }

  _resetIfNewDay() {
    const today = dayKeyUTC();
    if (this._day !== today) {
      this._day = today;
      this._targets = {
        FREE: randInt(this.freeMin, this.freeMax),
        VIP: randInt(this.vipMin, this.vipMax),
      };
      this._sent = { FREE: 0, VIP: 0 };
      this._lastSentAt.clear();
      this._sentPerSymbolDay.clear();
    }
  }

  canSend(symbol, tier) {
    this._resetIfNewDay();

    if (tier !== "FREE" && tier !== "VIP") {
      return { ok: false, reason: "INVALID_TIER" };
    }

    // já bateu o alvo do dia
    if (this._sent[tier] >= this._targets[tier]) {
      return { ok: false, reason: "DAILY_TARGET_REACHED", sent: this._sent[tier], target: this._targets[tier] };
    }

    // cooldown por par
    const k = `${tier}|${symbol}`;
    const last = this._lastSentAt.get(k);
    if (last && Date.now() - last < this.cooldownMs) {
      return { ok: false, reason: "COOLDOWN" };
    }

    // limite por par no dia
    const perDayKey = `${this._day}|${tier}|${symbol}`;
    const used = this._sentPerSymbolDay.get(perDayKey) || 0;
    if (used >= this.maxPerSymbolPerDay) {
      return { ok: false, reason: "MAX_PER_SYMBOL_DAY" };
    }

    return { ok: true };
  }

  markSent(symbol, tier) {
    this._resetIfNewDay();

    this._sent[tier] = (this._sent[tier] || 0) + 1;

    const k = `${tier}|${symbol}`;
    this._lastSentAt.set(k, Date.now());

    const perDayKey = `${this._day}|${tier}|${symbol}`;
    const used = this._sentPerSymbolDay.get(perDayKey) || 0;
    this._sentPerSymbolDay.set(perDayKey, used + 1);
  }

  getStatus() {
    this._resetIfNewDay();
    return {
      day: this._day,
      targets: this._targets,
      sent: this._sent,
    };
  }
}

module.exports = { RateLimiter };

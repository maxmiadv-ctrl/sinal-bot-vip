/**
 * limiter.js — controla repetição por par e limite diário (FREE/VIP)
 */

function startOfDayKey(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

class Limiter {
  constructor({
    freeMinPerDay = 10,
    freeMaxPerDay = 20,
    vipMinPerDay = 7,
    vipMaxPerDay = 15,
    cooldownMinutesSameSymbol = 180, // 3h sem repetir o MESMO par
    maxPerSymbolPerDay = 1
  } = {}) {
    this.cfg = {
      freeMinPerDay,
      freeMaxPerDay,
      vipMinPerDay,
      vipMaxPerDay,
      cooldownMinutesSameSymbol,
      maxPerSymbolPerDay
    };

    this.dayKey = startOfDayKey();
    this.countFree = 0;
    this.countVip = 0;

    this.lastSentBySymbol = new Map(); // symbol -> timestamp(ms)
    this.sentPerSymbolToday = new Map(); // symbol -> count
  }

  _rollDayIfNeeded(now = new Date()) {
    const k = startOfDayKey(now);
    if (k !== this.dayKey) {
      this.dayKey = k;
      this.countFree = 0;
      this.countVip = 0;
      this.lastSentBySymbol.clear();
      this.sentPerSymbolToday.clear();
    }
  }

  canSend(symbol, room, now = new Date()) {
    this._rollDayIfNeeded(now);

    const ts = now.getTime();
    const last = this.lastSentBySymbol.get(symbol) || 0;
    const mins = (ts - last) / 60000;

    if (last && mins < this.cfg.cooldownMinutesSameSymbol) {
      return { ok: false, reason: `cooldown_${Math.ceil(this.cfg.cooldownMinutesSameSymbol - mins)}m` };
    }

    const perSym = this.sentPerSymbolToday.get(symbol) || 0;
    if (perSym >= this.cfg.maxPerSymbolPerDay) {
      return { ok: false, reason: "max_per_symbol_day" };
    }

    if (room === "FREE") {
      if (this.countFree >= this.cfg.freeMaxPerDay) return { ok: false, reason: "free_daily_max" };
      return { ok: true };
    }

    if (room === "VIP") {
      if (this.countVip >= this.cfg.vipMaxPerDay) return { ok: false, reason: "vip_daily_max" };
      return { ok: true };
    }

    return { ok: false, reason: "unknown_room" };
  }

  markSent(symbol, room, now = new Date()) {
    this._rollDayIfNeeded(now);

    this.lastSentBySymbol.set(symbol, now.getTime());
    this.sentPerSymbolToday.set(symbol, (this.sentPerSymbolToday.get(symbol) || 0) + 1);

    if (room === "FREE") this.countFree += 1;
    if (room === "VIP") this.countVip += 1;
  }

  stats(now = new Date()) {
    this._rollDayIfNeeded(now);
    return {
      day: this.dayKey,
      free_sent: this.countFree,
      vip_sent: this.countVip
    };
  }
}

module.exports = { Limiter };

// Wheel and touch are transport heuristics, never domain-event authorities.
// A gesture owns at most one boundary crossing; its remaining momentum is lost.
export class StoryInputTransport {
  constructor({ read, scrub, step, rangePx = 600, threshold = 82, idleMs = 190 }) {
    this.read = read;
    this.scrub = scrub;
    this.step = step;
    this.rangePx = rangePx;
    this.threshold = threshold;
    this.idleMs = idleMs;
    this.gesture = null;
    this.lastAt = -Infinity;
    this.blocked = false;
  }

  interrupt(at = performance.now(), suppress = true) {
    this.gesture = null;
    this.lastAt = suppress ? at : -Infinity;
    this.blocked = suppress;
  }

  beginPointer() { this.interrupt(0, false); }

  wheel(event, viewportHeight, at = performance.now()) {
    if (event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return false;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewportHeight : 1;
    return this.input(event.deltaY * unit, at);
  }

  pointer(delta, at = performance.now()) { return this.input(delta, at); }

  input(raw, at) {
    if (!Number.isFinite(raw) || Math.abs(raw) < 0.5 || this.read().paused) return false;
    const delta = Math.max(-160, Math.min(160, raw));
    const sign = Math.sign(delta);
    if (at - this.lastAt > this.idleMs || at < this.lastAt) {
      this.gesture = null;
      this.blocked = false;
    }
    this.lastAt = at;
    if (this.blocked) return true;
    if (!this.gesture) this.gesture = { sign, amount: 0, consumed: false };
    if (this.gesture.consumed) {
      if (!this.gesture.endpoint || sign === this.gesture.sign) {
        this.gesture.opposite = 0;
        return true;
      }
      this.gesture.opposite = (this.gesture.opposite || 0) + delta;
      if (Math.abs(this.gesture.opposite) < 32) return true;
      this.gesture = { sign, amount: 0, consumed: false };
    }
    if (sign !== this.gesture.sign) {
      if (Math.abs(delta) < 12) return true; // trackpad direction jitter
      this.gesture = { sign, amount: 0, consumed: false };
    }

    const state = this.read();
    if (state.mode === 'scrub' && !state.reducedMotion) {
      const progress = state.progress;
      const outward = (progress <= 0 && sign < 0) || (progress >= 1 && sign > 0);
      if (!outward) {
        const range = typeof this.rangePx === 'function' ? this.rangePx() : this.rangePx;
        this.scrub(delta / Math.max(1, range));
        const now = this.read().progress;
        if ((sign > 0 && now >= 1) || (sign < 0 && now <= 0)) {
          this.gesture.consumed = true;
          this.gesture.endpoint = true;
        }
        return true;
      }
    }

    this.gesture.amount += delta;
    if (Math.abs(this.gesture.amount) >= this.threshold) {
      this.gesture.consumed = true;
      this.step(sign);
    }
    return true;
  }
}

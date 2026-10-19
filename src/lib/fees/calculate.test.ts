import { describe, expect, it } from 'vitest';
import {
  calculateForward,
  calculateReverse,
  formatMoney,
  formatPercent,
  round2,
} from './calculate';
import { processors } from '@/data/fees';

describe('round2', () => {
  it('rounds half up to cents', () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(2.994)).toBe(2.99);
  });
});

describe('calculateForward', () => {
  it('computes Stripe US 2.9% + $0.30 on $100', () => {
    const r = calculateForward(100, { percent: 0.029, fixed: 0.3 });
    expect(r.fee).toBe(3.2);
    expect(r.net).toBe(96.8);
  });

  it('handles zero percent with fixed fee', () => {
    const r = calculateForward(50, { percent: 0, fixed: 1 });
    expect(r.fee).toBe(1);
    expect(r.net).toBe(49);
  });

  it('handles free transfers', () => {
    const r = calculateForward(100, { percent: 0, fixed: 0 });
    expect(r.fee).toBe(0);
    expect(r.net).toBe(100);
  });

  it('rejects invalid charge', () => {
    expect(() => calculateForward(-1, { percent: 0.029, fixed: 0.3 })).toThrow(RangeError);
  });

  it('rejects percent >= 1', () => {
    expect(() => calculateForward(10, { percent: 1, fixed: 0 })).toThrow(RangeError);
  });
});

describe('calculateReverse', () => {
  it('finds charge to receive $100 after Stripe US fees', () => {
    const r = calculateReverse(100, { percent: 0.029, fixed: 0.3 });
    // (100 + 0.30) / (1 - 0.029) = 100.30 / 0.971 ≈ 103.30
    expect(r.charge).toBe(103.3);
    expect(r.net).toBeGreaterThanOrEqual(100);
    expect(r.net).toBeLessThanOrEqual(100.02);
  });

  it('handles zero percent reverse', () => {
    const r = calculateReverse(100, { percent: 0, fixed: 0.5 });
    expect(r.charge).toBe(100.5);
    expect(r.net).toBe(100);
  });

  it('handles free reverse', () => {
    const r = calculateReverse(75, { percent: 0, fixed: 0 });
    expect(r.charge).toBe(75);
    expect(r.net).toBe(75);
  });

  it('round-trips forward → reverse for common amounts', () => {
    const rates = [
      { percent: 0.029, fixed: 0.3 },
      { percent: 0.0349, fixed: 0.49 },
      { percent: 0.026, fixed: 0.1 },
      { percent: 0.05, fixed: 0 },
      { percent: 0.1, fixed: 0.5 },
    ];
    const amounts = [1, 5, 10, 25, 50, 99.99, 100, 250, 999.99, 1000, 5000];
    for (const rate of rates) {
      for (const amount of amounts) {
        const forward = calculateForward(amount, rate);
        if (forward.net <= 0) continue;
        const reverse = calculateReverse(forward.net, rate);
        // Charge should be within a penny of original (rounding)
        expect(Math.abs(reverse.charge - amount)).toBeLessThanOrEqual(0.02);
      }
    }
  });
});

describe('every processor rate formula', () => {
  for (const processor of processors) {
    describe(processor.name, () => {
      for (const rate of processor.rates) {
        it(`${rate.id}: forward $100 and reverse to receive $100`, () => {
          const input = { percent: rate.percent, fixed: rate.fixed };
          const fwd = calculateForward(100, input);
          expect(fwd.fee).toBeGreaterThanOrEqual(0);
          expect(fwd.net).toBe(round2(100 - fwd.fee));
          if (fwd.net > 0 && rate.percent < 1) {
            const rev = calculateReverse(100, input);
            expect(rev.charge).toBeGreaterThanOrEqual(100);
            expect(rev.net).toBeGreaterThanOrEqual(99.99);
            const check = calculateForward(rev.charge, input);
            expect(check.net).toBeGreaterThanOrEqual(99.99);
          }
        });

        it(`${rate.id}: reverse of forward net recovers charge`, () => {
          const input = { percent: rate.percent, fixed: rate.fixed };
          const charge = 42.5;
          const fwd = calculateForward(charge, input);
          if (fwd.net <= 0) return;
          const rev = calculateReverse(fwd.net, input);
          expect(Math.abs(rev.charge - charge)).toBeLessThanOrEqual(0.02);
        });
      }
    });
  }
});

describe('format helpers', () => {
  it('formats USD', () => {
    expect(formatMoney(12.5, 'USD')).toMatch(/\$12\.50/);
  });
  it('formats percent', () => {
    expect(formatPercent(0.029)).toBe('2.90%');
  });
});

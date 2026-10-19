/**
 * Fee calculation engine.
 *
 * Forward: merchant receives amount after processor takes percent + fixed from charge.
 *   fee = charge * percent + fixed
 *   net = charge - fee
 *
 * Reverse: find charge so that net equals desired receive amount.
 *   charge = (desiredNet + fixed) / (1 - percent)
 *
 * All money rounded to 2 decimal places (banker's-style half-up via round2).
 */

export type FeeInput = {
  percent: number;
  fixed: number;
};

export type ForwardResult = {
  charge: number;
  fee: number;
  net: number;
  feePercentOfCharge: number;
  effectiveRate: number;
};

export type ReverseResult = {
  charge: number;
  fee: number;
  net: number;
  feePercentOfCharge: number;
  effectiveRate: number;
};

export function round2(n: number): number {
  if (!Number.isFinite(n)) return NaN;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function assertValidRate(input: FeeInput): void {
  if (!Number.isFinite(input.percent) || input.percent < 0 || input.percent >= 1) {
    throw new RangeError(`percent must be in [0, 1): ${input.percent}`);
  }
  if (!Number.isFinite(input.fixed) || input.fixed < 0) {
    throw new RangeError(`fixed must be >= 0: ${input.fixed}`);
  }
}

/** Forward: customer/payer charge amount → fee and net to merchant */
export function calculateForward(charge: number, input: FeeInput): ForwardResult {
  assertValidRate(input);
  if (!Number.isFinite(charge) || charge < 0) {
    throw new RangeError(`charge must be >= 0: ${charge}`);
  }
  const fee = round2(charge * input.percent + input.fixed);
  const net = round2(charge - fee);
  const feePercentOfCharge = charge === 0 ? 0 : fee / charge;
  const effectiveRate = charge === 0 ? 0 : fee / charge;
  return {
    charge: round2(charge),
    fee,
    net,
    feePercentOfCharge,
    effectiveRate,
  };
}

/** Reverse: desired net receive → how much to charge */
export function calculateReverse(desiredNet: number, input: FeeInput): ReverseResult {
  assertValidRate(input);
  if (!Number.isFinite(desiredNet) || desiredNet < 0) {
    throw new RangeError(`desiredNet must be >= 0: ${desiredNet}`);
  }
  if (input.percent >= 1) {
    throw new RangeError('percent must be < 1 for reverse calculation');
  }
  // When percent is 0: charge = desiredNet + fixed
  const chargeRaw = (desiredNet + input.fixed) / (1 - input.percent);
  const charge = round2(chargeRaw);
  const forward = calculateForward(charge, input);
  // Tiny rounding drift: if net is 1 cent off, nudge charge
  let adjusted = charge;
  if (forward.net < desiredNet) {
    adjusted = round2(charge + 0.01);
  } else if (forward.net > desiredNet + 0.01) {
    // leave as-is; half-up rounding can leave a penny surplus
  }
  const result = calculateForward(adjusted, input);
  return {
    charge: result.charge,
    fee: result.fee,
    net: result.net,
    feePercentOfCharge: result.feePercentOfCharge,
    effectiveRate: result.effectiveRate,
  };
}

export function formatMoney(amount: number, currency = 'USD', locale = 'en-US'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatPercent(rate: number, digits = 2): string {
  return `${(rate * 100).toFixed(digits)}%`;
}

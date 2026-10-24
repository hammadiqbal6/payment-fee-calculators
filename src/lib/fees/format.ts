import { calculateForward, calculateReverse, formatMoney } from './calculate';
import type { FeeComponent } from '@/data/fees';

const currencySymbols: Record<string, string> = {
  USD: '$',
  GBP: '£',
  EUR: '€',
  AUD: 'A$',
  CAD: 'C$',
  INR: '₹',
};

/** Human schedule string, e.g. "2.9% + $0.30" or "2.99%" when fixed is 0. */
export function formatSchedule(rate: FeeComponent): string {
  const cleanPct = `${parseFloat((rate.percent * 100).toFixed(4))}%`;
  if (rate.fixed === 0) return cleanPct;
  const sym = currencySymbols[rate.currency] ?? `${rate.currency} `;
  return `${cleanPct} + ${sym}${rate.fixed.toFixed(2)}`;
}

export function formatFeeOnAmount(rate: FeeComponent, amount: number): {
  fee: string;
  net: string;
  feeRaw: number;
  netRaw: number;
} {
  const r = calculateForward(amount, { percent: rate.percent, fixed: rate.fixed });
  return {
    fee: formatMoney(r.fee, rate.currency),
    net: formatMoney(r.net, rate.currency),
    feeRaw: r.fee,
    netRaw: r.net,
  };
}

export function formatChargeToNet(rate: FeeComponent, desiredNet: number): {
  charge: string;
  fee: string;
  chargeRaw: number;
} {
  const r = calculateReverse(desiredNet, { percent: rate.percent, fixed: rate.fixed });
  return {
    charge: formatMoney(r.charge, rate.currency),
    fee: formatMoney(r.fee, rate.currency),
    chargeRaw: r.charge,
  };
}

/** Approx charge string for prose, e.g. "~$103.30" */
export function approxChargeToNet(rate: FeeComponent, desiredNet: number): string {
  const { chargeRaw } = formatChargeToNet(rate, desiredNet);
  const sym = currencySymbols[rate.currency] ?? '';
  return `~${sym}${chargeRaw.toFixed(2)}`;
}

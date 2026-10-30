const nf = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export const gold = (n: number): string => (Number.isFinite(n) ? `${nf.format(Math.round(n))}g` : '—');
export const num1 = (n: number): string => (Number.isFinite(n) ? nf1.format(n) : '—');
export const pct = (n: number): string => `${nf1.format(n * 100)}%`;

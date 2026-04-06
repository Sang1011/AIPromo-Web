export const fmtMoneyVND = (n: number): string => {
    if (n === 0) return "0";
    const abs = Math.abs(n);
    if (abs >= 1_000_000_000) return `${+(n / 1_000_000_000).toFixed(1)} tỷ`;
    if (abs >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)} triệu`;
    if (abs >= 1_000) return `${+(n / 1_000).toFixed(1)} nghìn`;
    return `${n} đồng`;
};
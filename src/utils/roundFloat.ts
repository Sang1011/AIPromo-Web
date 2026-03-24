export const rf = (value: number, decimals = 2): number =>
    Math.round(value * 10 ** decimals) / 10 ** decimals;
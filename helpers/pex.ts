export const calcPexAttribute = (value: number) => value * (value - 1) * 2;
export const calcPexCapacity = (value: number) =>
  value === 0 ? 0 : value * (value - 1) + 3;

export const calcPexDiffAttribute = (from: number, to: number) =>
  calcPexAttribute(to) - calcPexAttribute(from);

export const calcPexDiffCapacity = (from: number, to: number) =>
  calcPexCapacity(to) - calcPexCapacity(from);

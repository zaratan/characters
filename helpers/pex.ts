export const calcPexAttribute = (value: number) => value * (value - 1) * 2;
export const calcPexAbility = (value: number) =>
  value === 0 ? 0 : value * (value - 1) + 3;

export const calcPexDiffAttribute = (from: number, to: number) =>
  calcPexAttribute(to) - calcPexAttribute(from);

export const calcPexDiffAbility = (from: number, to: number) =>
  calcPexAbility(to) - calcPexAbility(from);

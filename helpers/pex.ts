export const calcPexAttribute = (value: number) => value * (value - 1) * 2;
export const calcPexAbility = (value: number) =>
  value === 0 ? 0 : value * (value - 1) + 3;
export const calcPexWillpower = (value: number) => (value * (value - 1)) / 2;
export const calcPexPathOrVirtue = (value: number) => value * (value - 1);
export const calcPexInClanDiscipline = (value: number) => {
  if (value === 0) return 0;
  return value * (value - 1) * 2.5 + 10;
};
export const calcPexOutOfClanDiscipline = (value: number) => {
  if (value === 0) return 0;
  return value * (value - 1) * 3.5 + 10;
};
export const calcPexThaumaturgyPath = (value: number) => {
  if (value === 0) return 0;
  return value * (value - 1) * 2 + 7;
};
export const calcPexThaumaturgyRitual = (value: number, multi: number) =>
  value * multi;

export const calcPexDiffAttribute = (from: number, to: number) =>
  calcPexAttribute(to) - calcPexAttribute(from);

export const calcPexDiffAbility = (from: number, to: number) =>
  calcPexAbility(to) - calcPexAbility(from);

export const calcPexDiffWillpower = (from: number, to: number) =>
  calcPexWillpower(to) - calcPexWillpower(from);

export const calcPexDiffPathOrVirtue = (from: number, to: number) =>
  calcPexPathOrVirtue(to) - calcPexPathOrVirtue(from);

export const calcPexDiffInClanDiscipline = (from: number, to: number) =>
  calcPexInClanDiscipline(to) - calcPexInClanDiscipline(from);

export const calcPexDiffOutOfClanDiscipline = (from: number, to: number) =>
  calcPexOutOfClanDiscipline(to) - calcPexOutOfClanDiscipline(from);

export const calcPexDiffThaumaturgyPath = (from: number, to: number) =>
  calcPexThaumaturgyPath(to) - calcPexThaumaturgyPath(from);

export const calcPexDiffThaumaturgyRitual = (
  from: number,
  to: number,
  multi: number
) =>
  calcPexThaumaturgyRitual(to, multi) - calcPexThaumaturgyRitual(from, multi);

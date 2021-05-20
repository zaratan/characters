export const calcPexAttribute =
  (maxValue = 10) =>
  (value: number) => {
    const actualValue = Math.min(maxValue, value);
    return actualValue * (actualValue - 1) * 2;
  };
export const calcPexAbility =
  (maxValue = 10) =>
  (value: number) => {
    const actualValue = Math.min(maxValue, value);
    return actualValue === 0 ? 0 : actualValue * (actualValue - 1) + 3;
  };
export const calcPexWillpower = (value: number) => (value * (value - 1)) / 2;
export const calcPexPathOrVirtue = (value: number) => value * (value - 1);
export const calcPexInClanDiscipline =
  (maxValue = 10) =>
  (value: number) => {
    if (value === 0) return 0;
    const actualValue = Math.min(maxValue, value);
    return actualValue * (actualValue - 1) * 2.5 + 10;
  };
export const calcPexOutOfClanDiscipline =
  (maxValue = 10) =>
  (value: number) => {
    if (value === 0) return 0;
    const actualValue = Math.min(maxValue, value);
    return actualValue * (actualValue - 1) * 3.5 + 10;
  };
export const calcPexThaumaturgyPath = (value: number) => {
  if (value === 0) return 0;
  return value * (value - 1) * 2 + 7;
};
export const calcPexThaumaturgyRitual = (value: number, multi: number) =>
  value * multi;

export const calcPexSpecialty = (value: number) => (Math.max(1, value) - 1) * 2;

export const calcPexAdvFlaw = (value: number, neg: boolean) =>
  Math.abs(value) * 3 * (neg ? -1 : +1);

export const calcPexTrueFaith = (value: number) => {
  if (value === 0) return 0;
  if (value === 1) return 5;
  const lowLevels = Math.min(5, value);
  if (value > 5) {
    return (
      2 + // lvl 1 - 3 because v
      lowLevels * (lowLevels + 1) * 1.5 + // level 2 => 5
      value * (value + 1) * 2.5 -
      5 * 6 * 2.5 // lvl 6 => 10 (second part is to not double count the first levels)
    );
  }
  return 2 + lowLevels * (lowLevels + 1) * 1.5;
};

export const calcPexHumanMagic = (value: number) => {
  if (value === 0) return 0;
  if (value === 1) return 10;
  return value * (value + 1) * 3.5 + 3;
};

export const calcPexDiffHumanMagic = (from: number, to: number) =>
  calcPexHumanMagic(to) - calcPexHumanMagic(from);

export const calcPexDiffAttribute =
  (maxValue = 10) =>
  (from: number, to: number) =>
    calcPexAttribute(maxValue)(to) - calcPexAttribute(maxValue)(from);

export const calcPexDiffAbility =
  (maxValue = 10) =>
  (from: number, to: number) =>
    calcPexAbility(maxValue)(to) - calcPexAbility(maxValue)(from);

export const calcPexDiffWillpower = (from: number, to: number) =>
  calcPexWillpower(to) - calcPexWillpower(from);

export const calcPexDiffPathOrVirtue = (from: number, to: number) =>
  calcPexPathOrVirtue(to) - calcPexPathOrVirtue(from);

export const calcPexDiffInClanDiscipline =
  (maxValue = 10) =>
  (from: number, to: number) =>
    calcPexInClanDiscipline(maxValue)(to) -
    calcPexInClanDiscipline(maxValue)(from);

export const calcPexDiffOutOfClanDiscipline =
  (maxValue = 10) =>
  (from: number, to: number) =>
    calcPexOutOfClanDiscipline(maxValue)(to) -
    calcPexOutOfClanDiscipline(maxValue)(from);

export const calcPexDiffThaumaturgyPath = (from: number, to: number) =>
  calcPexThaumaturgyPath(to) - calcPexThaumaturgyPath(from);

export const calcPexDiffThaumaturgyRitual = (
  from: number,
  to: number,
  multi: number
) =>
  calcPexThaumaturgyRitual(to, multi) - calcPexThaumaturgyRitual(from, multi);

export const calcPexDiffSpecialty = (from: number, to: number) =>
  (Math.max(1, to) - Math.max(1, from)) * 2;

export const calcPexDiffAdvFlaw = (from: number, to: number, neg: boolean) =>
  calcPexAdvFlaw(to, neg) - calcPexAdvFlaw(from, neg);

export const clacPexDiffTrueFaith = (from: number, to: number) =>
  calcPexTrueFaith(to) - calcPexTrueFaith(from);

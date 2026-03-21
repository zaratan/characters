import { describe, it, expect } from 'vitest';
import {
  calcPexAttribute,
  calcPexAbility,
  calcPexWillpower,
  calcPexPathOrVirtue,
  calcPexInClanDiscipline,
  calcPexOutOfClanDiscipline,
  calcPexThaumaturgyPath,
  calcPexThaumaturgyRitual,
  calcPexSpecialty,
  calcPexAdvFlaw,
  calcPexTrueFaith,
  calcPexHumanMagic,
  calcPexDiffHumanMagic,
  calcPexDiffAttribute,
  calcPexDiffAbility,
  calcPexDiffWillpower,
  calcPexDiffPathOrVirtue,
  calcPexDiffInClanDiscipline,
  calcPexDiffOutOfClanDiscipline,
  calcPexDiffThaumaturgyPath,
  calcPexDiffThaumaturgyRitual,
  calcPexDiffSpecialty,
  calcPexDiffAdvFlaw,
  calcPexDiffTrueFaith,
} from '../../helpers/pex';

// ---------------------------------------------------------------------------
// calcPexAttribute
// ---------------------------------------------------------------------------

describe('calcPexAttribute', () => {
  it('returns -0 for value=0 (formula: 0*-1*2)', () => {
    expect(calcPexAttribute()(0)).toBe(-0);
  });

  it('returns correct value for value=1', () => {
    expect(calcPexAttribute()(1)).toBe(0);
  });

  it('returns correct value for value=5', () => {
    // 5 * 4 * 2 = 40
    expect(calcPexAttribute()(5)).toBe(40);
  });

  it('returns correct value for value=10 (default max)', () => {
    // 10 * 9 * 2 = 180
    expect(calcPexAttribute()(10)).toBe(180);
  });

  it('clamps to maxValue when value exceeds maxValue', () => {
    // maxValue=5, value=7 → clamped to 5 → 5*4*2 = 40
    expect(calcPexAttribute(5)(7)).toBe(40);
  });

  it('accepts a custom maxValue', () => {
    // maxValue=3, value=3 → 3*2*2 = 12
    expect(calcPexAttribute(3)(3)).toBe(12);
  });

  it('handles negative value (documents behavior: yields positive result)', () => {
    // value=-1 → -1 * -2 * 2 = 4
    expect(calcPexAttribute()(-1)).toBe(4);
  });

  it('handles non-integer value', () => {
    // value=2.5 → 2.5 * 1.5 * 2 = 7.5
    expect(calcPexAttribute()(2.5)).toBe(7.5);
  });
});

// ---------------------------------------------------------------------------
// calcPexAbility
// ---------------------------------------------------------------------------

describe('calcPexAbility', () => {
  it('returns 0 for value=0', () => {
    expect(calcPexAbility()(0)).toBe(0);
  });

  it('returns 3 for value=1', () => {
    // 1*0 + 3 = 3
    expect(calcPexAbility()(1)).toBe(3);
  });

  it('returns correct value for value=5', () => {
    // 5*4 + 3 = 23
    expect(calcPexAbility()(5)).toBe(23);
  });

  it('clamps to maxValue when value exceeds maxValue', () => {
    // maxValue=3, value=7 → clamped to 3 → 3*2+3 = 9
    expect(calcPexAbility(3)(7)).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// calcPexWillpower
// ---------------------------------------------------------------------------

describe('calcPexWillpower', () => {
  it('returns -0 for value=0 (formula: 0*-1/2)', () => {
    expect(calcPexWillpower(0)).toBe(-0);
  });

  it('returns 0 for value=1', () => {
    // 1*0/2 = 0
    expect(calcPexWillpower(1)).toBe(0);
  });

  it('returns 10 for value=5', () => {
    // 5*4/2 = 10
    expect(calcPexWillpower(5)).toBe(10);
  });

  it('returns 45 for value=10', () => {
    // 10*9/2 = 45
    expect(calcPexWillpower(10)).toBe(45);
  });
});

// ---------------------------------------------------------------------------
// calcPexPathOrVirtue
// ---------------------------------------------------------------------------

describe('calcPexPathOrVirtue', () => {
  it('returns -0 for value=0 (formula: 0*-1)', () => {
    expect(calcPexPathOrVirtue(0)).toBe(-0);
  });

  it('returns 0 for value=1', () => {
    // 1*0 = 0
    expect(calcPexPathOrVirtue(1)).toBe(0);
  });

  it('returns 6 for value=3', () => {
    // 3*2 = 6
    expect(calcPexPathOrVirtue(3)).toBe(6);
  });

  it('returns 20 for value=5', () => {
    // 5*4 = 20
    expect(calcPexPathOrVirtue(5)).toBe(20);
  });
});

// ---------------------------------------------------------------------------
// calcPexInClanDiscipline
// ---------------------------------------------------------------------------

describe('calcPexInClanDiscipline', () => {
  it('returns 0 for value=0', () => {
    expect(calcPexInClanDiscipline()(0)).toBe(0);
  });

  it('returns 10 for value=1', () => {
    // 1*0*2.5 + 10 = 10
    expect(calcPexInClanDiscipline()(1)).toBe(10);
  });

  it('returns correct value for value=3', () => {
    // 3*2*2.5 + 10 = 25
    expect(calcPexInClanDiscipline()(3)).toBe(25);
  });

  it('clamps to maxValue when value exceeds maxValue', () => {
    // maxValue=3, value=5 → clamped to 3 → 3*2*2.5+10 = 25
    expect(calcPexInClanDiscipline(3)(5)).toBe(25);
  });
});

// ---------------------------------------------------------------------------
// calcPexOutOfClanDiscipline
// ---------------------------------------------------------------------------

describe('calcPexOutOfClanDiscipline', () => {
  it('returns 0 for value=0', () => {
    expect(calcPexOutOfClanDiscipline()(0)).toBe(0);
  });

  it('returns 10 for value=1', () => {
    // 1*0*3.5 + 10 = 10
    expect(calcPexOutOfClanDiscipline()(1)).toBe(10);
  });

  it('returns correct value for value=3', () => {
    // 3*2*3.5 + 10 = 31
    expect(calcPexOutOfClanDiscipline()(3)).toBe(31);
  });

  it('clamps to maxValue when value exceeds maxValue', () => {
    // maxValue=2, value=4 → clamped to 2 → 2*1*3.5+10 = 17
    expect(calcPexOutOfClanDiscipline(2)(4)).toBe(17);
  });
});

// ---------------------------------------------------------------------------
// calcPexThaumaturgyPath
// ---------------------------------------------------------------------------

describe('calcPexThaumaturgyPath', () => {
  it('returns 0 for value=0', () => {
    expect(calcPexThaumaturgyPath(0)).toBe(0);
  });

  it('returns 7 for value=1', () => {
    // 1*0*2 + 7 = 7
    expect(calcPexThaumaturgyPath(1)).toBe(7);
  });

  it('returns correct value for value=3', () => {
    // 3*2*2 + 7 = 19
    expect(calcPexThaumaturgyPath(3)).toBe(19);
  });
});

// ---------------------------------------------------------------------------
// calcPexThaumaturgyRitual
// ---------------------------------------------------------------------------

describe('calcPexThaumaturgyRitual', () => {
  it('returns 0 when multi=0', () => {
    expect(calcPexThaumaturgyRitual(5, 0)).toBe(0);
  });

  it('returns value*multi', () => {
    expect(calcPexThaumaturgyRitual(3, 2)).toBe(6);
  });

  it('returns 0 for value=0', () => {
    expect(calcPexThaumaturgyRitual(0, 3)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// calcPexSpecialty
// ---------------------------------------------------------------------------

describe('calcPexSpecialty', () => {
  it('returns 0 for value=0 (max(1,0)-1 = 0)', () => {
    expect(calcPexSpecialty(0)).toBe(0);
  });

  it('returns 0 for value=1 (max(1,1)-1 = 0)', () => {
    expect(calcPexSpecialty(1)).toBe(0);
  });

  it('returns 2 for value=2', () => {
    expect(calcPexSpecialty(2)).toBe(2);
  });

  it('returns 4 for value=3', () => {
    expect(calcPexSpecialty(3)).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// calcPexAdvFlaw
// ---------------------------------------------------------------------------

describe('calcPexAdvFlaw', () => {
  it('returns positive cost when neg=false', () => {
    expect(calcPexAdvFlaw(2, false)).toBe(6);
  });

  it('returns negative value (PEX refund) when neg=true', () => {
    expect(calcPexAdvFlaw(2, true)).toBe(-6);
  });

  it('uses absolute value of negative input', () => {
    expect(calcPexAdvFlaw(-2, false)).toBe(6);
  });

  it('returns 0 for value=0 (abs(0)*3 = 0, sign irrelevant)', () => {
    expect(Math.abs(calcPexAdvFlaw(0, false))).toBe(0);
    expect(Math.abs(calcPexAdvFlaw(0, true))).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// calcPexTrueFaith (4 branches)
// ---------------------------------------------------------------------------

describe('calcPexTrueFaith', () => {
  it('returns 0 for value=0', () => {
    expect(calcPexTrueFaith(0)).toBe(0);
  });

  it('returns 5 for value=1', () => {
    expect(calcPexTrueFaith(1)).toBe(5);
  });

  it('returns correct value for value=3 (≤5 branch)', () => {
    // lowLevels=3, 2 + 3*4*1.5 = 2 + 18 = 20
    expect(calcPexTrueFaith(3)).toBe(20);
  });

  it('returns correct value for value=5 (≤5 boundary)', () => {
    // 2 + 5*6*1.5 = 2 + 45 = 47
    expect(calcPexTrueFaith(5)).toBe(47);
  });

  it('returns correct value for value=6 (>5 branch)', () => {
    // 2 + 5*6*1.5 + 6*7*2.5 - 5*6*2.5 = 2 + 45 + 105 - 75 = 77
    expect(calcPexTrueFaith(6)).toBe(77);
  });
});

// ---------------------------------------------------------------------------
// calcPexHumanMagic (3 branches)
// ---------------------------------------------------------------------------

describe('calcPexHumanMagic', () => {
  it('returns 0 for value=0', () => {
    expect(calcPexHumanMagic(0)).toBe(0);
  });

  it('returns 10 for value=1', () => {
    expect(calcPexHumanMagic(1)).toBe(10);
  });

  it('returns correct value for value=2 (≥2 branch)', () => {
    // 2*3*3.5 + 3 = 21 + 3 = 24
    expect(calcPexHumanMagic(2)).toBe(24);
  });

  it('returns correct value for value=3', () => {
    // 3*4*3.5 + 3 = 42 + 3 = 45
    expect(calcPexHumanMagic(3)).toBe(45);
  });
});

// ---------------------------------------------------------------------------
// Diff functions — verify diff(from, to) = calc(to) - calc(from)
// ---------------------------------------------------------------------------

describe('calcPexDiffAttribute', () => {
  it('equals calcPexAttribute(to) - calcPexAttribute(from)', () => {
    const from = 2;
    const to = 5;
    expect(calcPexDiffAttribute()(from, to)).toBe(
      calcPexAttribute()(to) - calcPexAttribute()(from)
    );
  });

  it('uses custom maxValue in both directions', () => {
    const from = 3;
    const to = 7;
    const max = 5;
    expect(calcPexDiffAttribute(max)(from, to)).toBe(
      calcPexAttribute(max)(to) - calcPexAttribute(max)(from)
    );
  });
});

describe('calcPexDiffAbility', () => {
  it('equals calcPexAbility(to) - calcPexAbility(from)', () => {
    expect(calcPexDiffAbility()(1, 4)).toBe(
      calcPexAbility()(4) - calcPexAbility()(1)
    );
  });

  it('uses custom maxValue', () => {
    const max = 3;
    expect(calcPexDiffAbility(max)(1, 5)).toBe(
      calcPexAbility(max)(5) - calcPexAbility(max)(1)
    );
  });
});

describe('calcPexDiffWillpower', () => {
  it('equals calcPexWillpower(to) - calcPexWillpower(from)', () => {
    expect(calcPexDiffWillpower(3, 6)).toBe(
      calcPexWillpower(6) - calcPexWillpower(3)
    );
  });
});

describe('calcPexDiffPathOrVirtue', () => {
  it('equals calcPexPathOrVirtue(to) - calcPexPathOrVirtue(from)', () => {
    expect(calcPexDiffPathOrVirtue(2, 5)).toBe(
      calcPexPathOrVirtue(5) - calcPexPathOrVirtue(2)
    );
  });
});

describe('calcPexDiffInClanDiscipline', () => {
  it('equals calcPexInClanDiscipline(to) - calcPexInClanDiscipline(from)', () => {
    expect(calcPexDiffInClanDiscipline()(1, 3)).toBe(
      calcPexInClanDiscipline()(3) - calcPexInClanDiscipline()(1)
    );
  });

  it('uses custom maxValue', () => {
    const max = 4;
    expect(calcPexDiffInClanDiscipline(max)(2, 6)).toBe(
      calcPexInClanDiscipline(max)(6) - calcPexInClanDiscipline(max)(2)
    );
  });
});

describe('calcPexDiffOutOfClanDiscipline', () => {
  it('equals calcPexOutOfClanDiscipline(to) - calcPexOutOfClanDiscipline(from)', () => {
    expect(calcPexDiffOutOfClanDiscipline()(1, 3)).toBe(
      calcPexOutOfClanDiscipline()(3) - calcPexOutOfClanDiscipline()(1)
    );
  });

  it('uses custom maxValue', () => {
    const max = 4;
    expect(calcPexDiffOutOfClanDiscipline(max)(2, 6)).toBe(
      calcPexOutOfClanDiscipline(max)(6) - calcPexOutOfClanDiscipline(max)(2)
    );
  });
});

describe('calcPexDiffThaumaturgyPath', () => {
  it('equals calcPexThaumaturgyPath(to) - calcPexThaumaturgyPath(from)', () => {
    expect(calcPexDiffThaumaturgyPath(1, 3)).toBe(
      calcPexThaumaturgyPath(3) - calcPexThaumaturgyPath(1)
    );
  });
});

describe('calcPexDiffThaumaturgyRitual', () => {
  it('equals calcPexThaumaturgyRitual(to,multi) - calcPexThaumaturgyRitual(from,multi)', () => {
    const multi = 3;
    expect(calcPexDiffThaumaturgyRitual(1, 4, multi)).toBe(
      calcPexThaumaturgyRitual(4, multi) - calcPexThaumaturgyRitual(1, multi)
    );
  });

  it('returns 0 when multi=0', () => {
    expect(calcPexDiffThaumaturgyRitual(1, 5, 0)).toBe(0);
  });
});

describe('calcPexDiffSpecialty', () => {
  it('equals (max(1,to) - max(1,from)) * 2', () => {
    expect(calcPexDiffSpecialty(1, 3)).toBe(
      (Math.max(1, 3) - Math.max(1, 1)) * 2
    );
  });

  it('returns 0 when both from and to are ≤1', () => {
    expect(calcPexDiffSpecialty(0, 1)).toBe(0);
  });
});

describe('calcPexDiffAdvFlaw', () => {
  it('equals calcPexAdvFlaw(to,neg) - calcPexAdvFlaw(from,neg) with neg=false', () => {
    expect(calcPexDiffAdvFlaw(1, 3, false)).toBe(
      calcPexAdvFlaw(3, false) - calcPexAdvFlaw(1, false)
    );
  });

  it('equals calcPexAdvFlaw(to,neg) - calcPexAdvFlaw(from,neg) with neg=true', () => {
    expect(calcPexDiffAdvFlaw(1, 3, true)).toBe(
      calcPexAdvFlaw(3, true) - calcPexAdvFlaw(1, true)
    );
  });
});

describe('calcPexDiffHumanMagic', () => {
  it('equals calcPexHumanMagic(to) - calcPexHumanMagic(from)', () => {
    expect(calcPexDiffHumanMagic(1, 3)).toBe(
      calcPexHumanMagic(3) - calcPexHumanMagic(1)
    );
  });

  it('returns 0 when from and to are equal', () => {
    expect(calcPexDiffHumanMagic(3, 3)).toBe(0);
  });
});

describe('calcPexDiffTrueFaith', () => {
  it('equals calcPexTrueFaith(to) - calcPexTrueFaith(from)', () => {
    expect(calcPexDiffTrueFaith(1, 4)).toBe(
      calcPexTrueFaith(4) - calcPexTrueFaith(1)
    );
  });

  it('crosses the >5 boundary correctly', () => {
    expect(calcPexDiffTrueFaith(4, 6)).toBe(
      calcPexTrueFaith(6) - calcPexTrueFaith(4)
    );
  });
});

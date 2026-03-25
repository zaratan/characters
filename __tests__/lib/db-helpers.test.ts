import { describe, it, expect } from 'vitest';
import type { VampireType } from '../../types/VampireType';
import {
  deepMerge,
  filterUserIds,
  rowToVampire,
  vampireToRow,
} from '../../lib/db-helpers';

// ---------------------------------------------------------------------------
// deepMerge
// ---------------------------------------------------------------------------

describe('deepMerge', () => {
  it('merges top-level keys from both objects', () => {
    const result = deepMerge({ a: 1 }, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('recursively merges nested objects, preserving untouched keys', () => {
    const target = { infos: { name: 'Dracula', clan: 'Tzimisce' } };
    const source = { infos: { name: 'Alucard' } };
    const result = deepMerge(target, source);
    expect(result).toEqual({ infos: { name: 'Alucard', clan: 'Tzimisce' } });
  });

  it('replaces arrays rather than merging them', () => {
    const result = deepMerge({ health: [1, 2] }, { health: [3] });
    expect(result).toEqual({ health: [3] });
  });

  it('replaces primitive values', () => {
    const result = deepMerge({ a: 1 }, { a: 2 });
    expect(result).toEqual({ a: 2 });
  });

  it('handles null in source by replacing the target value', () => {
    const result = deepMerge({ a: { b: 1 } }, { a: null });
    expect(result).toEqual({ a: null });
  });

  it('handles deep nesting (3+ levels) preserving untouched keys', () => {
    const target = { a: { b: { c: 1, d: 2 }, e: 3 } };
    const source = { a: { b: { c: 10 } } };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: { b: { c: 10, d: 2 }, e: 3 } });
  });

  it('does not mutate the target object', () => {
    const target = { a: { b: 1 } };
    const source = { a: { b: 2 } };
    deepMerge(target, source);
    expect(target).toEqual({ a: { b: 1 } });
  });

  it('adds a key from source that is absent in target', () => {
    const result = deepMerge({ a: 1 }, { b: 2 });
    expect(result.b).toBe(2);
  });

  it('critical Mind.tsx scenario: updates bloodSpent, preserves health and tempWillpower', () => {
    const target = {
      mind: { health: [3, 3, 3], tempWillpower: 5, bloodSpent: 0 },
    };
    const source = { mind: { bloodSpent: 3 } };
    const result = deepMerge(target, source);
    expect(result).toEqual({
      mind: { health: [3, 3, 3], tempWillpower: 5, bloodSpent: 3 },
    });
  });

  it('returns a copy of target when source is empty', () => {
    const target = { a: 1 };
    const result = deepMerge(target, {});
    expect(result).toEqual({ a: 1 });
  });

  it('returns source keys when target is empty', () => {
    const result = deepMerge({}, { a: 1 });
    expect(result).toEqual({ a: 1 });
  });
});

// ---------------------------------------------------------------------------
// filterUserIds
// ---------------------------------------------------------------------------

describe('filterUserIds', () => {
  it('removes empty strings', () => {
    expect(filterUserIds(['user1', '', 'user2'])).toEqual(['user1', 'user2']);
  });

  it('deduplicates ids', () => {
    expect(filterUserIds(['user1', 'user1', 'user2'])).toEqual([
      'user1',
      'user2',
    ]);
  });

  it('removes falsy values like null or undefined if they sneak in', () => {
    const ids = ['user1', null as any, undefined as any, 'user2'];
    expect(filterUserIds(ids)).toEqual(['user1', 'user2']);
  });

  it('handles combined case: empty strings and duplicates', () => {
    expect(filterUserIds(['', 'user1', '', 'user1', 'user2'])).toEqual([
      'user1',
      'user2',
    ]);
  });

  it('returns an empty array for empty input', () => {
    expect(filterUserIds([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// rowToVampire
// ---------------------------------------------------------------------------

describe('rowToVampire', () => {
  it('spreads row.data and adds id, privateSheet, editors, viewers', () => {
    const row = {
      id: 'abc-123',
      private_sheet: true,
      data: { name: 'Dracula', generation: 8 },
    };
    const result = rowToVampire(row, ['editor1'], ['viewer1']);
    expect(result).toEqual({
      name: 'Dracula',
      generation: 8,
      id: 'abc-123',
      privateSheet: true,
      editors: ['editor1'],
      viewers: ['viewer1'],
    });
  });

  it('handles empty editors and viewers arrays', () => {
    const row = {
      id: 'abc-123',
      private_sheet: false,
      data: { name: 'Lestat' },
    };
    const result = rowToVampire(row, [], []);
    expect(result.editors).toEqual([]);
    expect(result.viewers).toEqual([]);
  });

  it('row.id takes precedence over any id field in row.data', () => {
    const row = {
      id: 'real-id',
      private_sheet: false,
      data: { id: 'stale-id', name: 'Test' },
    };
    const result = rowToVampire(row, [], []);
    expect(result.id).toBe('real-id');
  });
});

// ---------------------------------------------------------------------------
// vampireToRow
// ---------------------------------------------------------------------------

describe('vampireToRow', () => {
  it('extracts privateSheet, editors, viewers and stringifies the rest as data', () => {
    const vampire = {
      id: 'abc-123',
      privateSheet: true,
      editors: ['editor1'],
      viewers: ['viewer1'],
      name: 'Dracula',
      generation: 8,
    } as unknown as VampireType;
    const result = vampireToRow(vampire);
    expect(result.privateSheet).toBe(true);
    expect(result.editors).toEqual(['editor1']);
    expect(result.viewers).toEqual(['viewer1']);
    const data = JSON.parse(result.data);
    expect(data).toEqual({ name: 'Dracula', generation: 8 });
  });

  it('defaults privateSheet to false when undefined', () => {
    const result = vampireToRow({ name: 'Test' } as unknown as VampireType);
    expect(result.privateSheet).toBe(false);
  });

  it('defaults editors to empty array when undefined', () => {
    const result = vampireToRow({ name: 'Test' } as unknown as VampireType);
    expect(result.editors).toEqual([]);
  });

  it('defaults viewers to empty array when undefined', () => {
    const result = vampireToRow({ name: 'Test' } as unknown as VampireType);
    expect(result.viewers).toEqual([]);
  });

  it('data JSON does not contain id, editors, viewers, or privateSheet', () => {
    const vampire = {
      id: 'abc-123',
      privateSheet: false,
      editors: ['editor1'],
      viewers: ['viewer1'],
      name: 'Lestat',
    } as unknown as VampireType;
    const result = vampireToRow(vampire);
    const data = JSON.parse(result.data);
    expect(data).not.toHaveProperty('id');
    expect(data).not.toHaveProperty('appId');
    expect(data).not.toHaveProperty('editors');
    expect(data).not.toHaveProperty('viewers');
    expect(data).not.toHaveProperty('privateSheet');
  });
});

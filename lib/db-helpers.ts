import type { VampireType } from '../types/VampireType';

// Deep merge two objects recursively.
// Objects are merged key-by-key; arrays and primitives are replaced.
// Matches FaunaDB q.Update() semantics (recursive merge, not shallow).
export function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// Filter out empty/falsy user_ids and deduplicate.
export function filterUserIds(ids: string[]): string[] {
  return Array.from(new Set(ids.filter((id) => id)));
}

export function rowToVampire(
  row: any,
  editors: string[],
  viewers: string[]
): VampireType {
  return {
    ...row.data,
    id: row.id,
    privateSheet: row.private_sheet,
    editors,
    viewers,
  };
}

export function vampireToRow(vampire: any): {
  privateSheet: boolean;
  editors: string[];
  viewers: string[];
  data: string;
} {
  const {
    privateSheet,
    editors,
    viewers,
    id: _id,
    appId: _appId,
    ...rest
  } = vampire;
  return {
    privateSheet: privateSheet ?? false,
    editors: editors ?? [],
    viewers: viewers ?? [],
    data: JSON.stringify(rest),
  };
}

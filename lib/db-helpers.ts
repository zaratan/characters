import type { VampireType } from '../types/VampireType';

// Deep merge two objects recursively.
// Objects are merged key-by-key; arrays and primitives are replaced.
// Matches FaunaDB q.Update() semantics (recursive merge, not shallow).
export function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>
      );
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
  row: Record<string, unknown>,
  editors: string[],
  viewers: string[]
): VampireType {
  return {
    ...(row.data as Record<string, unknown>),
    id: row.id as string,
    privateSheet: row.private_sheet as boolean,
    editors,
    viewers,
  } as VampireType;
}

export function vampireToRow(vampire: VampireType): {
  privateSheet: boolean;
  editors: string[];
  viewers: string[];
  data: string;
} {
  const { privateSheet, editors, viewers, id: _id, ...rest } = vampire;
  return {
    privateSheet: privateSheet ?? false,
    editors: editors ?? [],
    viewers: viewers ?? [],
    data: JSON.stringify(rest),
  };
}

import { describe, it, expect } from 'vitest';
import { GET } from '../../../../app/api/data/disciplines/route';
// ---------------------------------------------------------------------------
// Disciplines API — integration-light tests (reads real JSON files from data/)
// ---------------------------------------------------------------------------
// No mocks needed: the route handler reads files via fs.readFileSync using
// process.cwd(), which resolves to the project root in vitest (node env).

describe('GET /api/data/disciplines', () => {
  it('returns 200 with both disciplines and disciplinesCombi arrays', async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(body.disciplines)).toBe(true);
    expect(Array.isArray(body.disciplinesCombi)).toBe(true);
    expect(body.disciplines.length).toBeGreaterThan(0);
    expect(body.disciplinesCombi.length).toBeGreaterThan(0);
  });

  it('disciplines entries have name and url fields', async () => {
    const response = await GET();
    const { disciplines } = await response.json();

    for (const disc of disciplines) {
      expect(disc).toHaveProperty('name');
      expect(typeof disc.name).toBe('string');
      expect(disc).toHaveProperty('url');
      expect(disc.url).toMatch(/^https:\/\/wod\.zaratan\.fr\/powers\//);
    }
  });

  it('combo disciplines have URLs matching the combo power URL pattern', async () => {
    const response = await GET();
    const { disciplinesCombi } = await response.json();

    for (const combo of disciplinesCombi) {
      expect(combo).toHaveProperty('name');
      expect(combo).toHaveProperty('url');
      // Pattern: https://wod.zaratan.fr/powers/combo#power-<slug>-<n>
      expect(combo.url).toMatch(
        /^https:\/\/wod\.zaratan\.fr\/powers\/combo#power-.+/
      );
    }
  });

  it('slugifies combo discipline names to lowercase in the URL', async () => {
    const response = await GET();
    const { disciplinesCombi } = await response.json();

    for (const combo of disciplinesCombi) {
      const fragment = combo.url.split('#power-')[1];
      // The fragment should be all lowercase (slugify output is lowercase)
      expect(fragment).toBe(fragment.toLowerCase());
      // The fragment should not contain spaces
      expect(fragment).not.toContain(' ');
    }
  });
});

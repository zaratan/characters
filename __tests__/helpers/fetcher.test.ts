import { describe, it, expect, vi, afterEach } from 'vitest';
import { FetchError, fetcher } from '../../helpers/fetcher';

afterEach(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// FetchError
// ---------------------------------------------------------------------------

describe('FetchError', () => {
  it('sets name, status, and info on construction', () => {
    const error = new FetchError('Something went wrong', 404, {
      detail: 'Not found',
    });
    expect(error.name).toBe('FetchError');
    expect(error.status).toBe(404);
    expect(error.info).toEqual({ detail: 'Not found' });
  });

  it('is an instance of Error', () => {
    const error = new FetchError('Oops', 500, null);
    expect(error).toBeInstanceOf(Error);
  });

  it('uses the provided message as error message', () => {
    const error = new FetchError('Custom message', 400, null);
    expect(error.message).toBe('Custom message');
  });
});

// ---------------------------------------------------------------------------
// fetcher
// ---------------------------------------------------------------------------

describe('fetcher', () => {
  it('returns parsed JSON when response is ok', async () => {
    const data = { id: 1, name: 'Dracula' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(data),
      })
    );

    const result = await fetcher('https://example.com/api');
    expect(result).toEqual(data);
  });

  it('passes init options through to fetch', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', mockFetch);

    const init: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };
    await fetcher('https://example.com/api', init);

    expect(mockFetch).toHaveBeenCalledWith('https://example.com/api', init);
  });

  it('throws FetchError with status and parsed JSON info on error response', async () => {
    const errorBody = { message: 'Not found' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve(errorBody),
        text: () => Promise.resolve('Not found'),
      })
    );

    await expect(fetcher('https://example.com/api')).rejects.toMatchObject({
      name: 'FetchError',
      status: 404,
      info: errorBody,
    });
  });

  it('uses text fallback for info when json() rejects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('not json')),
        text: () => Promise.resolve('Internal Server Error'),
      })
    );

    await expect(fetcher('https://example.com/api')).rejects.toMatchObject({
      status: 500,
      info: 'Internal Server Error',
    });
  });

  it('sets info to null when both json() and text() reject', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: () => Promise.reject(new Error('not json')),
        text: () => Promise.reject(new Error('not text')),
      })
    );

    await expect(fetcher('https://example.com/api')).rejects.toMatchObject({
      status: 503,
      info: null,
    });
  });

  it('throws a FetchError (not a plain Error) on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'bad request' }),
        text: () => Promise.resolve('bad request'),
      })
    );

    let thrown: unknown;
    try {
      await fetcher('https://example.com/api');
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeInstanceOf(FetchError);
  });
});

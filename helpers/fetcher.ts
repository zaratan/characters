export class FetchError extends Error {
  status: number;
  info: unknown;

  constructor(message: string, status: number, info: unknown) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
    this.info = info;
  }
}

export const fetcher = async (entry: RequestInfo, init?: RequestInit) => {
  const res = await fetch(entry, init);
  if (!res.ok) {
    let info: unknown;
    try {
      info = await res.json();
    } catch {
      info = await res.text().catch(() => null);
    }
    throw new FetchError(`Erreur HTTP ${res.status}`, res.status, info);
  }
  return res.json();
};

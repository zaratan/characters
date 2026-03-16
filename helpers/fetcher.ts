export const fetcher = (entry: RequestInfo, init?: RequestInit) =>
  fetch(entry, init).then((res) => res.json());

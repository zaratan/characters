import fetch from 'unfetch';
import nfetch from 'node-fetch';

export const fetcher = (entry: RequestInfo, init?: RequestInit) =>
  fetch(entry, init).then((res) => res.json());

export const nodeFetcher = (entry: RequestInfo, init?: RequestInit) =>
  nfetch(entry, init).then((res) => res.json());

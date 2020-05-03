import fetch from 'unfetch';
import nfetch from 'node-fetch';
import { IncomingMessage } from 'http';

export const fetcher = (entry: RequestInfo, init?: RequestInit) =>
  fetch(entry, init).then((res) => res.json());

export const nodeFetcher = (entry: RequestInfo, init?: RequestInit) =>
  nfetch(entry, init).then((res) => res.json());

export const host = (req: IncomingMessage) =>
  `http${process.env.NOW_GITHUB_ORG ? 's' : ''}://${req.headers.host}`;

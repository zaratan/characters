/* eslint-disable @typescript-eslint/no-empty-function */
import React, {
  createContext,
  ReactNode,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { v4 as uuid } from 'uuid';
import Pusher from 'pusher-js';

// eslint-disable-next-line global-require
const pusher = () => require('../helpers/pusherClient');

type ContextType = { appId: string; pusherClient: Pusher };

const defaultContext: ContextType = { appId: '', pusherClient: null };
const SystemContext = createContext(defaultContext);
export const SystemProvider = ({ children }: { children: ReactNode }) => {
  // Keeping the same websocket over page change
  const [pusherClient, setPusherClient] = useState<Pusher | null>(null);
  useEffect(
    // pusher need a window object and doesn't play well with SSR
    () =>
      typeof window !== 'undefined'
        ? setPusherClient(pusher().pusherClient())
        : null,
    []
  );
  const context: ContextType = {
    appId: uuid(),
    pusherClient,
  };
  return (
    <SystemContext.Provider value={context}>{children}</SystemContext.Provider>
  );
};

export default SystemContext;

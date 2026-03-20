'use client';

import type { ReactNode } from 'react';
import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import type Pusher from 'pusher-js';

const pusher = () => require('../helpers/pusherClient');

type ContextType = {
  appId: string;
  pusherClient?: Pusher;
  pusherState?: string;
  needPusherFallback: boolean;
};

const defaultContext: ContextType = {
  appId: '',
  pusherClient: undefined,
  pusherState: undefined,
  needPusherFallback: false,
};
const SystemContext = createContext(defaultContext);
export const SystemProvider = ({ children }: { children: ReactNode }) => {
  // Keeping the same websocket over page change
  const pusherClient = useRef<Pusher | null>(null);
  const [pusherState, setPusherState] = useState('');
  const [needPusherFallback, setNeedPusherFallback] = useState(false);
  const appId = useMemo(() => crypto.randomUUID(), []);
  useEffect(
    // pusher need a window object and doesn't play well with SSR
    () => {
      if (typeof window !== 'undefined') {
        const client: Pusher = pusher().pusherClient();
        setPusherState(client?.connection?.state);
        setNeedPusherFallback(!client);

        const handler = (states: { previous: string; current: string }) => {
          setPusherState(states.current);
          setNeedPusherFallback(
            states.current !== 'connected' && states.current !== 'connecting'
          );
        };

        client.connection.bind('state_change', handler);
        pusherClient.current = client;

        return () => {
          client.connection.unbind('state_change', handler);
          client.disconnect();
        };
      }
    },
    []
  );
  const context: ContextType = useMemo(
    () => ({
      appId,
      pusherClient: pusherClient.current ?? undefined,
      pusherState,
      needPusherFallback,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pusherState]
  );
  return (
    <SystemContext.Provider value={context}>{children}</SystemContext.Provider>
  );
};

export default SystemContext;

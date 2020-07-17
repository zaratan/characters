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

type ContextType = {
  appId: string;
  pusherClient?: Pusher;
  pusherState?: string;
  needPusherFallback: boolean;
};

const defaultContext: ContextType = {
  appId: '',
  pusherClient: null,
  pusherState: null,
  needPusherFallback: false,
};
const SystemContext = createContext(defaultContext);
export const SystemProvider = ({ children }: { children: ReactNode }) => {
  // Keeping the same websocket over page change
  const [pusherClient, setPusherClient] = useState<Pusher | null>(null);
  const [pusherState, setPusherState] = useState('');
  const [needPusherFallback, setNeedPusherFallback] = useState(false);
  useEffect(
    // pusher need a window object and doesn't play well with SSR
    () => {
      if (typeof window !== 'undefined') {
        const client: Pusher = pusher().pusherClient();
        setPusherState(client.connection.state);
        client.connection.bind(
          'state_change',
          (states: { previous: string; current: string }) => {
            setPusherState(states.current);
            setNeedPusherFallback(
              states.current !== 'connected' && states.current !== 'connecting'
            );
          }
        );
        setPusherClient(client);
      }
    },
    []
  );
  const context: ContextType = {
    appId: uuid(),
    pusherClient,
    pusherState,
    needPusherFallback,
  };
  return (
    <SystemContext.Provider value={context}>{children}</SystemContext.Provider>
  );
};

export default SystemContext;

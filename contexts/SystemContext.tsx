import React, {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useMemo,
  useRef,
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
  const pusherClient = useRef<Pusher | null>(null);
  const [pusherState, setPusherState] = useState('');
  const [needPusherFallback, setNeedPusherFallback] = useState(false);
  const appId = useMemo(uuid, []);
  useEffect(
    // pusher need a window object and doesn't play well with SSR
    () => {
      if (typeof window !== 'undefined') {
        const client: Pusher = pusher().pusherClient();
        setPusherState(client?.connection?.state);
        setNeedPusherFallback(!client);
        client.connection.bind(
          'state_change',
          (states: { previous: string; current: string }) => {
            setPusherState(states.current);
            setNeedPusherFallback(
              states.current !== 'connected' && states.current !== 'connecting'
            );
          }
        );
        pusherClient.current = client;
      }
    },
    []
  );
  const context: ContextType = useMemo(
    () => ({
      appId,
      pusherClient: pusherClient.current,
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

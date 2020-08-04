import React, { useEffect, useContext } from 'react';
import { subscribeToSheets } from '../../helpers/pusherClient';
import { sheetsChannel } from '../../helpers/pusherConst';
import SystemContext from '../../contexts/SystemContext';

const PusherSheetsListener = ({ callback }: { callback: () => void }) => {
  const { appId, pusherClient } = useContext(SystemContext);
  useEffect(() => {
    if (pusherClient === null) return;
    const { channel, client } = subscribeToSheets({
      callback: (data) => {
        if (data.appId === appId) return;

        callback();
      },
      client: pusherClient,
    });
    return () => {
      channel.unbind(null, callback);
      client.unsubscribe(sheetsChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, pusherClient]);
  return <></>;
};

export default PusherSheetsListener;

import React, { useEffect, useContext } from 'react';
import { subscribeToSheets } from '../../helpers/pusherClient';
import { sheetsChannel } from '../../helpers/pusherConst';
import SystemContext from '../../contexts/SystemContext';

const PusherSheetsListener = ({ callback }: { callback: () => void }) => {
  const { appId } = useContext(SystemContext);
  useEffect(() => {
    const { channel, client } = subscribeToSheets((data) => {
      if (data.appId === appId) return;

      callback();
    });
    return () => {
      channel.unbind(null, callback);
      client.unsubscribe(sheetsChannel);
    };
  }, [appId, callback]);
  return <></>;
};

export default PusherSheetsListener;

import React, { useEffect, useContext } from 'react';
import { subscribeToSheet } from '../../helpers/pusherClient';
import { sheetChannel } from '../../helpers/pusherConst';
import SystemContext from '../../contexts/SystemContext';

const PusherSheetListener = ({
  id,
  callback,
}: {
  id: string;
  callback: () => void;
}) => {
  const { appId, pusherClient } = useContext(SystemContext);
  useEffect(() => {
    if (pusherClient === null) return;
    const { client, channel } = subscribeToSheet({
      id,
      callback: (data) => {
        if (data.appId === appId) return;
        callback();
      },
      client: pusherClient,
    });
    return () => {
      channel.unbind(null, callback);
      client.unsubscribe(sheetChannel(id));
    };
  }, [id, appId, callback, pusherClient]);
  return <></>;
};

export default PusherSheetListener;

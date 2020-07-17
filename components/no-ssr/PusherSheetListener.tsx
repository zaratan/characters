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
  const { appId } = useContext(SystemContext);
  useEffect(() => {
    const { client, channel } = subscribeToSheet(id, (data) => {
      if (data.appId === appId) return;
      callback();
    });
    return () => {
      channel.unbind(null, callback);
      client.unsubscribe(sheetChannel(id));
    };
  }, [id, appId, callback]);
  return <div className="pusher" />;
};

export default PusherSheetListener;

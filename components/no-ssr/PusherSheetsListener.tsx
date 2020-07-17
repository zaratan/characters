import React, { useEffect } from 'react';
import { subscribeToSheets } from '../../helpers/pusherClient';
import { sheetsChannel } from '../../helpers/pusherConst';

const PusherSheetsListener = ({ callback }: { callback: () => void }) => {
  useEffect(() => {
    const { channel, client, bind } = subscribeToSheets(callback);
    return () => {
      console.log('DEAD: SHEETS:', bind);

      // channel.unbind();
      // client.unsubscribe(sheetsChannel);
    };
  }, []);
  return <></>;
};

export default PusherSheetsListener;

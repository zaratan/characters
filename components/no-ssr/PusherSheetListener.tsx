import React, { useEffect } from 'react';
import { subscribeToSheet } from '../../helpers/pusherClient';
import { sheetChannel } from '../../helpers/pusherConst';

const PusherSheetListener = ({
  id,
  callback,
}: {
  id: string;
  callback: () => void;
}) => {
  useEffect(() => {
    console.log('EFECT START');

    const { client, channel, bind } = subscribeToSheet(id, callback);
    return () => {
      console.log('DEAD: SHEET', bind);
      // channel.unbind();
      // client.unsubscribe(sheetChannel(id));
    };
  }, [id]);
  return <div />;
};

export default PusherSheetListener;

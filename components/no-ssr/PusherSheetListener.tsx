import { useEffect, useContext } from 'react';
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
        if ((data as Record<string, unknown>).appId === appId) return;
        callback();
      },
      client: pusherClient,
    });
    return () => {
      channel.unbind(undefined, callback);
      client.unsubscribe(sheetChannel(id));
    };
    // callback is intentionally omitted: re-subscribing on every render would
    // create subscription churn; the latest callback is always called directly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, appId, pusherClient]);
  return <></>;
};

export default PusherSheetListener;

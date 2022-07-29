import PusherClient from 'pusher-js/with-encryption';
import { sheetsChannel, sheetChannel, UPDATE_EVENT } from './pusherConst';

export const pusherClient = () =>
  new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  });

export const subscribeToSheets = ({
  callback,
  client = pusherClient(),
}: {
  callback: (data: any) => void;
  client?: PusherClient;
}) => {
  const channel = client.subscribe(sheetsChannel);
  const bind = channel.bind(UPDATE_EVENT, callback);

  return { client, channel, bind };
};

export const subscribeToSheet = ({
  id,
  callback,
  client = pusherClient(),
}: {
  id: string;
  callback: (data: any) => void;
  client?: PusherClient;
}) => {
  const channel = client.subscribe(sheetChannel(id));
  const bind = channel.bind(UPDATE_EVENT, callback);

  return { client, channel, bind };
};

import PusherClient from 'pusher-js/with-encryption';
import { sheetsChannel, sheetChannel, UPDATE_EVENT } from './pusherConst';

export const pusherClient = () =>
  new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  });

export const subscribeToSheets = (callback: (data: any) => void) => {
  const client = pusherClient();
  const channel = client.subscribe(sheetsChannel);
  const bind = channel.bind(UPDATE_EVENT, callback);

  return { client, channel, bind };
};

export const subscribeToSheet = (id: string, callback: (data: any) => void) => {
  const client = pusherClient();
  const channel = client.subscribe(sheetChannel(id));
  const bind = client.channel.bind(UPDATE_EVENT, callback);

  return { client, channel, bind };
};

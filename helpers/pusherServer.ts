import Pusher from 'pusher';
import { sheetsChannel, UPDATE_EVENT, sheetChannel } from './pusherConst';

export const pusherServer = () =>
  new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    useTLS: true,
  });

export const updateOnSheets = (appId: string) => {
  pusherServer().trigger(sheetsChannel, UPDATE_EVENT, { appId });
};

export const updateOnSheet = (id: string, appId: string) => {
  console.log('UPDATE', sheetChannel(id));
  const result = pusherServer().trigger(sheetChannel(id), UPDATE_EVENT, {
    appId,
  });
  console.log(result);
};

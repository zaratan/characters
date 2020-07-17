import Pusher from 'pusher';
import { sheetsChannel, UPDATE_EVENT, sheetChannel } from './pusherConst';
import { pusherClient } from './pusherClient';

export const pusherServer = () =>
  new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    useTLS: true,
  });

export const updateOnSheets = () => {
  pusherServer().trigger(sheetsChannel, UPDATE_EVENT, {});
};

export const updateOnSheet = (id: string) => {
  pusherServer().trigger(sheetChannel(id), UPDATE_EVENT, {});
};

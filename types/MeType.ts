// {
//   "error": "not_authenticated",
//   "description": "The user does not have an active session or is not authenticated"
//   }
export type NotAuthMeType = {
  error: string;
  description: string;
};
// {
// "nickname": "denis.pasin+lol",
// "name": "denis.pasin+lol@gmail.com",
// "picture": "https://s.gravatar.com/avatar/5820265b80155a0026ea433eb0f67741?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fde.png",
// "updated_at": "2020-05-07T10:56:50.544Z",
// "email": "denis.pasin+lol@gmail.com",
// "email_verified": false,
// "sub": "auth0|5eb3e9726401630bf4c77c70"
// }
export type AuthMeType = {
  nickname: string;
  name: string;
  picture: string;
  // eslint-disable-next-line camelcase
  updated_at: string;
  email: string;
  // eslint-disable-next-line camelcase
  email_verified: boolean;
  sub: string;
  error: undefined;
};

export type RawMeType = NotAuthMeType | AuthMeType;

export type MeType =
  | (NotAuthMeType & { auth: false })
  | (AuthMeType & { auth: true });

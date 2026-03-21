export type TempElemType<T> = {
  value: T;
  baseValue: T;
  set: (value: T, id?: string) => void;
};

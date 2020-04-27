export interface TempElemType<T> {
  value: T;
  baseValue: T;
  set: (value: T) => void;
}

import { useState, useEffect } from 'react';
import useChangeWatcher from './useChangeWatcher';

type useStateWithChangesAndTrackerType = <T>(
  defaultValue: T,
  key: string,
  options?: { keepInChangeTracker?: boolean }
) => [{ val: T; changed: boolean }, (newValue: T) => void];

type useStateWithTrackerType = <T>(
  defaultValue: T,
  key: string,
  options?: {
    keepInChangeTracker?: boolean;
  }
) => [T, (newValue: T) => void];

const useStateWithTracker: useStateWithTrackerType = (
  defaultValue,
  key,
  { keepInChangeTracker = true } = {
    keepInChangeTracker: true,
  }
) => {
  const [tmpValue, setTmpValue] = useState(defaultValue);
  useEffect(() => {
    setTmpValue(defaultValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(defaultValue)]);

  const setter = setTmpValue;

  const generateSetter = useChangeWatcher();
  const setTmpValueWithChangeTracker = keepInChangeTracker
    ? generateSetter(setter, tmpValue, defaultValue, key, true)
    : setter;

  return [tmpValue, setTmpValueWithChangeTracker];
};

export const useStateWithChangesAndTracker: useStateWithChangesAndTrackerType = (
  defaultValue,
  key,
  { keepInChangeTracker = true } = {
    keepInChangeTracker: true,
  }
) => {
  const [tmpValue, setTmpValue] = useState({
    val: defaultValue,
    changed: false,
  });
  useEffect(() => {
    setTmpValue({ val: defaultValue, changed: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(defaultValue)]);

  const setter = setTmpValue;

  const generateSetter = useChangeWatcher();
  const setTmpValueWithChangeTracker = keepInChangeTracker
    ? generateSetter(setter, tmpValue, defaultValue, key)
    : setter;

  return [tmpValue, setTmpValueWithChangeTracker];
};

export default useStateWithTracker;

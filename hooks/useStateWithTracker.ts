import { useState, useEffect, useRef } from 'react';
import useChangeWatcher from './useChangeWatcher';

type useStateWithChangesAndTrackerType = <T>(
  defaultValue: T,
  key: string,
  options?: {
    keepInChangeTracker?: boolean;
    pexCostCalc?: (oldVal: number, newVal: number) => number;
  }
) => [{ val: T; changed: boolean }, (newValue: T) => void];

type useStateWithTrackerType = <T>(
  defaultValue: T,
  key: string,
  options?: {
    keepInChangeTracker?: boolean;
    pexCostCalc?: (oldVal: number, newVal: number) => number;
  }
) => [T, (newValue: T) => void];

const useStateWithTracker: useStateWithTrackerType = (
  defaultValue,
  key,
  { keepInChangeTracker = true, pexCostCalc } = {
    keepInChangeTracker: true,
  }
) => {
  const [tmpValue, setTmpValue] = useState(defaultValue);

  const defaultRef = useRef(defaultValue);
  if (JSON.stringify(defaultRef.current) !== JSON.stringify(defaultValue)) {
    defaultRef.current = defaultValue;
  }

  useEffect(() => {
    setTmpValue(defaultRef.current);
  }, [defaultRef.current]); // eslint-disable-line react-hooks/exhaustive-deps

  const setter = setTmpValue;

  const generateSetter = useChangeWatcher();
  const setTmpValueWithChangeTracker = keepInChangeTracker
    ? generateSetter(setter, tmpValue, defaultValue, key, pexCostCalc, true)
    : setter;

  return [tmpValue, setTmpValueWithChangeTracker];
};

export const useStateWithChangesAndTracker: useStateWithChangesAndTrackerType =
  (
    defaultValue,
    key,
    { keepInChangeTracker = true, pexCostCalc } = {
      keepInChangeTracker: true,
    }
  ) => {
    const [tmpValue, setTmpValue] = useState({
      val: defaultValue,
      changed: false,
    });

    const defaultRef = useRef(defaultValue);
    if (JSON.stringify(defaultRef.current) !== JSON.stringify(defaultValue)) {
      defaultRef.current = defaultValue;
    }

    useEffect(() => {
      if (tmpValue.changed) return;
      setTmpValue({ val: defaultRef.current, changed: false });
    }, [defaultRef.current, tmpValue.changed]); // eslint-disable-line react-hooks/exhaustive-deps

    const setter = setTmpValue;

    const generateSetter = useChangeWatcher();
    const setTmpValueWithChangeTracker = keepInChangeTracker
      ? generateSetter(setter, tmpValue, defaultValue, key, pexCostCalc, false)
      : setter;

    return [tmpValue, setTmpValueWithChangeTracker];
  };

export default useStateWithTracker;

import { useContext } from 'react';
import ModificationsContext from '../contexts/ModificationsContext';

const useChangeWatcher = () => {
  const { addChange } = useContext(ModificationsContext);
  const generateSetter =
    (
      setter,
      oldValue,
      baseValue,
      key,
      pexCostCalc?: (oldValue: number, newValue: number) => number,
      noChanged = false
    ) =>
    (newValue) => {
      addChange({
        key: `${key}-value`,
        value: newValue,
        baseValue,
        rollback: () => {
          setter(oldValue);
        },
        pexCost: pexCostCalc ? pexCostCalc(oldValue, newValue) : 0,
      });
      if (noChanged) {
        setter(newValue);
      } else {
        setter({ val: newValue, changed: true });
      }
    };
  return generateSetter;
};

export default useChangeWatcher;

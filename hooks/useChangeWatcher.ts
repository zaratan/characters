import { useContext } from 'react';
import ModificationsContext from '../contexts/ModificationsContext';

const useChangeWatcher = () => {
  const { addChange } = useContext(ModificationsContext);
  const generateSetter = (
    setter,
    oldValue,
    baseValue,
    key,
    noChanged = false
  ) => (newValue) => {
    addChange({
      key: `${key}-value`,
      value: newValue,
      baseValue,
      rollback: () => {
        setter(oldValue);
      },
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

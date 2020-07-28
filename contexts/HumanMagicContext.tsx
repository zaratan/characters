/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import produce from 'immer';
import { TempElemType } from '../types/TempElemType';

type ContextType = {
  psy: Array<TempPowerType>;
  staticMagic: Array<TempPowerType>;
  theurgy: Array<TempPowerType>;
  addNewPsy: () => string;
  removePsy: (id: string) => void;
  addNewStatic: () => string;
  removeStatic: (id: string) => void;
  addNewTheurgy: () => string;
  removeTheurgy: (id: string) => void;
};

export type RitualType = {
  key: string;
  title: string;
  value: number;
};

export type PowerType = {
  key: string;
  title: string;
  value: number;
  hasRitual: boolean;
  rituals: Array<RitualType>;
};

export type HumanMagicType = {
  psy: Array<PowerType>;
  staticMagic: Array<PowerType>;
  theurgy: Array<PowerType>;
};

export interface TempRitualType extends TempElemType<number> {
  setTitle: (newTitle: string) => void;
  title: string;
  key: string;
}

export interface TempPowerType extends TempElemType<number> {
  setTitle: (newTitle: string) => void;
  title: string;
  key: string;
  hasRitual: boolean;
  rituals: Array<TempRitualType>;
  toggleRituals: () => void;
  addNewRitual: () => string;
  removeRitual: (id: string) => void;
}

const defaultContext: ContextType = {
  psy: [],
  staticMagic: [],
  theurgy: [],
  addNewPsy: () => {
    console.error('Default Context used');
    return '';
  },
  removePsy: () => {
    console.error('Default Context used');
  },
  addNewStatic: () => {
    console.error('Default Context used');
    return '';
  },
  removeStatic: () => {
    console.error('Default Context used');
  },
  addNewTheurgy: () => {
    console.error('Default Context used');
    return '';
  },
  removeTheurgy: () => {
    console.error('Default Context used');
  },
};

const HumanMagicContext = createContext(defaultContext);

const createNewRitual: () => RitualType = () => ({
  key: uuid(),
  title: '',
  value: 0,
});

const createNewPower: () => PowerType = () => ({
  hasRitual: false,
  key: uuid(),
  rituals: [],
  title: '',
  value: 0,
});

const generatePowerContext = (
  tmpPowers: { val: Array<PowerType>; changed: boolean },
  powers: Array<PowerType>,
  setter: (value) => void
) =>
  tmpPowers.val.map((power) => {
    const basePower = powers.find((basePwr) => basePwr.key === power.key);

    const addNewRitual = () => {
      const newRitual = createNewRitual();
      setter(
        produce(tmpPowers, (nextState) => {
          nextState.val
            .find((pwr) => pwr.key === power.key)
            .rituals.push(newRitual);
          nextState.changed = true;
        })
      );
      return newRitual.key;
    };

    const removeRitual = (key: string) => {
      setter(
        produce(tmpPowers, (nextState) => {
          nextState.val.find(
            (pwr) => pwr.key === power.key
          ).rituals = power.rituals.filter((ritual) => ritual.key !== key);
          nextState.changed = true;
        })
      );
    };

    const set = (newVal: number) => {
      setter(
        produce(tmpPowers, (nextState) => {
          nextState.val.find((pwr) => pwr.key === power.key).value = newVal;
          nextState.changed = true;
        })
      );
    };

    const setTitle = (newTitle: string) => {
      setter(
        produce(tmpPowers, (nextState) => {
          nextState.val.find((pwr) => pwr.key === power.key).title = newTitle;
          nextState.changed = true;
        })
      );
    };

    const toggleRituals = () => {
      setter(
        produce(tmpPowers, (nextState) => {
          nextState.val.find(
            (pwr) => pwr.key === power.key
          ).hasRitual = !power.hasRitual;
          nextState.changed = true;
        })
      );
    };

    const rituals: Array<TempRitualType> = power.rituals.map((ritual) => ({
      ...ritual,
      baseValue:
        basePower?.rituals?.find((baseRitual) => baseRitual.key === ritual.key)
          ?.value || 0,
      setTitle: (newTitle: string) => {
        setter(
          produce(tmpPowers, (nextState) => {
            nextState.val
              .find((pwr) => pwr.key === power.key)
              .rituals.find((rtl) => rtl.key === ritual.key).title = newTitle;
            nextState.changed = true;
          })
        );
      },
      set: (newValue: number) => {
        setter(
          produce(tmpPowers, (nextState) => {
            nextState.val
              .find((pwr) => pwr.key === power.key)
              .rituals.find((rtl) => rtl.key === ritual.key).value = newValue;
            nextState.changed = true;
          })
        );
      },
    }));

    return {
      ...power,
      baseValue: basePower?.value || 0,
      rituals,
      addNewRitual,
      removeRitual,
      set,
      setTitle,
      toggleRituals,
    };
  });

export const HumanMagicProvider = ({
  children,
  psy = [],
  staticMagic = [],
  theurgy = [],
}: {
  children: ReactNode;
  psy: Array<PowerType>;
  staticMagic: Array<PowerType>;
  theurgy: Array<PowerType>;
}) => {
  // Psy state
  const [tmpPsy, setTmpPsy] = useState({ val: psy, changed: false });
  useEffect(() => {
    if (tmpPsy.changed) return;
    setTmpPsy({ val: psy, changed: false });
  }, [JSON.stringify(psy)]);

  // StaticMagic state
  const [tmpStaticMagic, setTmpStaticMagic] = useState({
    val: staticMagic,
    changed: false,
  });
  useEffect(() => {
    if (tmpStaticMagic.changed) return;
    setTmpStaticMagic({ val: staticMagic, changed: false });
  }, [JSON.stringify(staticMagic)]);

  // Theurgy state
  const [tmpTheurgy, setTmpTheurgy] = useState({
    val: theurgy,
    changed: false,
  });
  useEffect(() => {
    if (tmpTheurgy.changed) return;
    setTmpTheurgy({ val: theurgy, changed: false });
  }, [JSON.stringify(theurgy)]);

  const addNewPsy = () => {
    const newPsy = createNewPower();
    setTmpPsy({ val: [...tmpPsy.val, newPsy], changed: true });
    return newPsy.key;
  };

  const removePsy = (key: string) => {
    setTmpPsy({
      val: tmpPsy.val.filter((pwr) => pwr.key !== key),
      changed: true,
    });
  };
  const addNewStatic = () => {
    const newStatic = createNewPower();
    setTmpStaticMagic({
      val: [...tmpStaticMagic.val, newStatic],
      changed: true,
    });
    return newStatic.key;
  };

  const removeStatic = (key: string) => {
    setTmpStaticMagic({
      val: tmpStaticMagic.val.filter((pwr) => pwr.key !== key),
      changed: true,
    });
  };
  const addNewTheurgy = () => {
    const newTheurgy = createNewPower();
    setTmpTheurgy({ val: [...tmpTheurgy.val, newTheurgy], changed: true });
    return newTheurgy.key;
  };

  const removeTheurgy = (key: string) => {
    setTmpTheurgy({
      val: tmpTheurgy.val.filter((pwr) => pwr.key !== key),
      changed: true,
    });
  };

  const contextTheurgy: Array<TempPowerType> = generatePowerContext(
    tmpTheurgy,
    theurgy,
    setTmpTheurgy
  );
  const contextPsy: Array<TempPowerType> = generatePowerContext(
    tmpPsy,
    psy,
    setTmpPsy
  );
  const contextStaticMagic: Array<TempPowerType> = generatePowerContext(
    tmpStaticMagic,
    staticMagic,
    setTmpStaticMagic
  );

  const context: ContextType = {
    addNewPsy,
    removePsy,
    addNewStatic,
    removeStatic,
    addNewTheurgy,
    removeTheurgy,
    psy: contextPsy,
    staticMagic: contextStaticMagic,
    theurgy: contextTheurgy,
  };
  return (
    <HumanMagicContext.Provider value={context}>
      {children}
    </HumanMagicContext.Provider>
  );
};

export default HumanMagicContext;

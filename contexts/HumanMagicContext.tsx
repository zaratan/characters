/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import produce from 'immer';
import { TempElemType } from '../types/TempElemType';

type ContextType = {
  psy: Array<TempPowerType>;
  addNewPsy: () => string;
  removePsy: (id: string) => void;
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
  addNewPsy: () => {
    console.error('Default Context used');
    return '';
  },
  removePsy: () => {
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

export const HumanMagicProvider = ({
  children,
  psy,
}: {
  children: ReactNode;
  psy: Array<PowerType>;
}) => {
  // Psy state
  const [tmpPsy, setTmpPsy] = useState({ val: psy, changed: false });
  useEffect(() => {
    if (tmpPsy.changed) return;
    setTmpPsy({ val: psy, changed: false });
  }, [JSON.stringify(psy)]);

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

  const contextPsy: Array<TempPowerType> = tmpPsy.val.map((psyPwr) => {
    const basePower = psy.find((basePwr) => basePwr.key === psyPwr.key);

    const addNewRitual = () => {
      const newRitual = createNewRitual();
      setTmpPsy(
        produce(tmpPsy, (nextState) => {
          nextState.val
            .find((pwr) => pwr.key === psyPwr.key)
            .rituals.push(newRitual);
          nextState.changed = true;
        })
      );
      return newRitual.key;
    };

    const removeRitual = (key: string) => {
      setTmpPsy(
        produce(tmpPsy, (nextState) => {
          nextState.val.find(
            (pwr) => pwr.key === psyPwr.key
          ).rituals = psyPwr.rituals.filter((ritual) => ritual.key !== key);
          nextState.changed = true;
        })
      );
    };

    const set = (newVal: number) => {
      setTmpPsy(
        produce(tmpPsy, (nextState) => {
          nextState.val.find((pwr) => pwr.key === psyPwr.key).value = newVal;
          nextState.changed = true;
        })
      );
    };

    const setTitle = (newTitle: string) => {
      setTmpPsy(
        produce(tmpPsy, (nextState) => {
          nextState.val.find((pwr) => pwr.key === psyPwr.key).title = newTitle;
          nextState.changed = true;
        })
      );
    };

    const toggleRituals = () => {
      setTmpPsy(
        produce(tmpPsy, (nextState) => {
          nextState.val.find(
            (pwr) => pwr.key === psyPwr.key
          ).hasRitual = !psyPwr.hasRitual;
          nextState.changed = true;
        })
      );
    };

    const rituals: Array<TempRitualType> = psyPwr.rituals.map((ritual) => ({
      ...ritual,
      baseValue:
        basePower?.rituals?.find((baseRitual) => baseRitual.key === ritual.key)
          ?.value || 0,
      setTitle: (newTitle: string) => {
        setTmpPsy(
          produce(tmpPsy, (nextState) => {
            nextState.val
              .find((pwr) => pwr.key === psyPwr.key)
              .rituals.find((rtl) => rtl.key === ritual.key).title = newTitle;
            nextState.changed = true;
          })
        );
      },
      set: (newValue: number) => {
        setTmpPsy(
          produce(tmpPsy, (nextState) => {
            nextState.val
              .find((pwr) => pwr.key === psyPwr.key)
              .rituals.find((rtl) => rtl.key === ritual.key).value = newValue;
            nextState.changed = true;
          })
        );
      },
    }));

    return {
      ...psyPwr,
      baseValue: basePower?.value || 0,
      rituals,
      addNewRitual,
      removeRitual,
      set,
      setTitle,
      toggleRituals,
    };
  });

  const context: ContextType = { addNewPsy, removePsy, psy: contextPsy };
  return (
    <HumanMagicContext.Provider value={context}>
      {children}
    </HumanMagicContext.Provider>
  );
};

export default HumanMagicContext;

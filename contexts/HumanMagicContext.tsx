/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import { TempElemType } from '../types/TempElemType';
import { useStateWithChangesAndTracker } from '../hooks/useStateWithTracker';

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
  setter: (value: Array<PowerType>) => void
) =>
  tmpPowers.val.map((power) => {
    const basePower = powers.find((basePwr) => basePwr.key === power.key);

    const addNewRitual = () => {
      const newRitual = createNewRitual();
      setter(
        tmpPowers.val.map((pwr) =>
          pwr.key === power.key
            ? { ...pwr, rituals: [...pwr.rituals, newRitual] }
            : pwr
        )
      );
      return newRitual.key;
    };

    const removeRitual = (key: string) => {
      setter(
        tmpPowers.val.map((pwr) =>
          pwr.key === power.key
            ? {
                ...pwr,
                rituals: pwr.rituals.filter((ritual) => ritual.key !== key),
              }
            : pwr
        )
      );
    };

    const set = (newVal: number) => {
      setter(
        tmpPowers.val.map((pwr) =>
          pwr.key === power.key ? { ...pwr, value: newVal } : pwr
        )
      );
    };

    const setTitle = (newTitle: string) => {
      setter(
        tmpPowers.val.map((pwr) =>
          pwr.key === power.key ? { ...pwr, title: newTitle } : pwr
        )
      );
    };

    const toggleRituals = () => {
      setter(
        tmpPowers.val.map((pwr) =>
          pwr.key === power.key ? { ...pwr, hasRitual: !pwr.hasRitual } : pwr
        )
      );
    };

    const rituals: Array<TempRitualType> = power.rituals.map((ritual) => ({
      ...ritual,
      baseValue:
        basePower?.rituals?.find((baseRitual) => baseRitual.key === ritual.key)
          ?.value || 0,
      setTitle: (newTitle: string) => {
        setter(
          tmpPowers.val.map((pwr) =>
            pwr.key === power.key
              ? {
                  ...pwr,
                  rituals: pwr.rituals.map((rtl) =>
                    rtl.key === ritual.key ? { ...rtl, title: newTitle } : rtl
                  ),
                }
              : pwr
          )
        );
      },
      set: (newValue: number) => {
        setter(
          tmpPowers.val.map((pwr) =>
            pwr.key === power.key
              ? {
                  ...pwr,
                  rituals: pwr.rituals.map((rtl) =>
                    rtl.key === ritual.key ? { ...rtl, value: newValue } : rtl
                  ),
                }
              : pwr
          )
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
  const [tmpPsy, setTmpPsy] = useStateWithChangesAndTracker(psy, 'psy');

  // StaticMagic state
  const [tmpStaticMagic, setTmpStaticMagic] = useStateWithChangesAndTracker(
    staticMagic,
    'static-magic'
  );

  // Theurgy state
  const [tmpTheurgy, setTmpTheurgy] = useStateWithChangesAndTracker(
    theurgy,
    'theurgy'
  );

  const addNewPsy = () => {
    const newPsy = createNewPower();
    setTmpPsy([...tmpPsy.val, newPsy]);
    return newPsy.key;
  };

  const removePsy = (key: string) => {
    setTmpPsy(tmpPsy.val.filter((pwr) => pwr.key !== key));
  };

  const addNewStatic = () => {
    const newStatic = createNewPower();
    setTmpStaticMagic([...tmpStaticMagic.val, newStatic]);
    return newStatic.key;
  };

  const removeStatic = (key: string) => {
    setTmpStaticMagic(tmpStaticMagic.val.filter((pwr) => pwr.key !== key));
  };

  const addNewTheurgy = () => {
    const newTheurgy = createNewPower();
    setTmpTheurgy([...tmpTheurgy.val, newTheurgy]);
    return newTheurgy.key;
  };

  const removeTheurgy = (key: string) => {
    setTmpTheurgy(tmpTheurgy.val.filter((pwr) => pwr.key !== key));
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

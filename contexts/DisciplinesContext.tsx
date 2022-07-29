/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import { TempElemType } from '../types/TempElemType';
import { useStateWithChangesAndTracker } from '../hooks/useStateWithTracker';

export type PathType = {
  key: string;
  title: string;
  value: number;
};

export type RitualType = {
  key: string;
  title: string;
  value: number;
};

export type ThaumaturgyType = {
  key: string;
  title: string;
  value: number;
  isThaumaturgy: true;
  mainPathName: string;
  paths: Array<PathType>;
  rituals: Array<RitualType>;
  ritualMulti: number;
};

export type DisciplineType = {
  key: string;
  title: string;
  value: number;
  isThaumaturgy: false;
  mainPathName?: string;
  paths?: Array<PathType>;
  rituals?: Array<RitualType>;
  ritualMulti?: number;
};

export type CombinedDisciplineType = {
  key: string;
  title: string;
  value: number;
};

export interface TempDisciplineElemType extends TempElemType<number> {
  setTitle: (newTitle: string) => void;
  toggleThaumaturgy: () => void;
  key: string;
  title: string;
  isThaumaturgy: boolean;
  paths?: Array<TempPathElemType>;
  rituals?: Array<TempRitualElemType>;
  ritualMulti?: number;
  mainPathName?: string;
}

export interface TempThaumaturgyElemType extends TempDisciplineElemType {
  addNewPath: () => void;
  removePath: (key: string) => void;
  addNewRitual: () => void;
  removeRitual: (key: string) => void;
  setRitualMulti: (newValue: number) => void;
  changeMainPathName: (newTitle: string) => void;
  paths: Array<TempPathElemType>;
  rituals: Array<TempRitualElemType>;
  ritualMulti: number;
  mainPathName: string;
}

export interface TempPathElemType extends TempElemType<number> {
  setTitle: (newTitle: string) => void;
  title: string;
  key: string;
}

export interface TempRitualElemType extends TempElemType<number> {
  setTitle: (newTitle: string) => void;
  title: string;
  key: string;
}

export interface TempCombinedDisciplineElemType extends TempElemType<number> {
  setTitle: (newTitle: string) => void;
  title: string;
  key: string;
}

export type DisciplinesList = Array<DisciplineType | ThaumaturgyType>;
export type CombinedDisciplinesList = Array<CombinedDisciplineType>;

const defaultContext: {
  clanDisciplines: Array<TempDisciplineElemType | TempThaumaturgyElemType>;
  outClanDisciplines: Array<TempDisciplineElemType | TempThaumaturgyElemType>;
  combinedDisciplines: Array<TempCombinedDisciplineElemType>;
  addNewClanDiscipline: () => void;
  removeClanDiscipline: (key: string) => void;
  addNewOutClanDiscipline: () => void;
  removeOutClanDiscipline: (key: string) => void;
  addNewCombinedDiscipline: () => void;
  removeCombinedDiscipline: (key: string) => void;
} = {
  clanDisciplines: [],
  outClanDisciplines: [],
  combinedDisciplines: [],
  addNewClanDiscipline: () => {},
  removeClanDiscipline: () => {},
  addNewOutClanDiscipline: () => {},
  removeOutClanDiscipline: () => {},
  addNewCombinedDiscipline: () => {},
  removeCombinedDiscipline: () => {},
};

const DisciplinesContext = createContext(defaultContext);

const convertDisciplineToElem: (
  tmpDiscipline: DisciplineType | ThaumaturgyType,
  tmpDisciplines: Array<DisciplineType | ThaumaturgyType>,
  baseDisciplines: Array<DisciplineType | ThaumaturgyType>,
  setter: (value: Array<DisciplineType | ThaumaturgyType>) => void
) => TempDisciplineElemType = (
  tmpDiscipline,
  tmpDisciplines,
  baseDisciplines,
  setter
) => {
  const baseDiscipline = baseDisciplines.find(
    (baseDisc) => baseDisc.key === tmpDiscipline.key
  );
  const result = {
    ...tmpDiscipline,
    baseValue: (baseDiscipline && baseDiscipline.value) || 0,
    set: (newValue: number) =>
      setter(
        tmpDisciplines.map((disc) =>
          disc.key === tmpDiscipline.key ? { ...disc, value: newValue } : disc
        )
      ),
    setTitle: (newTitle: string) =>
      setter(
        tmpDisciplines.map((disc) =>
          disc.key === tmpDiscipline.key ? { ...disc, title: newTitle } : disc
        )
      ),
    toggleThaumaturgy: () =>
      setter(
        tmpDisciplines.map((disc) =>
          disc.key === tmpDiscipline.key
            ? {
                ...disc,
                isThaumaturgy: true,
                paths: disc.paths || [],
                ritualMulti: disc.ritualMulti || 1,
                rituals: disc.rituals || [],
                mainPathName: disc.mainPathName || '',
              }
            : disc
        )
      ),
    paths: [],
    rituals: [],
  };

  return result;
};

const convertRitualsToElems: (
  tmpDiscipline: ThaumaturgyType,
  tmpDisciplines: Array<DisciplineType | ThaumaturgyType>,
  baseDisciplines: Array<DisciplineType | ThaumaturgyType>,
  setter: (value: Array<DisciplineType | ThaumaturgyType>) => void
) => Array<TempRitualElemType> = (
  tmpDiscipline,
  tmpDisciplines,
  baseDisciplines,
  setter
) =>
  tmpDiscipline.rituals.map((ritual) => {
    const baseDiscipline = baseDisciplines.find(
      (baseDisc) => baseDisc.key === tmpDiscipline.key
    );
    const baseRitual =
      baseDiscipline &&
      baseDiscipline.rituals &&
      baseDiscipline.rituals.find((baseRit) => baseRit.key === ritual.key);
    return {
      ...ritual,
      baseValue: (baseRitual && baseRitual.value) || 0,
      set: (newValue) =>
        setter(
          tmpDisciplines.map((disc) =>
            disc.key === tmpDiscipline.key
              ? {
                  ...disc,
                  rituals: tmpDiscipline.rituals.map((rit) =>
                    rit.key === ritual.key
                      ? { ...ritual, value: newValue }
                      : rit
                  ),
                }
              : disc
          )
        ),
      setTitle: (newValue) =>
        setter(
          tmpDisciplines.map((disc) =>
            disc.key === tmpDiscipline.key
              ? {
                  ...disc,
                  rituals: tmpDiscipline.rituals.map((rit) =>
                    rit.key === ritual.key
                      ? { ...ritual, title: newValue }
                      : rit
                  ),
                }
              : disc
          )
        ),
    };
  });

const convertPathsToElems: (
  tmpDiscipline: ThaumaturgyType,
  tmpDisciplines: Array<DisciplineType | ThaumaturgyType>,
  baseDisciplines: Array<DisciplineType | ThaumaturgyType>,
  setter: (value: Array<DisciplineType | ThaumaturgyType>) => void
) => Array<TempPathElemType> = (
  tmpDiscipline,
  tmpDisciplines,
  baseDisciplines,
  setter
) =>
  tmpDiscipline.paths.map((path) => {
    const baseDiscipline = baseDisciplines.find(
      (baseDisc) => baseDisc.key === tmpDiscipline.key
    );
    const basePath =
      baseDiscipline &&
      baseDiscipline.paths &&
      baseDiscipline.paths.find((basePat) => basePat.key === path.key);
    return {
      ...path,
      baseValue: (basePath && basePath.value) || 0,
      set: (newValue) =>
        setter(
          tmpDisciplines.map((disc) =>
            disc.key === tmpDiscipline.key
              ? {
                  ...disc,
                  paths: tmpDiscipline.paths.map((pa) =>
                    pa.key === path.key ? { ...path, value: newValue } : pa
                  ),
                }
              : disc
          )
        ),
      setTitle: (newValue) =>
        setter(
          tmpDisciplines.map((disc) =>
            disc.key === tmpDiscipline.key
              ? {
                  ...disc,
                  paths: tmpDiscipline.paths.map((pa) =>
                    pa.key === path.key ? { ...path, title: newValue } : pa
                  ),
                }
              : disc
          )
        ),
    };
  });

const convertThaumaturgyToElems: (
  tmpDiscipline: ThaumaturgyType,
  tmpDisciplines: Array<DisciplineType | ThaumaturgyType>,
  baseDisciplines: Array<DisciplineType | ThaumaturgyType>,
  setter: (value: Array<DisciplineType | ThaumaturgyType>) => void
) => TempThaumaturgyElemType = (
  tmpDiscipline,
  tmpDisciplines,
  baseDisciplines,
  setter
) => ({
  ...convertDisciplineToElem(
    tmpDiscipline,
    tmpDisciplines,
    baseDisciplines,
    setter
  ),
  ...tmpDiscipline,
  toggleThaumaturgy: () =>
    setter(
      tmpDisciplines.map((disc) =>
        disc.key === tmpDiscipline.key
          ? {
              ...disc,
              isThaumaturgy: false,
            }
          : disc
      )
    ),
  addNewPath: () =>
    setter(
      tmpDisciplines.map((disc) =>
        disc.key === tmpDiscipline.key
          ? {
              ...disc,
              paths: [...disc.paths, { key: uuid(), title: '', value: 0 }],
            }
          : disc
      )
    ),
  removePath: (pathKey) =>
    setter(
      tmpDisciplines.map((disc) =>
        disc.key === tmpDiscipline.key
          ? {
              ...disc,
              paths: disc.paths.filter((path) => path.key !== pathKey),
            }
          : disc
      )
    ),
  removeRitual: (ritualKey) =>
    setter(
      tmpDisciplines.map((disc) =>
        disc.key === tmpDiscipline.key
          ? {
              ...disc,
              rituals: disc.rituals.filter(
                (ritual) => ritual.key !== ritualKey
              ),
            }
          : disc
      )
    ),
  addNewRitual: () =>
    setter(
      tmpDisciplines.map((disc) =>
        disc.key === tmpDiscipline.key
          ? {
              ...disc,
              rituals: [...disc.rituals, { key: uuid(), title: '', value: 0 }],
            }
          : disc
      )
    ),
  setRitualMulti: (newValue) =>
    setter(
      tmpDisciplines.map((disc) =>
        disc.key === tmpDiscipline.key
          ? {
              ...disc,
              ritualMulti: newValue,
            }
          : disc
      )
    ),
  changeMainPathName: (newTitle) =>
    setter(
      tmpDisciplines.map((disc) =>
        disc.key === tmpDiscipline.key
          ? {
              ...disc,
              mainPathName: newTitle,
            }
          : disc
      )
    ),
  paths: convertPathsToElems(
    tmpDiscipline,
    tmpDisciplines,
    baseDisciplines,
    setter
  ),
  rituals: convertRitualsToElems(
    tmpDiscipline,
    tmpDisciplines,
    baseDisciplines,
    setter
  ),
});

const convertDisciplinesToElems: (
  tmpDisciplines: Array<DisciplineType | ThaumaturgyType>,
  baseDisciplines: Array<DisciplineType | ThaumaturgyType>,
  setter: (value: Array<DisciplineType | ThaumaturgyType>) => void
) => Array<TempDisciplineElemType | TempThaumaturgyElemType> = (
  tmpDisciplines,
  baseDisciplines,
  setter
) =>
  tmpDisciplines.map((tmpDiscipline) =>
    tmpDiscipline.isThaumaturgy
      ? convertThaumaturgyToElems(
          tmpDiscipline,
          tmpDisciplines,
          baseDisciplines,
          setter
        )
      : convertDisciplineToElem(
          tmpDiscipline,
          tmpDisciplines,
          baseDisciplines,
          setter
        )
  );

const convertCombinedDisciplineToElem: (
  combinedDisciplines: Array<CombinedDisciplineType>,
  baseCombinedDisciplines: Array<CombinedDisciplineType>,
  setter: (newCombinedDisciplines: Array<CombinedDisciplineType>) => void
) => Array<TempCombinedDisciplineElemType> = (
  combinedDisciplines,
  baseCombinedDisciplines,
  setter
) =>
  combinedDisciplines.map((combinedDiscipline, i) => ({
    ...combinedDiscipline,
    baseValue:
      (baseCombinedDisciplines[i] && baseCombinedDisciplines[i].value) || 0,
    set: (newValue) =>
      setter(
        combinedDisciplines.map((combinedDisc) =>
          combinedDisc.key === combinedDiscipline.key
            ? { ...combinedDiscipline, value: newValue }
            : combinedDisc
        )
      ),
    setTitle: (newTitle) =>
      setter(
        combinedDisciplines.map((combinedDisc) =>
          combinedDisc.key === combinedDiscipline.key
            ? { ...combinedDiscipline, title: newTitle }
            : combinedDisc
        )
      ),
  }));

const generateAddNewDiscipline: (
  disciplines: Array<DisciplineType | ThaumaturgyType>,
  setter: (value: Array<DisciplineType | ThaumaturgyType>) => void
) => () => void = (disciplines, setter) => () => {
  setter([
    ...disciplines,
    { value: 0, title: '', isThaumaturgy: false, key: uuid() },
  ]);
};

const generateAddNewCombinedDiscipline: (
  disciplines: Array<CombinedDisciplineType>,
  setter: (value: Array<CombinedDisciplineType>) => void
) => () => void = (disciplines, setter) => () => {
  setter([...disciplines, { value: 0, title: '', key: uuid() }]);
};

const generateRemoveDiscipline: (
  disciplines: Array<DisciplineType | ThaumaturgyType>,
  setter: (value: Array<DisciplineType | ThaumaturgyType>) => void
) => (key: string) => void = (disciplines, setter) => (key) => {
  setter(disciplines.filter((discipline) => discipline.key !== key));
};

const generateRemoveCombinedDiscipline: (
  disciplines: Array<CombinedDisciplineType>,
  setter: (value: Array<CombinedDisciplineType>) => void
) => (key: string) => void = (disciplines, setter) => (key) => {
  setter(disciplines.filter((discipline) => discipline.key !== key));
};

export const DisciplinesProvider = ({
  children,
  clanDisciplines,
  outClanDisciplines,
  combinedDisciplines,
}: {
  children: ReactNode;
  clanDisciplines: Array<DisciplineType | ThaumaturgyType>;
  outClanDisciplines: Array<DisciplineType | ThaumaturgyType>;
  combinedDisciplines: Array<CombinedDisciplineType>;
}) => {
  const [tmpClanDisciplines, setTmpClanDisciplines] =
    useStateWithChangesAndTracker(clanDisciplines, 'clanDisciplines');

  const [tmpOutClanDisciplines, setTmpOutClanDisciplines] =
    useStateWithChangesAndTracker(outClanDisciplines, 'outClanDisciplines');

  const [tmpCombinedDisciplines, setTmpCombinedDisciplines] =
    useStateWithChangesAndTracker(combinedDisciplines, 'combinedDisciplines');

  return (
    <DisciplinesContext.Provider
      value={{
        clanDisciplines: convertDisciplinesToElems(
          tmpClanDisciplines.val,
          clanDisciplines,
          setTmpClanDisciplines
        ),
        outClanDisciplines: convertDisciplinesToElems(
          tmpOutClanDisciplines.val,
          outClanDisciplines,
          setTmpOutClanDisciplines
        ),
        combinedDisciplines: convertCombinedDisciplineToElem(
          tmpCombinedDisciplines.val,
          combinedDisciplines,
          setTmpCombinedDisciplines
        ),
        addNewClanDiscipline: generateAddNewDiscipline(
          tmpClanDisciplines.val,
          setTmpClanDisciplines
        ),
        removeClanDiscipline: generateRemoveDiscipline(
          tmpClanDisciplines.val,
          setTmpClanDisciplines
        ),
        addNewOutClanDiscipline: generateAddNewDiscipline(
          tmpOutClanDisciplines.val,
          setTmpOutClanDisciplines
        ),
        removeOutClanDiscipline: generateRemoveDiscipline(
          tmpOutClanDisciplines.val,
          setTmpOutClanDisciplines
        ),
        addNewCombinedDiscipline: generateAddNewCombinedDiscipline(
          tmpCombinedDisciplines.val,
          setTmpCombinedDisciplines
        ),
        removeCombinedDiscipline: generateRemoveCombinedDiscipline(
          tmpCombinedDisciplines.val,
          setTmpCombinedDisciplines
        ),
      }}
    >
      {children}
    </DisciplinesContext.Provider>
  );
};

export default DisciplinesContext;

'use client';

import type { ReactNode } from 'react';
import { createContext, useState, useMemo, useRef } from 'react';

type ContextType = {
  unsavedChanges: boolean;
  addChange: (change: ChangeType) => void;
  resetSave: () => void;
  rollback: () => void;
  changePexDuringPlay: number;
  setChangePexDuringPlay: (newValue: number) => void;
};

export type ChangeType = {
  key: string;
  value: unknown;
  baseValue?: unknown;
  pexCost: number;
  rollback: () => void;
};

const defaultContext: ContextType = {
  unsavedChanges: false,
  addChange: () => {},
  resetSave: () => {},
  rollback: () => {},
  changePexDuringPlay: 0,
  setChangePexDuringPlay: () => {},
};

const ModificationsContext = createContext(defaultContext);

type ChangedValue = { changed: boolean; val: unknown };

const isChangedValue = (v: unknown): v is ChangedValue =>
  v !== null && typeof v === 'object' && 'changed' in v;

const anyChanges = (changesArray: Array<ChangeType>) => {
  const ignoreList: string[] = [];
  return changesArray.some((change) => {
    if (ignoreList.find((e) => e === change.key)) return false;
    if (isChangedValue(change.value) && change.value.changed) {
      if (JSON.stringify(change.baseValue) !== JSON.stringify(change.value.val))
        return true;
    } else if (
      JSON.stringify(change.baseValue) !== JSON.stringify(change.value)
    )
      return true;
    ignoreList.push(change.key);
  });
};

export const ModificationsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [changePexDuringPlay, setChangePexDuringPlay] = useState(0);
  const changes = useRef<ChangeType[]>([]);
  const addChange = (change: ChangeType) => {
    if (
      JSON.stringify(change.value) ===
      JSON.stringify(
        changes.current.find((chg) => chg.key === change.key)?.value || -1
      )
    )
      return;
    changes.current = [change, ...changes.current];
    setChangePexDuringPlay(changePexDuringPlay + change.pexCost);
    setUnsavedChanges(anyChanges([change, ...changes.current]));
  };
  const rollback = () => {
    const [changeToRollback, ...otherChanges] = changes.current;
    if (changeToRollback) {
      changeToRollback.rollback();
      setChangePexDuringPlay(changePexDuringPlay - changeToRollback.pexCost);
    }
    changes.current = otherChanges;
    setUnsavedChanges(anyChanges(otherChanges));
  };
  const context: ContextType = useMemo(
    () => ({
      unsavedChanges,
      addChange,
      resetSave: () => {
        changes.current = [];
        setUnsavedChanges(false);
        setChangePexDuringPlay(0);
      },
      rollback,
      changePexDuringPlay,
      setChangePexDuringPlay,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unsavedChanges, changePexDuringPlay]
  );
  return (
    <ModificationsContext.Provider value={context}>
      {children}
    </ModificationsContext.Provider>
  );
};

export default ModificationsContext;

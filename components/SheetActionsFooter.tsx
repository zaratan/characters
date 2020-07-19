import React, { useContext, useRef } from 'react';
import PreferencesContext from '../contexts/PreferencesContext';
import ModeContext from '../contexts/ModeContext';
import ActionsFooter from './ActionsFooter';
import SaveButton from './SaveButton';

const SheetActionsFooter = ({ newChar }: { newChar: boolean }) => {
  const { showPex, togglePex } = useContext(PreferencesContext);
  const { editMode, toggleMode } = useContext(ModeContext);
  return (
    <ActionsFooter
      actions={[
        {
          glyph: 'XP',
          name: `${showPex ? 'Cacher' : 'Afficher'} les PEX`,
          act: togglePex,
        },
      ]}
      loggedActions={[
        newChar
          ? null
          : {
              glyph: editMode ? '🎲' : '✎',
              act: toggleMode,
              name: editMode ? 'Jouer' : 'Modifier',
            },
        editMode
          ? {
              glyph: '💾',
              component: SaveButton,
              componentProps: { newChar },
              name: 'Sauver',
            }
          : null,
      ].filter((e) => e !== null)}
    />
  );
};

export default SheetActionsFooter;

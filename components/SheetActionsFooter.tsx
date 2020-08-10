import React, { useContext } from 'react';
import PreferencesContext from '../contexts/PreferencesContext';
import ModeContext from '../contexts/ModeContext';
import ActionsFooter from './ActionsFooter';
import SaveButton from './SaveButton';
import ModificationsContext from '../contexts/ModificationsContext';
import IdContext from '../contexts/IdContext';

const SheetActionsFooter = () => {
  const { showPex, togglePex } = useContext(PreferencesContext);
  const { editMode, toggleMode } = useContext(ModeContext);
  const { rollback, unsavedChanges } = useContext(ModificationsContext);
  const { id } = useContext(IdContext);
  return (
    <ActionsFooter
      actions={[
        {
          glyph: 'XP',
          name: `${showPex ? 'Cacher' : 'Afficher'} les PEX`,
          act: togglePex,
          active: showPex,
        },
      ]}
      loggedActions={[
        {
          glyph: editMode ? '🎲' : '✎',
          act: toggleMode,
          name: editMode ? 'Jouer' : 'Modifier',
        },
        {
          glyph: '⚙',
          link: `/vampires/${id}/config`,
          name: 'Configuration',
        },
        ...(editMode && unsavedChanges
          ? [
              {
                glyph: '💾',
                component: SaveButton,
                name: 'Sauver',
              },
              {
                glyph: '←',
                act: rollback,
                name: 'Annuler',
              },
            ]
          : []),
      ].filter((e) => e !== null)}
    />
  );
};

export default SheetActionsFooter;

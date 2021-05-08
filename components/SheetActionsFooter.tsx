import React, { useContext } from 'react';
import PreferencesContext from '../contexts/PreferencesContext';
import ModeContext from '../contexts/ModeContext';
import ActionsFooter from './ActionsFooter';
import ModificationsContext from '../contexts/ModificationsContext';
import IdContext from '../contexts/IdContext';
import { useSave } from '../hooks/useSave';
import ThemeContext from '../contexts/ThemeContext';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

const SheetActionsFooter = () => {
  const { showPex, togglePex } = useContext(PreferencesContext);
  const { editMode, toggleMode } = useContext(ModeContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { rollback, unsavedChanges } = useContext(ModificationsContext);
  const saveAction = useSave();
  const { id } = useContext(IdContext);
  return (
    <ActionsFooter
      actions={[
        {
          glyph: darkMode ? SunIcon : MoonIcon,
          name: `Mode ${darkMode ? 'Clair' : 'Sombre'}`,
          act: toggleDarkMode,
        },
        {
          glyph: 'XP',
          name: `${showPex ? 'Cacher' : 'Afficher'} les PEX`,
          act: togglePex,
          active: showPex,
        },
      ]}
      ownerActions={[
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
                act: saveAction,
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

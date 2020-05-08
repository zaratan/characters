import React, { useContext } from 'react';
import SaveButton from '../SaveButton';
import PreferencesContext from '../../contexts/PreferencesContext';
import ModeContext from '../../contexts/ModeContext';
import Nav from '../Nav';

const Controls = ({ newChar }: { newChar: boolean }) => {
  const { showPex, togglePex } = useContext(PreferencesContext);
  const { editMode, toggleMode } = useContext(ModeContext);
  return (
    <Nav
      actions={[
        {
          text: editMode ? 'Play' : 'Edit',
          action: toggleMode,
        },
        {
          text: `${showPex ? 'Cacher' : 'Afficher'} les PEX`,
          action: togglePex,
        },
        {
          text: 'Save',
          component: editMode ? <SaveButton newChar={newChar} /> : null,
        },
      ]}
    />
  );
};

export default Controls;

import React, { useContext } from 'react';
import ThemeContext from '../../contexts/ThemeContext';
import { EmptyLine } from '../../styles/Lines';
import { Title } from '../../styles/Titles';
import ActionsFooter from '../ActionsFooter';
import MoonIcon from '../icons/MoonIcon';
import SunIcon from '../icons/SunIcon';
import ConfigAccessSection from './ConfigAccessSection';
import ConfigDangerousSection from './ConfigDangerousSection';
import ConfigPreferencesSection from './ConfigPreferencesSection';

const Config = ({ id, name }: { id: string; name: string }) => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  return (
    <>
      <Title>Options pour {name}</Title>
      <EmptyLine />
      <ConfigPreferencesSection id={id} />
      <ConfigAccessSection id={id} />
      <ConfigDangerousSection id={id} name={name} />
      <ActionsFooter
        actions={[
          {
            glyph: darkMode ? SunIcon : MoonIcon,
            name: `Mode ${darkMode ? 'Clair' : 'Sombre'}`,
            act: toggleDarkMode,
          },
          { glyph: '←', link: `/vampires/${id}`, name: 'Retour' },
        ]}
      />
    </>
  );
};
export default Config;

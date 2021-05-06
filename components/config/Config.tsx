import React from 'react';
import { EmptyLine } from '../../styles/Lines';
import { Title } from '../../styles/Titles';
import ActionsFooter from '../ActionsFooter';
import ConfigAccessSection from './ConfigAccessSection';
import ConfigDangerousSection from './ConfigDangerousSection';
import ConfigPreferencesSection from './ConfigPreferencesSection';

const Config = ({ id, name }: { id: string; name: string }) => (
  <>
    <Title>Options pour {name}</Title>
    <EmptyLine />
    <ConfigPreferencesSection id={id} />
    <ConfigAccessSection id={id} />
    <ConfigDangerousSection id={id} name={name} />
    <ActionsFooter
      actions={[{ glyph: '←', link: `/vampires/${id}`, name: 'Retour' }]}
    />
  </>
);
export default Config;

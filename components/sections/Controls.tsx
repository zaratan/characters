import React, { useContext } from 'react';
import styled from 'styled-components';
import { EmptyLine } from '../../styles/Lines';
import SaveButton from '../SaveButton';
import { HorizontalSection } from '../../styles/Sections';
import { Container } from '../../styles/Container';
import PreferencesContext from '../../contexts/PreferencesContext';
import Button from '../Button';
import SectionTitle from '../SectionTitle';
import ModeContext from '../../contexts/ModeContext';

const StyledContainer = styled(Container)`
  display: flex;
  justify-content: center;
  align-items: center;
  li {
    margin: 0;
  }
`;

const Controls = ({ newChar }: { newChar: boolean }) => {
  const { showPex, togglePex } = useContext(PreferencesContext);
  const { editMode, toggleMode } = useContext(ModeContext);
  return (
    <>
      <SectionTitle title="Controlles" />
      <EmptyLine />
      <HorizontalSection>
        <StyledContainer>
          <Button onClick={toggleMode}>{editMode ? 'Play' : 'Edit'}</Button>
        </StyledContainer>
        <StyledContainer>
          <Button onClick={togglePex}>{`${
            showPex ? 'Cacher' : 'Afficher'
          } les PEX`}</Button>
        </StyledContainer>
        {editMode ? (
          <StyledContainer>
            <SaveButton newChar={newChar} />
          </StyledContainer>
        ) : null}
      </HorizontalSection>
    </>
  );
};

export default Controls;

import React, { useContext } from 'react';
import styled from 'styled-components';
import { EmptyLine } from '../../styles/Lines';
import SaveButton from '../SaveButton';
import { HorizontalSection } from '../../styles/Sections';
import { Container } from '../../styles/Container';
import PreferencesContext from '../../contexts/PreferencesContext';
import Button from '../Button';
import SectionTitle from '../SectionTitle';

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
  return (
    <>
      <SectionTitle title="Controlles" />
      <EmptyLine />
      <HorizontalSection>
        <StyledContainer>
          <SaveButton newChar={newChar} />
        </StyledContainer>
        <StyledContainer>
          <Button onClick={togglePex}>{`${
            showPex ? 'Cacher' : 'Afficher'
          } les PEX`}</Button>
        </StyledContainer>
      </HorizontalSection>
    </>
  );
};

export default Controls;

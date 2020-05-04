import React from 'react';
import styled from 'styled-components';
import { StyledLine } from '../styles/Lines';
import SaveButton from './SaveButton';
import { HorizontalSection } from '../styles/Sections';
import { Container } from '../styles/Container';

const StyledContainer = styled(Container)`
  display: flex;
  justify-content: center;
  align-items: center;
  li {
    margin: 0;
  }
`;

const Controls = ({ newChar }: { newChar: boolean }) => (
  <>
    <StyledLine title="Controlles" />
    <HorizontalSection>
      <span />
      <span />
      <StyledContainer>
        <SaveButton newChar={newChar} />
      </StyledContainer>
    </HorizontalSection>
  </>
);

export default Controls;

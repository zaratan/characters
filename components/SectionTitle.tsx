import React from 'react';

import styled from 'styled-components';
import { TempElemType } from '../types/TempElemType';
import { Title } from '../styles/Titles';
import { BlackLine, EmptyLine } from '../styles/Lines';
import PexElem from './PexElem';

export const StyledTitle = styled(Title)`
  padding: 0 1rem;
  white-space: nowrap;
`;

const SectionTitle = ({
  title,
  pexElems,
}: {
  title?: string;
  pexElems?: Array<{
    elemArray: Array<TempElemType<number>>;
    pexCalc: (value: number) => number;
  }>;
}) => (
  <>
    <EmptyLine />
    <EmptyLine>
      <BlackLine />
      {title ? (
        <StyledTitle>
          {title}
          <PexElem pexElems={pexElems} />
        </StyledTitle>
      ) : (
        ''
      )}
      <BlackLine />
    </EmptyLine>
  </>
);

export default SectionTitle;

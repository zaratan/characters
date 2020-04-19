import React from 'react';
import styled from 'styled-components';

const DotStyle2 = styled.svg<{ full?: boolean }>`
  padding: 0 0.05rem;
  fill: ${props => (props.full ? '#555' : 'transparent')};
  width: 24px;
  height: 36px;
  transition: fill 0.2s ease-in-out;
  :hover,
  :hover ~ svg {
    fill: #555 !important;
  }
`;

const TextHelper = styled.small`
  position: absolute;
  top: -10px;
  width: 100%;
  text-align: center;
  font-size: 0.6rem;
  display: none;
  transition: display 0.2s ease-in-out;
`;

const DotContainer = styled.span`
  position: relative;
  :hover ~ span {
    svg {
      fill: #555 !important;
    }
  }
  :hover small {
    display: inline;
  }
`;

const Dot = ({
  full,
  pexValue,
  onClick,
}: {
  full?: boolean;
  pexValue?: number;
  onClick?: (MouseEvent) => void;
}) => (
  <DotContainer>
    <TextHelper>{pexValue}</TextHelper>
    <DotStyle2
      onClick={onClick}
      full={full}
      className={full ? 'full' : 'not-full'}
    >
      <ellipse cx="11" cy="18" rx="9" ry="11" stroke="black" strokeWidth="2" />
    </DotStyle2>
  </DotContainer>
);

export default Dot;

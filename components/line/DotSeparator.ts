import styled from 'styled-components';

const DotSeparator = styled.span`
  padding: 0.3rem;
  height: 100%;
  outline: none;

  :hover ~ span {
    svg {
      fill: ${(props) => props.theme.glyphGray} !important;
    }
  }

  :hover + span {
    small {
      display: inline;
    }
  }

  :hover,
  :focus {
    svg.full {
      fill: transparent;
    }
  }

  svg.full {
    color: ${(props) => props.theme.glyphGray};
  }

  &.hidden {
    display: none;
  }
`;

export default DotSeparator;

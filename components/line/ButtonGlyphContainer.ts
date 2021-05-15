import styled from 'styled-components';

const ButtonGlyphContainer = styled.span`
  position: absolute;
  right: -1.5rem;
  top: 0.5rem;
  z-index: 1;
  span {
    font-size: 1rem;
    color: ${(props) => props.theme.glyphGray};
    font-family: CloisterBlack;
  }
  &.active span {
    color: green;
  }
  @media screen and (max-width: 500px) {
    :not(.no-reposition) {
      right: 3rem;
    }
  }
  @media screen and (max-width: 410px) {
    :not(.no-reposition) {
      right: 2rem;
    }
  }
  @media screen and (max-width: 310px) {
    :not(.no-reposition) {
      right: 1rem;
    }
  }
`;

export default ButtonGlyphContainer;

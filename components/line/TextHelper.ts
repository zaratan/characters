import styled from 'styled-components';

const TextHelper = styled.small`
  position: absolute;
  right: -1.3rem;
  color: ${(props) => props.theme.red};
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  &.closer {
    right: -0.5rem;
  }
`;
export default TextHelper;

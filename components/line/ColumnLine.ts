import styled from 'styled-components';

const ColumnLine = styled.li`
  display: flex;
  position: relative;
  justify-content: space-between;
  @media screen and (max-width: 500px) {
    flex-direction: column;
    align-items: center;
  }
`;

export default ColumnLine;

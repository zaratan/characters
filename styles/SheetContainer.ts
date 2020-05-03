import styled from 'styled-components';

const SheetContainer = styled.main`
  margin: auto;
  margin-top: 20px;
  width: 80%;
  max-width: 2000px;
  position: relative;

  @media screen and (max-width: 1500px) {
    width: 95%;
  }

  @media screen and (max-width: 1304px) {
    width: 80%;
  }

  @media screen and (max-width: 1022px) {
    width: 95%;
  }

  @media screen and (max-width: 859px) {
    width: 80%;
  }

  @media screen and (max-width: 600px) {
    width: 90%;
  }
`;

export default SheetContainer;

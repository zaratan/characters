import styled from 'styled-components';

export const OptionItem = styled.li`
  display: flex;
  justify-content: space-between;
`;

export const ActionItem = styled.li`
  display: inline-block;
  padding: 0.5rem;
  border: solid 1px #333;
  border-radius: 5px;
  margin: 0 auto;
  text-align: center;
  margin-left: 1rem;
  cursor: pointer;
  outline: none;
  position: relative;
  :focus,
  :hover {
    box-shadow: 1px 1px 1px;
  }
  :active {
    box-shadow: none;
    background-color: #f7f7f7;
    top: 1px;
    left: 1px;
  }
`;

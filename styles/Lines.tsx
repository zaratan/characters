import styled from 'styled-components';
import { Title } from './Titles';

export const EmptyLine = styled.div`
  height: 3rem;
  display: flex;
  align-items: center;
  width: 100%;
`;

export const BlackLine = styled.div`
  background-color: black;
  height: 0.3rem;
  width: 100%;
`;

const SectionTitle = styled(Title)`
  padding: 0 1rem;
`;

export const StyledLine = ({ title }: { title?: string }) => (
  <EmptyLine>
    <BlackLine />
    {title ? <SectionTitle>{title}</SectionTitle> : ''}
    <BlackLine />
  </EmptyLine>
);

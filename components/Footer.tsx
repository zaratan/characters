import React from 'react';
import styled from 'styled-components';
import { BlackLine, EmptyLine } from '../styles/Lines';

const FooterStyle = styled.footer`
  font-style: italic;
  font-size: 1.2rem;
  text-align: center;
`;

const FooterLink = styled.a`
  padding-left: 0.3rem;
`;

const Heart = styled.span`
  transition: color 4s ease-in-out;
  cursor: grab;
  :hover {
    transition: color 0.2s ease-in-out;
    color: red;
  }
`;

const FooterText = styled.span`
  height: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Footer = ({ withoutEmptyLines }: { withoutEmptyLines?: boolean }) => (
  <FooterStyle>
    {withoutEmptyLines ? null : (
      <>
        <EmptyLine />
        <EmptyLine />
      </>
    )}
    <BlackLine />
    <FooterText>
      <span>
        Made with <Heart>♥</Heart> by
      </span>
      <FooterLink href="https://twitter.com/zaratan"> @zaratan</FooterLink>.
      <FooterLink href="https://ko-fi.com/zaratan">Buy me a tea</FooterLink>.
    </FooterText>
  </FooterStyle>
);

export default Footer;

/* eslint-disable no-nested-ternary */
import React, { useState, useRef, ReactNode, useContext } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { useClickAway } from 'react-use';
import { signIn, signOut } from 'next-auth/react';
import { MeType } from '../types/MeType';
import { BlackLine } from '../styles/Lines';
import {
  generateHandleClick,
  generateHandleKeypress,
} from '../helpers/handlers';
import { Title } from '../styles/Titles';
import MeContext from '../contexts/MeContext';
import UserAvatar from './UserAvatar';

// ProfileImg replaced by UserAvatar component

const MenuContainer = styled.div`
  position: relative;
  height: 100%;
`;

const MenuButton = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  cursor: pointer;
  outline: none;
  opacity: 0.8;
  transition: opacity 0.2s ease-in-out;
  :hover,
  :focus {
    opacity: 1;
  }
`;

const NameContainer = styled.li`
  border-bottom: 1px solid ${(props) => props.theme.borderColor};
  padding: 0.5rem;
  white-space: nowrap;
  z-index: 3;
`;

const MenuDropdownElem = styled.li`
  cursor: pointer;
  transition: 0.3s ease-in-out;
  :hover,
  :focus {
    background-color: ${(props) => props.theme.actionBackground};
    outline: none;
  }
  a {
    color: ${(props) => props.theme.color};
  }
  white-space: nowrap;
  padding: 0.3rem 0.5rem;
  z-index: 3;
  outline: none;

  &.action {
    color: ${(props) => props.theme.blue};
  }
`;

const MenuDropdown = styled.ul`
  position: absolute;
  overflow-y: hidden;
  right: 0;
  margin-top: 0.5rem;
  transform-origin: top right;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  border-radius: 5px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-height: 0;

  transition: max-height 0.3s ease-in-out, padding 0.2s ease-in-out;

  &.open {
    border: 1px solid ${(props) => props.theme.borderColor};
    max-height: 12rem;
    padding: 0.5rem 0rem;
  }
  z-index: 3;
  background-color: ${(props) => props.theme.navBackground};
`;

const LogButton = ({
  data,
  connected,
  close,
  menuOpen,
  action,
  returnTo,
}: {
  data?: MeType;
  connected?: boolean;
  close: () => void;
  action: () => void;
  menuOpen: boolean;
  returnTo?: string;
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  useClickAway(wrapperRef, () => {
    close();
  });
  if (!connected) {
    return (
      <MenuContainer className="text-only">
        <button
          onClick={() => signIn(undefined, { callbackUrl: returnTo || '/' })}
          style={{
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            color: 'inherit',
            font: 'inherit',
            padding: 0,
          }}
        >
          Connection
        </button>
      </MenuContainer>
    );
  }

  const handleClick = generateHandleClick(action);
  const handleKeypress = generateHandleKeypress(action);

  return (
    <MenuContainer ref={wrapperRef}>
      <MenuButton
        onClick={handleClick}
        onKeyPress={handleKeypress}
        tabIndex={0}
        role="button"
      >
        <UserAvatar
          name={data?.name ?? null}
          image={data?.image ?? null}
          userId={data?.id}
          size={30}
        />
      </MenuButton>
      <MenuDropdown className={menuOpen ? 'open' : ''}>
        <NameContainer>{data?.name || data?.email}</NameContainer>
        <MenuDropdownElem>
          <Link href="/profile">Profil</Link>
        </MenuDropdownElem>
        <MenuDropdownElem
          as="button"
          onClick={() => signOut()}
          style={{
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            color: 'inherit',
            font: 'inherit',
            width: '100%',
            textAlign: 'left',
          }}
        >
          Déconnection
        </MenuDropdownElem>
      </MenuDropdown>
    </MenuContainer>
  );
};

const Container = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding: 0 5%;
  align-items: center;
  height: 3rem;
`;

const LeftContainer = styled.div`
  display: flex;
`;

const RightContainer = styled.div`
  display: flex;
`;

const PageTitle = styled.header`
  padding-right: 3rem;
  font-size: 2rem;

  @media screen and (max-width: 680px) {
    padding-right: 0;
    font-size: 1.5rem;
  }
`;

const NavContainer = styled.nav`
  width: 100%;
  background-color: ${(props) => props.theme.background};
  color: ${(props) => props.theme.color};
`;

export type ActionType = {
  text: string;
  link?: string;
  action?: () => void;
  component?: ReactNode;
};

const Nav = ({
  confirmNavigation,
  confirmText,
  returnTo,
}: {
  confirmNavigation?: boolean;
  confirmText?: string;
  returnTo?: string;
}) => {
  const { me, connected } = useContext(MeContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);
  const openAction = () => setMenuOpen(!menuOpen);

  return (
    <>
      <NavContainer>
        <Container>
          <LeftContainer>
            <PageTitle>
              <Link
                href="/"
                onClick={(e) => {
                  if (!confirmNavigation) return;

                  if (
                    typeof window !== 'undefined' &&
                    !window.confirm(confirmText)
                  )
                    e.preventDefault();
                }}
              >
                <Title>Personnages</Title>
              </Link>
            </PageTitle>
          </LeftContainer>
          <RightContainer>
            <LogButton
              data={me}
              connected={connected}
              action={openAction}
              close={close}
              menuOpen={menuOpen}
              returnTo={returnTo}
            />
          </RightContainer>
        </Container>
        <BlackLine />
      </NavContainer>
    </>
  );
};

export default Nav;

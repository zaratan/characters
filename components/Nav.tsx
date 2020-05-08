/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable styled-components-a11y/anchor-is-valid */
/* eslint-disable no-nested-ternary */
import React, { useState, useRef, useEffect, ReactNode } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import styled from 'styled-components';
import { useClickAway, useMouse } from 'react-use';
import { BlackLine, EmptyLine } from '../styles/Lines';
import {
  generateHandleClick,
  generateHandleKeypress,
} from '../helpers/handlers';
import { Title, SubTitle } from '../styles/Titles';
import { useScroll } from '../hooks/useScroll';

const SvgHamburger = () => (
  <svg
    height="24"
    className="octicon octicon-three-bars"
    viewBox="0 0 12 16"
    version="1.1"
    width="18"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M11.41 9H.59C0 9 0 8.59 0 8c0-.59 0-1 .59-1H11.4c.59 0 .59.41.59 1 0 .59 0 1-.59 1h.01zm0-4H.59C0 5 0 4.59 0 4c0-.59 0-1 .59-1H11.4c.59 0 .59.41.59 1 0 .59 0 1-.59 1h.01zM.59 11H11.4c.59 0 .59.41.59 1 0 .59 0 1-.59 1H.59C0 13 0 12.59 0 12c0-.59 0-1 .59-1z"
    />
  </svg>
);

const ProfileImg = styled.img`
  height: 30px;
  border-radius: 50%;
`;

const MenuContainer = styled.div`
  position: relative;
  height: 100%;

  &.mobile-hidden {
    display: flex;
    align-items: center;
    @media screen and (max-width: 500px) {
      display: none;
    }
  }

  &.mobile-only {
    @media screen and (min-width: 501px) {
      display: none;
    }
  }
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
  border-bottom: 1px solid #ccc;
  padding: 0.5rem;
  white-space: nowrap;
  z-index: 3;
  @media screen and (max-width: 500px) {
    border-top: 2px solid #ccc;
    border-bottom: 0;
  }
`;

const MenuDropdownElem = styled.li`
  cursor: pointer;
  transition: 0.3s ease-in-out;
  :hover,
  :focus {
    background-color: #eee;
    outline: none;
  }
  a {
    color: black;
  }
  white-space: nowrap;
  padding: 0.3rem 0.5rem;
  z-index: 3;
  outline: none;

  &.action {
    color: blue;
  }
`;

const MenuDropdown = styled.ul<{ numberLi?: number; namePresent?: boolean }>`
  opacity: 0;
  visibility: hidden;
  position: absolute;
  right: 0;
  margin-top: 0.5rem;
  transform-origin: top right;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  border-radius: 5px;
  padding: 0.5rem 0rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);

  transition: opacity 0.3s ease-in-out, max-height 0.3s ease-in-out;

  &.open {
    opacity: 1;
    visibility: visible;
  }
  z-index: 3;
  background-color: #f8f8f8;
  @media screen and (max-width: 500px) {
    position: relative;
    width: 100%;
    max-height: 0;
    margin: 0;
    padding-top: 0;
    &.open {
      max-height: ${(props) => `${3.6 * (props.numberLi || 0) + 4}rem`};
    }
  }
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LogButton = ({
  data,
  close,
  menuOpen,
  action,
}: {
  data?: any;
  close: () => void;
  action: () => void;
  menuOpen: boolean;
}) => {
  const wrapperRef = useRef();
  useClickAway(wrapperRef, () => {
    close();
  });
  if (!data)
    return (
      <MenuContainer className="mobile-hidden">
        <span>Loading…</span>
      </MenuContainer>
    );
  if (data.error) {
    return (
      <MenuContainer className="mobile-hidden">
        <Link href="/api/login">
          <a>Connection</a>
        </Link>
      </MenuContainer>
    );
  }

  const handleClick = generateHandleClick(action);
  const handleKeypress = generateHandleKeypress(action);

  return (
    <MenuContainer ref={wrapperRef} className="mobile-hidden">
      <MenuButton
        onClick={handleClick}
        onKeyPress={handleKeypress}
        tabIndex={0}
        role="button"
      >
        <ProfileImg src={data.picture} alt="P" />
      </MenuButton>
      <MenuDropdown className={menuOpen ? 'open' : ''}>
        <NameContainer>{data.name}</NameContainer>
        <Link href="/api/logout" prefetch={false} passHref>
          <MenuDropdownElem as="a">Déconnection</MenuDropdownElem>
        </Link>
      </MenuDropdown>
    </MenuContainer>
  );
};

const MobileButton = ({ openAction }: { openAction: () => void }) => {
  const handleClick = generateHandleClick(openAction);
  const handleKeypress = generateHandleKeypress(openAction);

  return (
    <MenuContainer className="mobile-only">
      <MenuButton
        onClick={handleClick}
        onKeyPress={handleKeypress}
        tabIndex={0}
        role="button"
      >
        <SvgHamburger />
      </MenuButton>
    </MenuContainer>
  );
};

const MobileMenu = ({
  data,
  actions,
  menuOpen,
}: {
  data: any;
  actions?: Array<{
    text: string;
    link?: string;
    action?: () => void;
    component?: ReactNode;
  }>;
  menuOpen: boolean;
  openAction: () => void;
}) => (
  <MenuContainer className="mobile-only">
    <MenuDropdown
      className={menuOpen ? 'open' : ''}
      numberLi={1 + actions.length}
      namePresent={!data?.error}
    >
      {actions.map((action) => {
        if (action.link) {
          return (
            <Link href={action.link} passHref key={action.text}>
              <MenuDropdownElem as="a">{action.text}</MenuDropdownElem>
            </Link>
          );
        }
        if (action.component !== undefined) {
          if (action.component === null) return null;
          return (
            <MenuDropdownElem key={action.text}>
              {action.component}
            </MenuDropdownElem>
          );
        }
        const handleClickAction = generateHandleClick(action.action);
        const handleKeypressAction = generateHandleKeypress(action.action);
        return (
          <MenuDropdownElem
            key={action.text}
            as="span"
            role="button"
            onClick={handleClickAction}
            onKeyPress={handleKeypressAction}
            tabIndex={0}
          >
            {action.text}
          </MenuDropdownElem>
        );
      })}
      {data ? (
        data.error ? (
          <Link href="/api/login">
            <MenuDropdownElem as="a">Connection</MenuDropdownElem>
          </Link>
        ) : (
          <>
            <NameContainer>{data.name}</NameContainer>
            <Link href="/api/logout" prefetch={false} passHref>
              <MenuDropdownElem as="a">Déconnection</MenuDropdownElem>
            </Link>
          </>
        )
      ) : (
        <MenuDropdownElem>Loading…</MenuDropdownElem>
      )}
    </MenuDropdown>
  </MenuContainer>
);

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

const ActionsContainer = styled.ul`
  display: flex;

  @media screen and (max-width: 500px) {
    display: none;
  }
`;

const Action = styled.li`
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  font-size: 1.4rem;
  cursor: pointer;
  span {
    outline: none;
    :hover,
    :focus {
      color: darkcyan;
    }
  }
`;

const PageTitle = styled.header`
  padding-right: 3rem;
  font-size: 2rem;

  @media screen and (max-width: 500px) {
    padding-right: 0;
    font-size: 1.5rem;
  }
`;

const calculateHeaderPositioning = (
  currentScroll: number,
  scrollingUp: boolean,
  elY?: number
) => {
  if (currentScroll < 80 || elY < 120) {
    return `
        top: 0;
      `;
  }

  if (scrollingUp)
    return `
      top:0;
    `;

  return `
      top: -60px;
    `;
};

const NavContainer = styled.nav<{
  currentScroll: number;
  scrollingUp: boolean;
  elY?: number;
}>`
  transition: top 0.3s ease-in-out;
  position: fixed;
  width: 100%;
  z-index: 4;
  background-color: white;
  ${(props) =>
    calculateHeaderPositioning(
      props.currentScroll,
      props.scrollingUp,
      props.elY
    )}
`;

const Nav = ({
  actions = [],
}: {
  actions?: Array<{
    text: string;
    link?: string;
    action?: () => void;
    component?: ReactNode;
  }>;
}) => {
  const { data } = useSWR('/api/me', {
    errorRetryCount: 0, // If it fails, it's probably because the user isn't logged-in
  });
  const ref = React.useRef(null);
  const { elY } = useMouse(ref);

  const { currentScroll, scrollingUp } = useScroll();
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);
  useEffect(() => {
    if (currentScroll < 80 || elY < 120) return;

    if (scrollingUp) return;

    close();
  }, [currentScroll, scrollingUp, elY]);
  const openAction = () => setMenuOpen(!menuOpen);

  return (
    <>
      <NavContainer
        currentScroll={currentScroll}
        scrollingUp={scrollingUp}
        elY={elY}
        ref={ref}
      >
        <Container>
          <LeftContainer>
            <PageTitle>
              <Link href="/" passHref>
                <Title as="a">Personnages</Title>
              </Link>
            </PageTitle>
            <ActionsContainer>
              {actions.map((action) => {
                if (action.link) {
                  return (
                    <Action key={action.text}>
                      <Link href={action.link} passHref>
                        <SubTitle as="a">{action.text}</SubTitle>
                      </Link>
                    </Action>
                  );
                }
                if (action.component !== undefined) {
                  if (action.component === null) return null;
                  return (
                    <Action key={action.text}>
                      <SubTitle as="span">{action.component}</SubTitle>
                    </Action>
                  );
                }
                const handleClick = generateHandleClick(action.action);
                const handleKeypress = generateHandleKeypress(action.action);
                return (
                  <Action key={action.text}>
                    <SubTitle
                      as="span"
                      role="button"
                      onClick={handleClick}
                      onKeyPress={handleKeypress}
                      tabIndex={0}
                    >
                      {action.text}
                    </SubTitle>
                  </Action>
                );
              })}
            </ActionsContainer>
          </LeftContainer>
          <MobileButton openAction={openAction} />
          <LogButton
            data={data}
            action={openAction}
            close={close}
            menuOpen={menuOpen}
          />
        </Container>
        <MobileMenu
          data={data}
          actions={actions}
          menuOpen={menuOpen}
          openAction={openAction}
        />
        <BlackLine />
      </NavContainer>
      <EmptyLine />
      <EmptyLine />
    </>
  );
};

export default Nav;

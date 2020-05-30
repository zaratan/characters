/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable styled-components-a11y/anchor-is-valid */
/* eslint-disable no-nested-ternary */
import React, {
  useState,
  useRef,
  useEffect,
  ReactNode,
  useContext,
} from 'react';
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
import { MeType } from '../types/MeType';
import MeContext from '../contexts/MeContext';

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
    &.text-only {
      display: flex;
      align-items: center;
    }
    @media screen and (max-width: 680px) {
      display: none;
      &.text-only {
        display: none;
      }
    }
  }

  &.mobile-only {
    @media screen and (min-width: 681px) {
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
  @media screen and (max-width: 680px) {
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
  @media screen and (max-width: 680px) {
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
  connected,
  close,
  menuOpen,
  action,
}: {
  data?: MeType;
  connected?: boolean;
  close: () => void;
  action: () => void;
  menuOpen: boolean;
}) => {
  const wrapperRef = useRef();
  useClickAway(wrapperRef, () => {
    close();
  });
  if (!connected || !data?.auth) {
    return (
      <MenuContainer className="mobile-hidden text-only">
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

const MobileAction = ({ action }: { action: ActionType }) => {
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
      <MenuDropdownElem key={action.text}>{action.component}</MenuDropdownElem>
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
};

const MobileMenu = ({
  data,
  connected,
  actions = [],
  loggedActions = [],
  menuOpen,
}: {
  data: MeType;
  connected: boolean;
  actions?: Array<ActionType>;
  loggedActions?: Array<ActionType>;
  menuOpen: boolean;
}) => (
  <MenuContainer className="mobile-only">
    <MenuDropdown
      className={menuOpen ? 'open' : ''}
      numberLi={1 + actions.length}
      namePresent={!data?.error}
    >
      {actions.map((action) => (
        <MobileAction key={action.text} action={action} />
      ))}
      {connected ? (
        loggedActions.map((action) => (
          <MobileAction key={action.text} action={action} />
        ))
      ) : loggedActions.length > 0 ? (
        <span>Connectez vous pour le reste</span>
      ) : null}
      {!connected || !data?.auth ? (
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

const RightContainer = styled.div`
  display: flex;
`;

const ActionsContainer = styled.ul`
  display: flex;

  @media screen and (max-width: 680px) {
    display: none;
  }
`;

const RightActionsContainer = styled(ActionsContainer)`
  padding-right: 1rem;
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

  @media screen and (max-width: 680px) {
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

export type ActionType = {
  text: string;
  link?: string;
  action?: () => void;
  component?: ReactNode;
};

const NavAction = ({ action }: { action: ActionType }) => {
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
};

const Nav = ({
  actions = [],
  loggedActions = [],
}: {
  loggedActions?: Array<ActionType>;
  actions?: Array<ActionType>;
}) => {
  const { me, connected } = useContext(MeContext);
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
              {actions.map((action) => (
                <NavAction action={action} />
              ))}
            </ActionsContainer>
          </LeftContainer>
          <RightContainer>
            <RightActionsContainer>
              {connected ? (
                loggedActions.map((action) => <NavAction action={action} />)
              ) : loggedActions.length > 0 ? (
                <span>Pour les autres actions: </span>
              ) : null}
            </RightActionsContainer>
            <MobileButton openAction={openAction} />
            <LogButton
              data={me}
              connected={connected}
              action={openAction}
              close={close}
              menuOpen={menuOpen}
            />
          </RightContainer>
        </Container>
        <MobileMenu
          data={me}
          connected={connected}
          actions={actions}
          loggedActions={loggedActions}
          menuOpen={menuOpen}
        />
        <BlackLine />
      </NavContainer>
      <EmptyLine />
      <EmptyLine />
    </>
  );
};

export default Nav;

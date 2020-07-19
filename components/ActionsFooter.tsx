import React, { useContext, ReactNode } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { BlackLine, EmptyLine } from '../styles/Lines';
import MeContext from '../contexts/MeContext';
import {
  generateHandleClick,
  generateHandleKeypress,
} from '../helpers/handlers';

type ActionType = {
  name: string;
  glyph: string;
} & (
  | {
      link: string;
      act?: null;
      component?: null;
    }
  | {
      act: () => void;
      link?: null;
      component?: null;
    }
  | {
      component: ReactNode;
      act?: null;
      link?: null;
    }
);

const ActionsFooter = ({
  actions,
  loggedActions,
}: {
  actions?: Array<ActionType>;
  loggedActions?: Array<ActionType>;
}) => {
  const { connected } = useContext(MeContext);
  const allActions = [
    ...(actions || []),
    ...(connected && loggedActions ? loggedActions : []),
  ];
  return (
    <>
      <DesktopActionsFooter actions={allActions} />
      <MobileActionsFooter actions={allActions} />
    </>
  );
};

const DesktopActionsFooter = ({ actions }: { actions: Array<ActionType> }) => (
  <DesktopActionsContainer>
    <DesktopActions>
      {actions.map((action) => {
        if (action.link) {
          return (
            <Link href={action.link}>
              <a>
                <DesktopAction key={action.name}>
                  <GlyphAction>{action.glyph}</GlyphAction>
                  <span className="full-text">{action.name}</span>
                </DesktopAction>
              </a>
            </Link>
          );
        }
        if (action.component !== undefined) {
          if (action.component === null) return null;
          return (
            <DesktopAction key={action.name}>
              <GlyphAction>{action.glyph}</GlyphAction>
              {action.component}
            </DesktopAction>
          );
        }
        const handleClick = generateHandleClick(action.act);
        const handleKeypress = generateHandleKeypress(action.act);
        return (
          <DesktopAction
            key={action.name}
            role="button"
            onClick={handleClick}
            onKeyPress={handleKeypress}
            tabIndex={0}
          >
            <GlyphAction>{action.glyph}</GlyphAction>
            <span className="full-text">{action.name}</span>
          </DesktopAction>
        );
      })}
    </DesktopActions>
  </DesktopActionsContainer>
);

const GlyphAction = styled.span`
  font-size: 2rem;
`;

const DesktopAction = styled.li`
  border-radius: 40px;
  height: 80px;
  min-width: 80px;
  background-color: #eee;
  border: 1px solid lightgray;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem 0;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: padding 0.3s ease-in-out;

  .full-text {
    overflow-x: hidden;
    max-width: 0;
    transition: max-width 0.3s ease-in-out, padding-left 0.3s ease-in-out;
    white-space: nowrap;
    padding-left: 0rem;
  }
  @media screen and (any-hover: hover) {
    &:hover,
    &:focus {
      padding: 1.5rem;
      .full-text {
        max-width: 160px;
        padding-left: 1rem;
      }
    }
  }
`;

const DesktopActions = styled.ul`
  display: flex;
  flex-direction: column;
  justify-content: right;
  align-items: flex-end;
`;

const DesktopActionsContainer = styled.div`
  @media screen and (max-width: 680px) {
    display: none;
  }
  position: fixed;
  bottom: 5rem;
  right: 1rem;
`;

const MobileActionsFooter = ({
  actions,
}: {
  actions: Array<{ name: string; link?: string; act?: () => void }>;
}) => (
  <>
    <MobileActionsContainer>
      <BlackLine className="thin mobile-only" />
      <EmptyLine className="thin mobile-only" />
      <MobileActions>
        {actions?.map((action) =>
          action.link ? (
            <Link href={action.link}>
              <a>
                <MobileAction key={action.name}>{action.name}</MobileAction>
              </a>
            </Link>
          ) : (
            <MobileAction key={action.name}>{action.name}</MobileAction>
          )
        )}
      </MobileActions>
    </MobileActionsContainer>
  </>
);

const MobileActionsContainer = styled.div`
  padding: 1rem;

  @media screen and (min-width: 681px) {
    display: none;
  }
`;

const MobileActions = styled.ul`
  display: grid;
  column-gap: 0.5rem;
  grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
`;

const MobileAction = styled.li`
  text-align: center;
  margin: auto;
  padding: 1rem;
  background-color: #eee;
  border-radius: 5px;
  border: 1px solid lightgray;
  width: 100%;
  cursor: pointer;
`;

export default ActionsFooter;

import type { ComponentType } from 'react';
import { useContext } from 'react';
import Link from 'next/link';
import { BlackLine, EmptyLine } from '../styles/Lines';
import MeContext from '../contexts/MeContext';
import {
  generateHandleClick,
  generateHandleKeyDown,
} from '../helpers/handlers';
import AccessesContext from '../contexts/AccessesContext';
import classNames from '../helpers/classNames';
import styles from './ActionsFooter.module.css';

type ActionType = {
  name: string;
  glyph: string | ComponentType;
} & (
  | {
      link: string;
      act?: null;
      active?: null;
      component?: null;
      componentProps?: null;
    }
  | {
      act: () => void;
      active?: boolean;
      link?: null;
      component?: null;
      componentProps?: null;
    }
  | {
      component: ComponentType<Record<string, unknown>>;
      componentProps?: Record<string, unknown>;
      active?: null;
      act?: null;
      link?: null;
    }
);

const DesktopActionsFooter = ({ actions }: { actions: Array<ActionType> }) => (
  <aside className="max-lg:hidden fixed bottom-20 right-4 z-[2]">
    <div className="flex flex-col items-end">
      {actions.map((action) => {
        const glyphContent =
          typeof action.glyph === 'string' ? action.glyph : <action.glyph />;

        if (action.link) {
          return (
            <Link
              href={action.link}
              key={action.name}
              className={styles.desktopAction}
            >
              <span className={styles.glyphAction}>{glyphContent}</span>
              <span className={styles.fullText}>{action.name}</span>
            </Link>
          );
        }
        if (action.component !== undefined) {
          if (action.component === null) return null;

          return (
            <div key={action.name} className={styles.desktopAction}>
              <action.component {...action.componentProps}>
                <span className={styles.glyphAction}>{glyphContent}</span>
                <span className={styles.fullText}>{action.name}</span>
              </action.component>
            </div>
          );
        }
        const handleClick = generateHandleClick(action.act!);
        const handleKeyDown = generateHandleKeyDown(action.act!);
        return (
          <div
            key={action.name}
            className={styles.desktopAction}
            role="button"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <span
              className={classNames(
                styles.glyphAction,
                action.active ? 'active' : null
              )}
            >
              {glyphContent}
            </span>
            <span className={styles.fullText}>{action.name}</span>
          </div>
        );
      })}
    </div>
  </aside>
);

const MobileActionsFooter = ({ actions }: { actions: Array<ActionType> }) => (
  <>
    <aside className="lg:hidden p-4 w-full">
      <BlackLine className="thin mobile-only" />
      <EmptyLine className="thin mobile-only" />
      <div className="flex flex-col">
        {actions?.map((action) => {
          if (action.link) {
            return (
              <div key={action.name} className={styles.mobileAction}>
                <Link href={action.link}>{action.name}</Link>
              </div>
            );
          }
          if (action.component !== undefined) {
            if (action.component === null) return null;
            return (
              <div key={action.name} className={styles.mobileAction}>
                <action.component {...action.componentProps}>
                  {action.name}
                </action.component>
              </div>
            );
          }
          const handleClick = generateHandleClick(action.act!);
          const handleKeyDown = generateHandleKeyDown(action.act!);
          return (
            <div
              key={action.name}
              className={styles.mobileAction}
              role="button"
              onClick={handleClick}
              onKeyDown={handleKeyDown}
              tabIndex={0}
            >
              {action.name}
            </div>
          );
        })}
      </div>
    </aside>
  </>
);

const ActionsFooter = ({
  actions,
  loggedActions,
  ownerActions,
}: {
  actions?: Array<ActionType>;
  loggedActions?: Array<ActionType>;
  ownerActions?: Array<ActionType>;
}) => {
  const { connected, me } = useContext(MeContext);
  const { editors } = useContext(AccessesContext);
  const allActions = [
    ...(actions || []),
    ...(connected && loggedActions ? loggedActions : []),
    ...(connected && me && editors.includes(me.id) && ownerActions
      ? ownerActions
      : []),
  ];
  return (
    <>
      <DesktopActionsFooter actions={allActions} />
      <MobileActionsFooter actions={allActions} />
    </>
  );
};

export default ActionsFooter;

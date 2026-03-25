import type { ReactNode } from 'react';
import { useState, useRef, useContext } from 'react';
import Link from 'next/link';
import useClickAway from '../hooks/useClickAway';
import { signIn, signOut } from 'next-auth/react';
import type { MeType } from '../types/MeType';
import { BlackLine } from '../styles/Lines';
import {
  generateHandleClick,
  generateHandleKeyDown,
} from '../helpers/handlers';
import { Title } from '../styles/Titles';
import MeContext from '../contexts/MeContext';
import UserAvatar from './UserAvatar';
import classNames from '../helpers/classNames';
import styles from './Nav.module.css';

// ProfileImg replaced by UserAvatar component

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
      <div className="relative h-full text-only">
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
      </div>
    );
  }

  const handleClick = generateHandleClick(action);
  const handleKeyDown = generateHandleKeyDown(action);

  return (
    <div className="relative h-full" ref={wrapperRef}>
      <button
        className="flex items-center h-full cursor-pointer"
        style={{
          outline: 'none',
          background: 'none',
          border: 'none',
          color: 'inherit',
          font: 'inherit',
          padding: 0,
        }}
        data-testid="user-menu-button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <UserAvatar
          name={data?.name ?? null}
          image={data?.image ?? null}
          userId={data?.id}
          size={30}
        />
      </button>
      <ul className={classNames(styles.menuDropdown, menuOpen ? 'open' : '')}>
        <li className={styles.nameContainer}>{data?.name || data?.email}</li>
        <li className={styles.menuDropdownElem}>
          <Link href="/profile">Profil</Link>
        </li>
        <li className={styles.menuDropdownElem}>
          <button
            onClick={() => signOut()}
            style={{
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              color: 'inherit',
              font: 'inherit',
              width: '100%',
              textAlign: 'left',
              padding: 0,
            }}
          >
            Déconnection
          </button>
        </li>
      </ul>
    </div>
  );
};

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
      <nav className={styles.navContainer}>
        <div className="flex w-full justify-between px-[5%] items-center h-12">
          <div className="flex">
            <header className="pr-12 text-[2rem] max-lg:pr-0 max-lg:text-[1.5rem]">
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
            </header>
          </div>
          <div className="flex">
            <LogButton
              data={me}
              connected={connected}
              action={openAction}
              close={close}
              menuOpen={menuOpen}
              returnTo={returnTo}
            />
          </div>
        </div>
        <BlackLine />
      </nav>
    </>
  );
};

export default Nav;

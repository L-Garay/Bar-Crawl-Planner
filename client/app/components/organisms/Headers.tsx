import React from 'react';
import { Link } from '@remix-run/react';
import BeerIcon from '../../assets/basicBeerSvg';
import { useOnClickOutside } from '~/utils/useOnClickOutside';

const NavMenu = () => {
  return (
    <div className="menu-container">
      <div className="menu-items">
        <Link to="/profile" className="menuLink">
          Profile
        </Link>
        <Link to="/account" className="menuLink">
          Account
        </Link>
        <Link to="/support" className="menuLink">
          Support
        </Link>
        <Link to="/resources/logout" className="menuLink">
          Logout
        </Link>
      </div>
    </div>
  );
};

export const BasicHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState<boolean>(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, () => setIsMenuOpen(false));

  return (
    <div id="header-container">
      <div className="logo-wrapper">
        <BeerIcon />
      </div>
      <div className="links-wrapper">
        <div className="links">
          <Link to="/homepage" className="link">
            Home
          </Link>
          <Link to="/outings" className="link">
            Outings
          </Link>
          <Link to="/friends" className="link">
            Friends
          </Link>
          <div
            className="menuToggle link"
            onClick={() => setIsMenuOpen((oldValue) => !oldValue)}
            ref={menuRef}
          >
            Menu {isMenuOpen ? <NavMenu /> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

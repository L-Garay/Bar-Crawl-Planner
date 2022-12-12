import type { LinksFunction } from '@remix-run/node';
import React from 'react';
import styles from '../generatedStyles/footer.css';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: styles,
    },
  ];
};

export const BasicFooter = () => {
  return (
    <div id="footer-container">
      <div className="message">
        This can be a short message of any kind really.
      </div>
      <div className="link-list list1">
        <ul>
          <li>Link to one page</li>
          <li>Link to a second page</li>
          <li>Link to a third page</li>
        </ul>
      </div>
      <div className="link-list list2">
        <ul>
          <li>External link one</li>
          <li>External link two</li>
        </ul>
      </div>
      <div className="social-media">
        <div>
          *icon here* <span>LinkedIn</span>
        </div>
        <div>
          *icon here* <span>Twitter</span>
        </div>
        <div>
          *icon here* <span>Github</span>
        </div>
      </div>
      <div className="licenses">Copyright goes here along with MIT licence</div>
    </div>
  );
};

import { Link } from '@remix-run/react';

export const BasicFooter = () => {
  return (
    <footer id="footer-container">
      <div className="message">
        This can be a short message of any kind really.
      </div>
      <div className="link-list list1">
        <ul>
          <Link to="/homepage">Home</Link>
          <li>Account</li>
          <li>FAQ</li>
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
      <div id="licenses">Copyright goes here along with MIT licence</div>
    </footer>
  );
};

export const LandingPageFooter = () => {
  return (
    <footer id="footer-container">
      <div className="message">
        This can be a short message of any kind really.
      </div>
      <div className="link-list list1">
        <ul>
          <li>FAQ</li>
          <li>Contact us</li>
          <li>Something else</li>
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
      <div id="licenses">Copyright goes here along with MIT licence</div>
    </footer>
  );
};

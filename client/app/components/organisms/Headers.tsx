import BeerIcon from '../../assets/basicBeerSvg';

export const BasicHeader = () => {
  return (
    <div id="header-container">
      <div className="logo-wrapper">
        <BeerIcon />
      </div>
      <div className="links-wrapper">
        <div className="links">
          <p className="link">Link 1</p>
          <p className="link">Link 2</p>
          <p className="link">Link 3</p>
          <p className="link">Link 4</p>
        </div>
      </div>
    </div>
  );
};

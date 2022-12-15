export const Basic = () => {
  return (
    <div className="loading-spinner-wrapper">
      <div className="circle">
        <div className="segment"></div>
        <div className="inner-circle"></div>
      </div>
    </div>
  );
};

export const Static = () => {
  return (
    <div className="loading-spinner-wrapper">
      <div className="circle">
        <div className="segment one"></div>
        <div className="segment two"></div>
        <div className="segment three"></div>
        <div className="inner-circle"></div>
      </div>
    </div>
  );
};

export const Dynamic = () => {
  return (
    <div className="color-canvas">
      <div className="loading-spinner-wrapper S2">
        <div className="circle-wrapper">
          <div className="circle">
            <div className="segmentS2 oneS2"></div>
            <div className="segmentS2 twoS2"></div>
            <div className="segmentS2 threeS2"></div>
            <div className="inner-circle"></div>
          </div>
        </div>
      </div>
      <div className="clipping-wrapper">
        <div className="clipping-layer"></div>
      </div>
    </div>
  );
};

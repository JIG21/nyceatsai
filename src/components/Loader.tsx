import React from "react";

export const Loader: React.FC<{size?: number; label?: string}> = ({ size = 72, label = "Loading" }) => {
  const style: React.CSSProperties = { width: size, height: size };
  return (
    <div className="loader-wrap" role="status" aria-live="polite" aria-busy="true">
      <div className="loader" style={style} />
      {label ? <div className="loader-text">{label}...</div> : null}
    </div>
  );
};

export default Loader;

import React from "react";

export const NeonLoader: React.FC<{size?: number; label?: string}> = ({ size = 52, label = 'Loading...' }) => {
  const style: React.CSSProperties = { width: size, height: size };
  return (
    <div className="neon-loader">
      <div className="neon-spinner" style={style} aria-hidden="true">
        <div className="core"/>
      </div>
      <span style={{color:'var(--muted-2)',fontSize:14}} aria-live="polite">{label}</span>
    </div>
  );
};

export default NeonLoader;
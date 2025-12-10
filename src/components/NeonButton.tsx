import React from "react";
import classNames from "classnames";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "default"; };

export const NeonButton: React.FC<Props> = ({ variant = "default", className, children, ...rest }) => {
  const cls = classNames("neon-button", {
    "--primary": variant === "primary",
    "--ghost": variant === "ghost",
  }, className);
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
};

export default NeonButton;
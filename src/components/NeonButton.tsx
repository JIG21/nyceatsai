import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "default";
};

export const NeonButton: React.FC<Props> = ({ variant = "default", className = "", children, ...rest }) => {
  const mods = ["neon-button", ...(className ? [className] : [])];
  if (variant === "primary") mods.push("--primary");
  if (variant === "ghost") mods.push("--ghost");
  return (
    <button className={mods.join(" ")} {...rest}>
      {children}
    </button>
  );
};

export default NeonButton;

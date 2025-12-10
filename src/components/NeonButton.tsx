import React from "react";

/**
 * Small local classnames helper to avoid an external dependency.
 * Accepts strings, objects (key -> boolean), and ignores undefined/null.
 */
function cx(...inputs: Array<string | Record<string, any> | undefined>) {
  const classes: string[] = [];
  inputs.forEach((input) => {
    if (!input) return;
    if (typeof input === "string") {
      classes.push(input);
      return;
    }
    if (typeof input === "object") {
      Object.keys(input).forEach((key) => {
        // allow truthy values to add the key
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (input[key]) classes.push(key);
      });
    }
  });
  return classes.join(" ");
}

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "default";
};

export const NeonButton: React.FC<Props> = ({ variant = "default", className, children, ...rest }) => {
  const cls = cx(
    "neon-button",
    { "--primary": variant === "primary", "--ghost": variant === "ghost" },
    className
  );
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
};

export default NeonButton;

import type { ReactNode } from "react";
import styles from "./Button.module.css";

export interface ButtonProps {
  href?: string;
  small?: boolean;
  ghost?: boolean;
  children: ReactNode;
}

export function Button({ href = "#", small, ghost, children }: ButtonProps) {
  const className = [
    styles.button,
    small ? styles.small : "",
    ghost ? styles.ghost : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

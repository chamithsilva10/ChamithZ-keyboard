import type { Ref } from "react";
import type { SectionName } from "../lib/ui";
import { Button } from "./Button";
import styles from "./Nav.module.css";

const NAV_ITEMS: { name: SectionName; label: string; href: string }[] = [
  { name: "overview", label: "Overview", href: "#overview" },
  { name: "vibe-row", label: "The action row", href: "#vibe-row" },
  { name: "inside", label: "Inside", href: "#inside" },
  { name: "specs", label: "Specs", href: "#specs" },
];

export interface NavProps {
  ref?: Ref<HTMLElement>;
  active: SectionName | null;
  onGo: (name: SectionName) => void;
}

export function Nav({ ref, active, onGo }: NavProps) {
  return (
    <nav ref={ref} className={styles.nav}>
      <a
        href="#overview"
        className={styles.logo}
        onClick={(e) => {
          e.preventDefault();
          onGo("overview");
        }}
      >
        <span>Chamith</span>Z
      </a>
      <ul className={styles.links}>
        {NAV_ITEMS.map((item) => (
          <li key={item.name}>
            <a
              href={item.href}
              className={`${styles.link} ${active === item.name ? styles.active : ""}`}
              aria-current={active === item.name ? "true" : undefined}
              onClick={(e) => {
                e.preventDefault();
                onGo(item.name);
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <Button small href="#">
        Pre-order
      </Button>
    </nav>
  );
}

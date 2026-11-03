import type { Ref } from "react";
import { Button } from "./Button";
import styles from "./Hero.module.css";

export interface HeroProps {
  ref?: Ref<HTMLElement>;
  cueRef?: Ref<HTMLSpanElement>;
}

export function Hero({ ref, cueRef }: HeroProps) {
  return (
    <header ref={ref} className={styles.hero}>
      <h1 className={styles.heading}>
        The keyboard for
        <br />
        <em>developers.</em>
      </h1>
      <p className={styles.lede}>
        A low-profile mechanical keyboard for Mac, with an action row: four keys to
        command, talk, review and accept, right where your thumbs already are.
      </p>
      <div className={styles.cta}>
        <Button href="#">Pre-order · $149</Button>
        <span ref={cueRef} className={styles.cue}>
          Scroll to look inside <span className={styles.arrow}>↓</span>
        </span>
      </div>
    </header>
  );
}

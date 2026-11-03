import type { Ref } from "react";
import { Button } from "./Button";
import styles from "./Final.module.css";

export interface FinalProps {
  ref?: Ref<HTMLElement>;
}

export function Final({ ref }: FinalProps) {
  return (
    <section ref={ref} className={styles.final}>
      <h2 className={styles.heading}>
        Type, only when
        <br />
        it matters.
      </h2>
      <p className={styles.lede}>ChamithZ for Mac. In Graphite and Ember.</p>
      <div className={styles.buttons}>
        <Button href="#">Pre-order · $149</Button>
        <Button href="#" ghost>
          Compare models
        </Button>
      </div>
      <small className={styles.footnote}>© 2026 ChamithZ</small>
    </section>
  );
}

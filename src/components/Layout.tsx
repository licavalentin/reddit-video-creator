import React from "react";
import { AbsoluteFill } from "remotion";

import styles from "../styles/components/layout.module.scss";

type Props = {
  className?: string;
};

const Layout: React.FC<Props> = ({ className, children }) => {
  return (
    <>
      <AbsoluteFill
        className={`${styles.layout} ${className} layout__container`}
      >
        {children}
      </AbsoluteFill>
    </>
  );
};

export default Layout;

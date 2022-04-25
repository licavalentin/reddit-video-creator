import React from "react";
import { AbsoluteFill } from "remotion";

import styles from "../styles/components/layout.module.scss";
import { BackgroundImage } from "./UI";

type Props = {
  className?: string;
  src?: string;
};

const Layout: React.FC<Props> = ({ className, src, children }) => {
  return (
    <>
      {src && <BackgroundImage src={src} />}

      <AbsoluteFill
        className={`${styles.layout} ${className} layout__container`}
      >
        {children}
      </AbsoluteFill>
    </>
  );
};

export default Layout;

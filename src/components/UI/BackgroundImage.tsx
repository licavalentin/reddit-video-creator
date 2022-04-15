import React from "react";
import { Img, staticFile } from "remotion";

import styles from "../../styles/components/UI/backgroun_img.module.scss";

type Props = {
  path: string;
};

const BackgrounImage: React.FC<Props> = ({ path }) => {
  return <Img src={staticFile(path)} className={styles.container} />;
};

export default BackgrounImage;

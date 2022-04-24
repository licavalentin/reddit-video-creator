import React from "react";
import { Img, staticFile } from "remotion";

import styles from "../../styles/components/UI/backgroun_img.module.scss";

type Props = {
  src: string;
};

const BackgrounImage: React.FC<Props> = ({ src }) => {
  return <Img src={staticFile(src)} className={styles.container} />;
};

export default BackgrounImage;

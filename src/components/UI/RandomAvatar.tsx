import React from "react";
import { Img, staticFile } from "remotion";

import styles from "../../styles/components/UI/random_avatar.module.scss";

type Props = {
  className?: string;
};

const RandomAvatar: React.FC<Props> = ({ className }) => {
  const ramdomHead = Math.floor(Math.random() * 173);
  const ramdomFace = Math.floor(Math.random() * 94);
  const ramdomBody = Math.floor(Math.random() * 178);

  return (
    <div className={`${styles.avatar} ${className}`}>
      <Img src={staticFile(`/avatar/default-body.png`)} />
      <Img src={staticFile(`/avatar/body/${ramdomBody}-body.png`)} />
      <Img src={staticFile(`/avatar/default-head.png`)} />
      <Img src={staticFile(`/avatar/face/${ramdomFace}-face.png`)} />
      <Img src={staticFile(`/avatar/head/${ramdomHead}-head.png`)} />

      <div className={styles.avatar__background} />
    </div>
  );
};

export default RandomAvatar;

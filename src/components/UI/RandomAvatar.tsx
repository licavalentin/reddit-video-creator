import React from "react";
import { Img, staticFile } from "remotion";

import { AvatarDetails } from "../../interface/post";

import styles from "../../styles/components/UI/random_avatar.module.scss";

type Props = {
  className?: string;
  avatar: AvatarDetails;
};

const RandomAvatar: React.FC<Props> = ({ className, avatar }) => {
  const { face, head, body } = avatar;

  return (
    <div className={`${styles.avatar} ${className}`}>
      <Img src={staticFile(`/avatar/default-body.png`)} />
      <Img src={staticFile(`/avatar/body/${body}`)} />
      <Img src={staticFile(`/avatar/default-head.png`)} />
      <Img src={staticFile(`/avatar/face/${face}`)} />
      <Img src={staticFile(`/avatar/head/${head}`)} />

      <div className={styles.avatar__background} />
    </div>
  );
};

export default RandomAvatar;

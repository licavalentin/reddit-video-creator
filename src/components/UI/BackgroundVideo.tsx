import React from "react";
import { AbsoluteFill, staticFile, Video } from "remotion";

type Props = {
  videoPath: string;
};

import styles from "../../styles/components/UI/background_video.module.scss";

const BackgroundVideo: React.FC<Props> = ({ videoPath }) => {
  return (
    <AbsoluteFill className={styles.container}>
      <Video src={staticFile(videoPath)} muted className={styles.video} />
    </AbsoluteFill>
  );
};

export default BackgroundVideo;

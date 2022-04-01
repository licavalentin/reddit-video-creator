import React from "react";
import { AbsoluteFill, staticFile, Video } from "remotion";

import { video as videoConfig } from "../../config/video";

type Props = {
  videoPath: string;
};

import styles from "../../styles/components/UI/background_video.module.scss";

const BackgroundVideo: React.FC<Props> = ({ videoPath }) => {
  return (
    <AbsoluteFill className={styles.container}>
      {videoConfig.fps > 24 && (
        <Video src={staticFile(videoPath)} muted className={styles.video} />
      )}
    </AbsoluteFill>
  );
};

export default BackgroundVideo;

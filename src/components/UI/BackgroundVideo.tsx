import React from "react";
import { staticFile, Video } from "remotion";

type Props = {
  videoPath: string;
};

import styles from "../../styles/components/UI/background_video.module.scss";

const BackgroundVideo: React.FC<Props> = ({ videoPath }) => {
  return <Video src={staticFile(videoPath)} muted className={styles.video} />;
};

export default BackgroundVideo;

import React from "react";
import { Audio, Img, staticFile, useVideoConfig } from "remotion";

import { Mid } from "../interface/compositions";

import Layout from "./Layout";

import styles from "../styles/components/mid.module.scss";

const Mid: React.FC<Mid> = ({ logo }) => {
  const { durationInFrames } = useVideoConfig();
  const image = staticFile(logo);

  const audioFile = staticFile("/audio/intro.mp3");

  return (
    <Layout>
      <Audio
        src={audioFile}
        volume={0}
        startFrom={0}
        endAt={durationInFrames}
      />

      <div className={styles.container}>
        <Img src={image} />
      </div>
    </Layout>
  );
};

export default Mid;

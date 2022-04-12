import React from "react";
import { Audio, staticFile, useVideoConfig } from "remotion";

import { Outro as OutroProps } from "../interface/compositions";

import Layout from "./Layout";

import styles from "../styles/components/outro.module.scss";

const Outro: React.FC<OutroProps> = ({ outro }) => {
  const { durationInFrames } = useVideoConfig();

  const audioFile = staticFile("/audio/outro.mp3");

  return (
    <Layout>
      <Audio src={audioFile} startFrom={0} endAt={durationInFrames} />

      <div className={styles.outro}>
        <h1 className={styles.outro__title}>{outro}</h1>
      </div>
    </Layout>
  );
};

export default Outro;

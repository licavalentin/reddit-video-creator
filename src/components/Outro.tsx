import React from "react";

import { Outro as OutroProps } from "../interface/compositions";

import Layout from "./Layout";
import { BackgroundVideo } from "./UI";

import styles from "../styles/components/outro.module.scss";

const Outro: React.FC<OutroProps> = ({ outro }) => {
  return (
    <Layout>
      <BackgroundVideo videoPath="/videos/angry.webm" />

      <div className={styles.outro}>
        <h1 className={styles.outro__title}>{outro}</h1>
      </div>
    </Layout>
  );
};

export default Outro;

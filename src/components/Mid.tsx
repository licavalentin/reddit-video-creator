import React from "react";
import { Img, staticFile } from "remotion";

import { Mid } from "../interface/compositions";

import Layout from "./Layout";

import styles from "../styles/components/mid.module.scss";

const Mid: React.FC<Mid> = ({ logo, background }) => {
  const image = staticFile(logo);

  return (
    <Layout src={background}>
      <div className={styles.container}>
        <Img src={image} />
      </div>
    </Layout>
  );
};

export default Mid;

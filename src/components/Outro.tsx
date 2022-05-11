import React from "react";

import { Outro as OutroProps } from "../interface/compositions";

import Layout from "./Layout";

import styles from "../styles/components/outro.module.scss";

const Outro: React.FC<OutroProps> = ({ background }) => {
  return (
    <Layout src={background}>
      <div className={styles.outro} />
    </Layout>
  );
};

export default Outro;

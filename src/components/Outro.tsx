import React from "react";

import { Outro as OutroProps } from "../interface/compositions";

import Layout from "./Layout";

import styles from "../styles/components/outro.module.scss";

const Outro: React.FC<OutroProps> = ({ outro, background }) => {
  return (
    <Layout src={background}>
      <div className={styles.outro}>
        <h1 className={styles.outro__title}>{outro}</h1>
      </div>
    </Layout>
  );
};

export default Outro;

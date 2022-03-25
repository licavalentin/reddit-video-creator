import React from "react";
import { staticFile } from "remotion";

import Layout from "./Layout";

import styles from "../styles/components/outro.module.scss";

type Props = {
  outro: string;
};

const Outro: React.FC<Props> = ({ outro }) => {
  const image = staticFile(`/bc.PNG`);

  return (
    <Layout>
      <div
        // style={{
        //   backgroundImage: `url(${image})`,
        // }}
        className={styles.outro}
      >
        <h1 className={styles.outro__title}>{outro}</h1>
      </div>
    </Layout>
  );
};

export default Outro;

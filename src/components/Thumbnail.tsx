import React from "react";

import { Award } from "../interface/post";

import Layout from "./Layout";

import styles from "../styles/components/thumbnail.module.scss";
import { Awards } from "./UI";

type Props = {
  title: string;
  subreddit: string;
  awards: Award[];
};

const Thumbnail: React.FC<Props> = ({ title, subreddit, awards }) => {
  return (
    <Layout>
      <div className={styles.thumbnail}>
        <div className={styles.head}>
          <h3 className={styles.subreddit}>r/{subreddit}</h3>

          <Awards awards={awards} limit={3} counter={false} />
        </div>

        <div className={styles.thumbnail__title}>
          <h1 className={styles.title}>{title}</h1>
        </div>
      </div>
    </Layout>
  );
};

export default Thumbnail;

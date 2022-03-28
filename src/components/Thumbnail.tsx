import React from "react";

import { Thumbnail as ThumbnailProps } from "../interface/compositions";

import Layout from "./Layout";
import { Awards } from "./UI";

import styles from "../styles/components/thumbnail.module.scss";

const Thumbnail: React.FC<ThumbnailProps> = ({ title, subreddit, awards }) => {
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

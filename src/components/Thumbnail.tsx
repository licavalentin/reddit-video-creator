import React from "react";

import { Textfit } from "react-textfit";

import { Thumbnail as ThumbnailProps } from "../interface/compositions";

import Layout from "./Layout";
import { Awards } from "./UI";

import styles from "../styles/components/thumbnail.module.scss";

const Thumbnail: React.FC<ThumbnailProps> = ({
  title,
  subreddit,
  awards,
  background,
}) => {
  return (
    <Layout src={background}>
      <div className={styles.thumbnail}>
        <div className={styles.head}>
          <h3 className={styles.subreddit}>r/{subreddit}</h3>

          <Awards awards={awards} limit={3} counter={false} />
        </div>

        <div className={styles.thumbnail__title}>
          <Textfit mode="multi">
            <h1 className={styles.title}>{title}</h1>
          </Textfit>
        </div>
      </div>
    </Layout>
  );
};

export default Thumbnail;

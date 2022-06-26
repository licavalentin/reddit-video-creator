import React, { useEffect } from "react";

import fitty from "fitty";
import ScaleText from "react-scale-text";

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
          <ScaleText maxFontSize={1000000}>
            <p className={styles.title}>{title}</p>
          </ScaleText>
        </div>
      </div>
    </Layout>
  );
};

export default Thumbnail;

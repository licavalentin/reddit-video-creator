import React from "react";

import { Award } from "../interface/post";

import Layout from "./Layout";
import { RedditArrowIcon } from "./CustomIcons";
import { Awards } from "./UI";

import { roundUp } from "../utils/helper";

import styles from "../styles/components/intro.module.scss";

type Props = {
  title: string;
  author: string;
  awards: Award[];
  score: number;
};

const Intro: React.FC<Props> = ({ title, author, awards, score }) => {
  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.intro}>
          <div className={styles.score}>
            <RedditArrowIcon />

            <p>{roundUp(score)}</p>

            <RedditArrowIcon />
          </div>

          <div className={styles.details}>
            <div className={styles.details__header}>
              <p>Posted by u/{author}</p>

              <Awards awards={awards} />
            </div>

            <h1 className={styles.title}>{title}</h1>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Intro;

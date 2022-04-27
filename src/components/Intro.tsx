import React from "react";

import { Intro as IntroProps } from "../interface/compositions";

import Layout from "./Layout";
import { RedditArrowIcon } from "./CustomIcons";
import { Awards } from "./UI";

import { roundUp } from "../utils/helper";

import styles from "../styles/components/intro.module.scss";
import moment from "moment";

const Intro: React.FC<IntroProps> = ({
  title,
  author,
  awards,
  score,
  created_utc,
  over_18,
  background,
}) => {
  return (
    <Layout src={background}>
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

              <span>·</span>

              <p>{moment(created_utc).format("MMM Do YY")}</p>

              {awards.length > 0 && (
                <>
                  <span>·</span>
                  <Awards awards={awards} />
                </>
              )}

              {over_18 && <div>NSFW</div>}
            </div>

            <h1 className={styles.title}>{title}</h1>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Intro;

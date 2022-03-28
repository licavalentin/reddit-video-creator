import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

import { Intro as IntroProps } from "../interface/compositions";

import Layout from "./Layout";
import { RedditArrowIcon } from "./CustomIcons";
import { Awards, BackgroundVideo } from "./UI";

import { roundUp } from "../utils/helper";

import styles from "../styles/components/intro.module.scss";

const Intro: React.FC<IntroProps> = ({ title, author, awards, score }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const opacity = interpolate(frame, [0, 8], [0, 1]);
  const transform = interpolate(
    frame,
    [0, 8, 9, durationInFrames],
    [1, 0, 0, 0]
  );

  return (
    <Layout>
      <div className={styles.container}>
        <BackgroundVideo videoPath="/videos/angry.webm" />

        <div
          className={styles.intro}
          style={{ opacity, transform: `translateY(${transform}em)` }}
        >
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

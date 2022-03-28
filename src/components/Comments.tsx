import React from "react";

import { Comments as CommentsProps } from "../interface/compositions";

import Layout from "./Layout";
import { BackgroundVideo, RandomAvatar } from "./UI";
import { RedditArrowIcon } from "./CustomIcons";

import { roundUp } from "../utils/helper";

import styles from "../styles/components/comments.module.scss";

const Comments: React.FC<CommentsProps> = ({ comments }) => {
  return (
    <Layout>
      <BackgroundVideo videoPath="/videos/angry.webm" />

      <ul className={styles.comments}>
        {comments.map((comment, index) => {
          const { user, score, depth, content, awards } = comment;

          return (
            <li
              className={styles.comment}
              style={{
                marginLeft: `${depth * 100}px`,
              }}
              key={index}
            >
              <RandomAvatar className={styles.comment__avatar} />

              <div className={styles.comment__body}>
                <div className={styles.comment__details}>
                  <p>{user}</p> <span>·</span> <span>{roundUp(score)}</span>
                  {/* <Awards awards={awards} /> */}
                </div>

                <div className={styles.comment__content}>{content}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </Layout>
  );
};

export default Comments;

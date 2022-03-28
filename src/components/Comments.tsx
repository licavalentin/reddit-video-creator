import React from "react";

import { Comments as CommentsProps } from "../interface/compositions";

import Layout from "./Layout";
import { RandomAvatar } from "./UI";
import { RedditArrowIcon } from "./CustomIcons";

import { roundUp } from "../utils/helper";

import styles from "../styles/components/comments.module.scss";

const Comments: React.FC<CommentsProps> = ({ comments }) => {
  return (
    <Layout>
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
              <RandomAvatar />

              <div className={styles.comment__body}>
                <div className={styles.comment__details}>
                  <p>{user} · </p>
                  {/* <Awards awards={awards} /> */}
                </div>

                <div className={styles.comment__content}>{content}</div>

                <div className={styles.comment__score}>
                  <RedditArrowIcon />

                  <p>{roundUp(score)}</p>

                  <RedditArrowIcon />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Layout>
  );
};

export default Comments;

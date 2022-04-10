import React, { useEffect, useRef, useState } from "react";
import { continueRender, delayRender, useCurrentFrame } from "remotion";

import { AvatarDetails } from "../interface/post";
import { CommentsGroup } from "../interface/compositions";

import Layout from "./Layout";
import { Awards, RandomAvatar } from "./UI";
import { RedditArrowIcon } from "./CustomIcons";

import { calculateComments, roundUp } from "../utils/helper";

import styles from "../styles/components/comments.module.scss";

const Comments: React.FC<CommentsGroup> = ({ comments }) => {
  const frame = useCurrentFrame();

  const commentsEl = useRef<HTMLUListElement>(null);
  const [transform, setTransform] = useState<number>(0);

  // const [handle] = useState(() => delayRender());

  // const renderAnimation = async () => {
  // const animationData = await calculateComments({
  //   commentsEl,
  // });

  // setTransform(animationData);

  // continueRender(handle);
  // };

  useEffect(() => {
    calculateComments({ commentsEl, comments });
  }, []);

  const frameCounter = comments.map((e) => e.body.length);

  return (
    <Layout>
      <ul
        className={styles.comments}
        ref={commentsEl}
        style={{
          transform: `translateY(${transform}px)`,
        }}
      >
        {comments.map((comment, index) => {
          const { author, score, depth, body, all_awardings, avatar } = comment;

          let prevFrames: number = 0;

          frameCounter.forEach((frames, idx) => {
            if (index > idx) {
              prevFrames += frames;
            }
          });

          return (
            <li
              className={`${styles.comment} comment`}
              style={{
                marginLeft: `${depth * 100}px`,
                opacity: prevFrames >= frame && index > 0 ? 0 : 1,
              }}
              key={index}
            >
              <RandomAvatar
                className={styles.comment__avatar}
                avatar={avatar as AvatarDetails}
              />

              <div className={styles.comment__body}>
                <div className={`${styles.comment__details} comment__details`}>
                  <p>{author}</p>

                  <span>·</span>

                  <span>
                    <RedditArrowIcon />
                    {roundUp(score)}
                  </span>

                  <span>·</span>

                  {all_awardings && <Awards awards={all_awardings} limit={4} />}
                </div>

                <div className={styles.comment__content}>
                  <span className={`${styles.calc__content} calc__content`} />

                  <span className={`${styles.all__content} all__content`}>
                    {(body as string[]).join(" ")}
                  </span>

                  <span className={`${styles.visible__content} visible-text`}>
                    {(body as string[])
                      .filter((_, idx) => {
                        if (prevFrames + idx <= frame) {
                          return _;
                        }
                      })
                      .join(" ")}
                  </span>
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

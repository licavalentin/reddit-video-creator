import React, { useEffect, useRef, useState } from "react";
import {
  continueRender,
  delayRender,
  interpolate,
  useCurrentFrame,
} from "remotion";

import { AvatarDetails } from "../interface/post";
import { CommentsGroup } from "../interface/compositions";

import Layout from "./Layout";
import { Awards, RandomAvatar } from "./UI";
import { RedditArrowIcon } from "./CustomIcons";

import { calculateComments, roundUp } from "../utils/helper";

import styles from "../styles/components/comments.module.scss";

const Comments: React.FC<CommentsGroup> = ({ comments }) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender());
  const commentsEl = useRef<HTMLUListElement>(null);
  const frameCounter = useRef(comments.map((e) => e.body.length));

  const [transformData, setTransformData] = useState<[number[], number[]]>([
    [0, 1],
    [0, 0],
  ]);

  useEffect(() => {
    const animationData = calculateComments({
      commentsEl,
      comments,
    });

    setTransformData(animationData as [number[], number[]]);

    continueRender(handle);
  }, []);

  return (
    <Layout>
      {/* <div>
        {(() => {
          let num = 0;

          for (let index = 0; index < transformData[0].length; index++) {
            const currentFrame = transformData[0][index];

            if (currentFrame === frame) {
              transformData[1][index];
            }
          }

          return num;
        })()}
      </div> */}

      <ul
        className={styles.comments}
        ref={commentsEl}
        // style={{
        //   transform: `translateY(-${transform * 50}%)`,
        // }}
      >
        {comments.map((comment, index) => {
          const { author, score, depth, body, all_awardings, avatar } = comment;

          let prevFrames: number = 0;

          frameCounter.current.forEach((frames, idx) => {
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

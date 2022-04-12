import React, { useEffect, useRef, useState } from "react";
import {
  continueRender,
  delayRender,
  interpolate,
  useCurrentFrame,
} from "remotion";

import { video } from "../config/video";
import { AvatarDetails, TextComment } from "../interface/post";
import { CommentsGroup } from "../interface/compositions";

import Layout from "./Layout";
import { Awards, RandomAvatar } from "./UI";
import { RedditArrowIcon } from "./CustomIcons";

import { calculateComments, roundUp } from "../utils/helper";

import styles from "../styles/components/comments.module.scss";

const Comments: React.FC<CommentsGroup> = ({ comments }) => {
  const frame = useCurrentFrame();

  // const [handle] = useState(() => delayRender());
  const commentsEl = useRef<HTMLUListElement>(null);
  const frameCounter = useRef(comments.map((e) => e.body.length));

  // const [transformData, setTransformData] = useState<
  //   [number[], number[], number]
  // >([[0, 1], [0, 0], 0]);
  // const [transform, setTransform] = useState<number>(0);

  // useEffect(() => {
  //   const animationData = calculateComments({
  //     commentsEl,
  //     comments,
  //   }) as [number[], number[], number];

  //   console.log(animationData);

  //   setTransformData(animationData);

  //   continueRender(handle);
  // }, []);

  // useEffect(() => {
  //   setTransform(interpolate(frame, transformData[0], transformData[1]));
  // }, [frame]);

  return (
    <Layout>
      {/* {transformData.join()} - {transform} */}
      <ul
        className={styles.comments}
        ref={commentsEl}
        // style={{
        //   transform: `translateY(-${
        //     (video.height - transformData[2] * 2) *
        //     (transform > 0 ? transform : 0)
        //   }px)`,
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

                  <span className={styles.all__content}>
                    {(body as TextComment[]).map((e) => e.text).join(" ")}
                  </span>

                  <span className={`${styles.visible__content} visible-text`}>
                    {(body as TextComment[])
                      .filter((e, idx) => {
                        if (prevFrames + idx <= frame) {
                          return e.text;
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

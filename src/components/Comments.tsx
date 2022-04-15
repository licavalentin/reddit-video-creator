import React, { useEffect, useRef, useState } from "react";
import {
  continueRender,
  delayRender,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { AvatarDetails } from "../interface/post";
import { CommentsGroup } from "../interface/compositions";

import Layout from "./Layout";
import { Awards, RandomAvatar } from "./UI";
import { RedditArrowIcon } from "./CustomIcons";

import { scrollAnimationHandler, roundUp } from "../utils/helper";

import styles from "../styles/components/comments.module.scss";

const Comments: React.FC<CommentsGroup> = ({ comments }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const frameCounter = useRef(comments.map((e) => e.body.length));

  const [handle] = useState(() => delayRender());
  const container = useRef<HTMLUListElement>(null);
  const scrollAnimation = useRef<[number[], number[]]>([
    [0, 1],
    [0, 0],
  ]);

  useEffect(() => {
    if (scrollAnimation.current[0].length === 2) {
      scrollAnimation.current = scrollAnimationHandler({
        container,
        comments,
        durationInFrames,
      });
    }

    continueRender(handle);
  }, []);

  useEffect(() => {
    if (scrollAnimation.current[0][0] > 0) {
      window.scroll({
        top: interpolate(
          frame,
          scrollAnimation.current[0],
          scrollAnimation.current[1],
          {
            easing: Easing.ease,
          }
        ),
      });
    }
  }, [frame]);

  return (
    <Layout>
      <div
        className={`${styles.container} ${
          scrollAnimation.current[0].length === 2 ? styles.container__small : ""
        }`}
      >
        <ul className={styles.comments} ref={container}>
          {comments.map((comment, index) => {
            const { author, score, depth, body, all_awardings, avatar } =
              comment;

            let prevFrames: number = 0;

            for (let idx = 0; idx < frameCounter.current.length; idx++) {
              if (index > idx) {
                prevFrames += frameCounter.current[idx];
              }
            }

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
                  <div
                    className={`${styles.comment__details} comment__details`}
                  >
                    <p>{author}</p>

                    <span>·</span>

                    <span>
                      <RedditArrowIcon />
                      {roundUp(score)}
                    </span>

                    <span>·</span>

                    {all_awardings && (
                      <Awards awards={all_awardings} limit={4} />
                    )}
                  </div>

                  <div className={styles.comment__content}>
                    <span className={`${styles.calc__content} calc__content`} />

                    <span
                      className={styles.all__content}
                      dangerouslySetInnerHTML={{
                        __html: (body as string[]).join(" "),
                      }}
                    />

                    <span
                      className={`${styles.visible__content} visible-text`}
                      dangerouslySetInnerHTML={{
                        __html: (body as string[])
                          .filter((_, idx) => {
                            if (prevFrames + idx <= frame) {
                              return _;
                            }
                          })
                          .join(" "),
                      }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Layout>
  );
};

export default Comments;

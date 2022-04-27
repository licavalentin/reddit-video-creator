import React, { useEffect, useRef, useState } from "react";
import {
  continueRender,
  delayRender,
  interpolate,
  useCurrentFrame,
} from "remotion";

import { AvatarDetails, CommentText } from "../interface/post";
import { CommentsGroup } from "../interface/compositions";

import Layout from "./Layout";
import { Awards, RandomAvatar } from "./UI";
import { RedditArrowIcon } from "./CustomIcons";

import { scrollAnimationHandler, roundUp } from "../utils/helper";

import styles from "../styles/components/comments.module.scss";

const Comments: React.FC<CommentsGroup> = ({ comments, background }) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender());
  const container = useRef<HTMLUListElement>(null);
  const [scrollAnimation, setScrollAnimation] =
    useState<[number[], number[]]>();

  useEffect(() => {
    if (scrollAnimation !== undefined) {
      window.scroll({
        top: interpolate(frame, scrollAnimation[0], scrollAnimation[1]),
      });
    }
  }, [frame]);

  useEffect(() => {
    if (scrollAnimation === undefined) {
      const data = scrollAnimationHandler({
        container,
        comments,
      });

      if (data) {
        setScrollAnimation(data);
      }

      continueRender(handle);
    }
  }, []);

  return (
    <Layout src={background}>
      {/* <BackgroundImage path="/bc.jpg" /> */}

      {/* <PopUp>
        <ul>
          <li>🖼️ Frame: {frame}</li>
          {scrollAnimation && (
            <li>
              ⚓ Scroll Animation:{" "}
              {scrollAnimation
                .map((e) => e.map((r) => Math.floor(r)).join(","))
                .join(" # ")}
            </li>
          )}
          {bottoms.length > 0 && (
            <li>
              🗺️ Bottom Position: {Math.floor(bottoms[frame].bottom)} # In
              Frame: {bottoms[frame].frame}
            </li>
          )}
        </ul>
      </PopUp> */}

      <div
        className={`${styles.container} 
        ${scrollAnimation == undefined ? styles.container__small : ""}`}
      >
        <ul className={styles.comments} ref={container}>
          {comments.map((comment, index) => {
            const { author, score, depth, body, all_awardings, avatar } =
              comment;

            const content = body as CommentText[];

            return (
              <li
                className={`${styles.comment__wrapper} comment`}
                style={{
                  marginLeft: `${depth * 100}px`,
                  opacity: content[0].frame > frame && index > 0 ? 0 : 1,
                }}
                key={index}
              >
                <ul
                  className={styles.depth}
                  style={{
                    transform: `translateX(-${depth * 100}px)`,
                  }}
                >
                  {Array.from({ length: depth + 1 }, () => undefined).map(
                    (_, index, arr) => (
                      <li className={styles.line} key={index}>
                        <div
                          className={
                            index === arr.length - 1 &&
                            content[content.length - 1].frame >= frame
                              ? styles.current
                              : ""
                          }
                        />
                      </li>
                    )
                  )}
                </ul>

                <div className={styles.comment}>
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

                      {all_awardings && all_awardings.length > 0 && (
                        <>
                          <span>·</span>
                          <Awards awards={all_awardings} limit={4} />
                        </>
                      )}
                    </div>

                    <div className={styles.comment__content}>
                      <span
                        className={`${styles.calc__content} calc__content`}
                      />

                      <span
                        className={styles.all__content}
                        dangerouslySetInnerHTML={{
                          __html: content.map((e) => e.text).join(" "),
                        }}
                      />

                      <span
                        className={`${styles.visible__content} visible-text`}
                        dangerouslySetInnerHTML={{
                          __html: content
                            .filter(
                              ({ frame: currentFrame }) => currentFrame <= frame
                            )
                            .map((e) => e.text)
                            .join(" "),
                        }}
                      />
                    </div>
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

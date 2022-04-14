import React, { useEffect, useRef, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  interpolate,
  Series,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { AvatarDetails, TextComment } from "../interface/post";
import { CommentsGroup } from "../interface/compositions";

import Layout from "./Layout";
import { Awards, RandomAvatar } from "./UI";
import { RedditArrowIcon } from "./CustomIcons";

import { scrollAnimationHandler, roundUp } from "../utils/helper";

import styles from "../styles/components/comments.module.scss";

const Comments: React.FC<CommentsGroup> = ({ comments }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const [handle] = useState(() => delayRender());
  const container = useRef<HTMLUListElement>(null);
  const scrollAnimation = useRef<[number[], number[]]>([
    [0, 1],
    [0, 0],
  ]);

  useEffect(() => {
    scrollAnimation.current = scrollAnimationHandler({
      container,
      comments,
      durationInFrames,
    });

    continueRender(handle);
  }, []);

  useEffect(() => {
    if (scrollAnimation.current[0][0] > 0) {
      window.scroll({
        top: interpolate(
          frame,
          scrollAnimation.current[0],
          scrollAnimation.current[1]
        ),
      });
    }
  }, [frame]);

  const audioFiles = (() => {
    let audioData: TextComment[] = [];

    for (const comment of comments) {
      audioData = [...audioData, ...(comment.body as TextComment[])];
    }

    return audioData;
  })();

  return (
    <Layout>
      <Series>
        {audioFiles.map(({ audio, durationInFrames }, index) => (
          <Series.Sequence durationInFrames={durationInFrames} key={index}>
            <Audio src={staticFile(`/audio/${audio}`)} />
          </Series.Sequence>
        ))}
      </Series>

      <div className={styles.container}>
        <ul className={styles.comments} ref={container}>
          {comments.map((comment, index) => {
            const { author, score, depth, body, all_awardings, avatar } =
              comment;

            return (
              <li
                className={`${styles.comment} comment`}
                style={{
                  marginLeft: `${depth * 100}px`,
                  opacity:
                    (
                      (body as TextComment[])[0].frames as [number, number]
                    )[0] >= frame && index > 0
                      ? 0
                      : 1,
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

                    <span className={styles.all__content}>
                      {(body as TextComment[]).map((e) => e.text).join(" ")}
                    </span>

                    <span className={`${styles.visible__content} visible-text`}>
                      {(body as TextComment[])
                        .filter(
                          ({ frames }) =>
                            (frames as [number, number])[0] <= frame
                        )
                        .map((e) => e.text)
                        .join(" ")}
                    </span>
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

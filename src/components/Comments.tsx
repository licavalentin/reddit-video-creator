import React, { useEffect, useRef, useState } from "react";
import {
  Audio,
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
} from "remotion";

import { AvatarDetails, CommentBody } from "../interface/post";
import { CommentsGroup } from "../interface/compositions";

import Layout from "./Layout";
import { Awards, RandomAvatar } from "./UI";
import { RedditArrowIcon } from "./CustomIcons";

import { calculateComments, roundUp } from "../utils/helper";

import styles from "../styles/components/comments.module.scss";

const Comments: React.FC<CommentsGroup> = ({ comments }) => {
  const frame = useCurrentFrame();

  const commentsEl = useRef<HTMLUListElement>(null);
  const [animation, setAnimation] = useState<number | null>(null);

  const [handle] = useState(() => delayRender());

  const renderAnimation = async () => {
    const animationData = await calculateComments({
      commentsEl,
    });

    setAnimation(animationData);

    continueRender(handle);
  };

  useEffect(() => {
    renderAnimation();
  }, []);

  return (
    <Layout>
      {/* {comments.map((comment, index) =>
        (comment.body as CommentBody[]).map((text, idx) => {
          return (
            <Audio
              src={staticFile(
                `/audio/${[comment.index as number, index, idx].join("-")}.mp3`
              )}
              startFrom={(text.frames as number[])[0]}
              endAt={(text.frames as number[])[1]}
            />
          );
        })
      )} */}

      <ul className={styles.comments} ref={commentsEl}>
        {comments.map((comment, index) => {
          const { author, score, depth, body, all_awardings, avatar } = comment;

          if (
            ((body as CommentBody[])[0].frames as number[])[0] >= frame &&
            index > 0
          ) {
            return;
          }

          return (
            <li
              className={styles.comment}
              style={{
                marginLeft: `${depth * 100}px`,
              }}
              key={index}
            >
              <RandomAvatar
                className={styles.comment__avatar}
                avatar={avatar as AvatarDetails}
              />

              <div className={styles.comment__body}>
                <div className={styles.comment__details}>
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
                  {(body as CommentBody[])
                    .filter((t) => (t.frames as number[])[0] <= frame)
                    .map((e) => e.text)
                    .join(" ")}
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

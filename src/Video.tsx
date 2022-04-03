import { Composition, getInputProps, Still } from "remotion";

import { video } from "./config/video";
import { InputData } from "./interface/compositions";

import post from "./data/post.json";

import Intro from "./components/Intro";
import Outro from "./components/Outro";
import Thumbnail from "./components/Thumbnail";
import Comments from "./components/Comments";

import "./styles/main.scss";
import { CommentBody, Comment } from "./interface/post";

export const RemotionVideo: React.FC = () => {
  const { fps, height, width } = video;

  const {
    post: { title, author, score, all_awardings, subreddit },
    comments,
  } = post;

  const inputData = getInputProps() as InputData;
  const prod = Object.keys(inputData).length !== 0;

  const commentConfig: {
    durationInFrames: number;
    defaultProps: {
      comments: Comment[];
    };
  } = (() => {
    const calcDuration = (comments: Comment[]) => {
      let totalFrames = 0;

      for (const comment of comments) {
        for (const item of comment.body) {
          const [start, end] = (item as CommentBody).frames as [number, number];
          totalFrames += end - start;
        }
      }

      return totalFrames;
    };

    if (prod && inputData.id === "comments") {
      return {
        durationInFrames: calcDuration(inputData.comments),
        defaultProps: inputData,
      };
    }

    return {
      durationInFrames: calcDuration(comments[0]),
      defaultProps: {
        comments: comments[0],
      },
    };
  })();

  return (
    <>
      <Composition
        id="intro"
        component={Intro}
        durationInFrames={1 * fps}
        fps={fps}
        width={width}
        height={height}
        defaultProps={(() => {
          if (prod && inputData.id === "intro") return inputData;

          return {
            title,
            author,
            score,
            awards: all_awardings,
          };
        })()}
      />

      <Composition
        id="comments"
        component={Comments}
        fps={fps}
        width={width}
        height={height}
        durationInFrames={commentConfig.durationInFrames}
        defaultProps={commentConfig.defaultProps}
      />

      <Composition
        id="outro"
        component={Outro}
        durationInFrames={1 * fps}
        fps={fps}
        width={width}
        height={height}
        defaultProps={(() => {
          if (prod && inputData.id === "outro") return inputData;

          return {
            outro: "💖 Thank you for watching",
          };
        })()}
      />

      <Still
        id="thumbnail"
        component={Thumbnail}
        width={width}
        height={height}
        defaultProps={(() => {
          if (prod && inputData.id === "thumbnail") return inputData;

          return {
            title,
            awards: all_awardings,
            subreddit,
          };
        })()}
      />
    </>
  );
};

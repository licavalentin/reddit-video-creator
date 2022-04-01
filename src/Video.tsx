import { useEffect } from "react";
import { Composition, getInputProps, Still } from "remotion";

import { video } from "./config/video";
import { PostFile } from "./interface/post";
import { InputData } from "./interface/compositions";

import post from "./data/post.json";
import comments from "./data/data.json";

import Intro from "./components/Intro";
import Outro from "./components/Outro";
import Thumbnail from "./components/Thumbnail";
import Comments from "./components/Comments";

import "./styles/main.scss";

export const RemotionVideo: React.FC = () => {
  const { fps, height, width } = video;

  const {
    post: { title, author, score, all_awardings, subreddit },
    outro,
  } = post;

  const inputData = getInputProps() as InputData;
  const prod = Object.keys(inputData).length !== 0;

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
        durationInFrames={1 * fps}
        fps={fps}
        width={width}
        height={height}
        defaultProps={(() => {
          if (prod && inputData.id === "comments")
            return { comments: inputData.comments };

          return {
            comments: comments[4],
          };
        })()}
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
            outro,
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

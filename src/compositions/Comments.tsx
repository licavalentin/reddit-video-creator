import React from "react";
import { Composition, getInputProps, registerRoot } from "remotion";

import { video } from "../config/video";
import { CommentsGroup } from "../interface/compositions";

import Comments from "../components/Comments";

import post from "../data/post.json";

import "../styles/main.scss";

export const CommentsComposition: React.FC = () => {
  const { fps, height, width } = video;
  const inputData = getInputProps() as CommentsGroup;
  const prod = Object.keys(inputData).length !== 0;

  const { comments } = post;

  const commentConfig: {
    durationInFrames: number;
    defaultProps: {
      comments: Comment[];
    };
  } = (() => {
    if (prod)
      return {
        durationInFrames: inputData.durationInFrames as number,
        defaultProps: {
          comments: inputData.comments,
        },
      };

    const localComments = comments[0];

    return {
      durationInFrames: localComments.durationInFrames,
      defaultProps: {
        comments: localComments.commentsGroup,
      },
    };
  })();

  return (
    <Composition
      id="comments"
      component={Comments}
      fps={fps}
      width={width}
      height={height}
      {...commentConfig}
    />
  );
};

registerRoot(CommentsComposition);

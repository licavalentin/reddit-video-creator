import React from "react";
import { Composition, getInputProps, registerRoot } from "remotion";

import { video } from "../config/video";
import { CommentsGroup } from "../interface/compositions";
import { Comment } from "../interface/post";

import Comments from "../components/Comments";

import post from "../data/post.json";

import "../styles/main.scss";

export const CommentsComposition: React.FC = () => {
  const { fps, height, width } = video;
  const inputData = getInputProps() as CommentsGroup;
  const prod = Object.keys(inputData).length !== 0;

  const { comments } = post;

  const calcDuration = (comments: Comment[]) =>
    comments.reduce(
      (previousValue, currentValue) => previousValue + currentValue.body.length,
      0
    );

  const commentConfig: {
    durationInFrames: number;
    defaultProps: {
      comments: Comment[];
    };
  } = (() => {
    if (prod)
      return {
        durationInFrames: calcDuration(inputData.comments),
        defaultProps: {
          comments: inputData.comments,
        },
      };

    const localComments = comments[0];

    return {
      durationInFrames: calcDuration(localComments),
      defaultProps: {
        comments: localComments,
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

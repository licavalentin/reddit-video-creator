import React from "react";
import { getInputProps, registerRoot, Still } from "remotion";

import { Thumbnail as ThumbnailType } from "../interface/compositions";

import Thumbnail from "../components/Thumbnail";

import post from "../data/post.json";

import "../styles/main.scss";

export const ThumbnailStill: React.FC = () => {
  const {
    post: { title, all_awardings, subreddit },
  } = post;

  const inputData = getInputProps() as ThumbnailType;
  const prod = Object.keys(inputData).length !== 0;

  const thumbnailConfig: {
    defaultProps: ThumbnailType;
  } = (() => {
    if (prod && inputData.id === "thumbnail")
      return {
        defaultProps: inputData,
      };

    return {
      defaultProps: {
        title,
        awards: all_awardings,
        subreddit,
      },
    };
  })();

  return (
    <Still
      id="thumbnail"
      component={Thumbnail}
      width={1280}
      height={720}
      {...thumbnailConfig}
    />
  );
};

registerRoot(ThumbnailStill);

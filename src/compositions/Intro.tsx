import React from "react";
import { Composition, getInputProps, registerRoot } from "remotion";

import { video } from "../config/video";
import { Intro as IntroType } from "../interface/compositions";

import Intro from "../components/Intro";

import post from "../data/post.json";

import "../styles/main.scss";

export const IntroComposition: React.FC = () => {
  const { fps, height, width } = video;
  const inputData = getInputProps() as IntroType;
  const prod = Object.keys(inputData).length !== 0;

  const {
    post: { title, author, score, all_awardings },
  } = post;

  const introConfig: {
    durationInFrames: number;
    defaultProps: IntroType;
  } = (() => {
    if (prod)
      return {
        durationInFrames: 1,
        defaultProps: inputData,
      };

    return {
      durationInFrames: 1,
      defaultProps: {
        title,
        author,
        score,
        awards: all_awardings,
      },
    };
  })();

  return (
    <Composition
      id="intro"
      component={Intro}
      fps={fps}
      width={width}
      height={height}
      {...introConfig}
    />
  );
};

registerRoot(IntroComposition);

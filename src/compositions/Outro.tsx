import React from "react";
import { Composition, getInputProps, registerRoot } from "remotion";

import { video } from "../config/video";
import { Outro as OutroType } from "../interface/compositions";

import Outro from "../components/Outro";

import post from "../data/post.json";

import "../styles/main.scss";

export const OutroComposition: React.FC = () => {
  const { fps, height, width } = video;
  const inputData = getInputProps() as OutroType;
  const prod = Object.keys(inputData).length !== 0;

  const {
    post: { outro },
  } = post;

  const outroConfig: {
    durationInFrames: number;
    defaultProps: {
      outro: string;
    };
  } = (() => {
    if (prod)
      return {
        durationInFrames: inputData.durationInFrames as number,
        defaultProps: {
          outro: inputData.outro,
        },
      };

    return {
      durationInFrames: outro.durationInFrames,
      defaultProps: {
        outro: outro.text,
      },
    };
  })();

  return (
    <Composition
      id="outro"
      component={Outro}
      fps={fps}
      width={width}
      height={height}
      {...outroConfig}
    />
  );
};

registerRoot(OutroComposition);

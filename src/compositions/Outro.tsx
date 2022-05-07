import React from "react";
import { Composition, getInputProps, registerRoot } from "remotion";

import { video } from "../config/video";
import { Outro as OutroType } from "../interface/compositions";

import Outro from "../components/Outro";

import "../styles/main.scss";

export const OutroComposition: React.FC = () => {
  const { fps, height, width } = video;
  const inputData = getInputProps() as OutroType;
  const prod = Object.keys(inputData).length !== 0;

  return (
    <Composition
      id="outro"
      component={Outro}
      fps={fps}
      width={width}
      height={height}
      durationInFrames={1}
      defaultProps={{
        outro: prod ? inputData.outro : "Thank you for watching",
      }}
    />
  );
};

registerRoot(OutroComposition);

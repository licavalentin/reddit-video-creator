import React from "react";
import { Composition } from "remotion";

import { video } from "../config/video";

import Mid from "../components/Mid";

const MidComposition: React.FC = () => {
  const { fps, height, width } = video;

  return (
    <Composition
      id="mid"
      component={Mid}
      fps={fps}
      width={width}
      height={height}
      durationInFrames={1}
      defaultProps={{
        logo: "/reddit-logo.png",
      }}
    />
  );
};

export default MidComposition;

import React from "react";
import { Composition, registerRoot } from "remotion";

import { video } from "../config/video";

import Mid from "../components/Mid";

import "../styles/main.scss";

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

registerRoot(MidComposition);

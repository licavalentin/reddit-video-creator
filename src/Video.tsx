import { Composition, Still } from "remotion";

import { video } from "./config/video";

import Intro from "./components/Intro";
import Outro from "./components/Outro";
import Thumbnail from "./components/Thumbnail";

import "./styles/main.scss";

export const RemotionVideo: React.FC = () => {
  const { fps, height, width } = video;

  return (
    <>
      <Composition
        id="intro"
        component={Intro}
        durationInFrames={3 * fps}
        fps={fps}
        width={width}
        height={height}
        // defaultProps={}
      />

      <Composition
        id="outro"
        component={Outro}
        durationInFrames={5 * fps}
        fps={fps}
        width={width}
        height={height}
        // defaultProps={}
      />

      <Still
        id="thumbnail"
        component={Thumbnail}
        width={width}
        height={height}
        // defaultProps={}
      />
    </>
  );
};

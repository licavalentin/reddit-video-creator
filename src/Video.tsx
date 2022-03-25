import { Composition, Still } from "remotion";

import { video } from "./config/video";
import { PostFile } from "./interface/post";

import post from "./data/post.json";

import Intro from "./components/Intro";
import Outro from "./components/Outro";
import Thumbnail from "./components/Thumbnail";

import "./styles/main.scss";

export const RemotionVideo: React.FC = () => {
  const { fps, height, width } = video;

  const {
    post: { title, author, score: postScore, all_awardings },
    outro,
  } = post as PostFile;

  return (
    <>
      <Composition
        id="intro"
        component={Intro}
        durationInFrames={3 * fps}
        fps={fps}
        width={width}
        height={height}
        defaultProps={{
          title,
          author,
          score: postScore,
          awards: all_awardings,
        }}
      />

      <Composition
        id="outro"
        component={Outro}
        durationInFrames={5 * fps}
        fps={fps}
        width={width}
        height={height}
        defaultProps={{
          outro,
        }}
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

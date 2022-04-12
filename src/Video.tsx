import { Composition, getInputProps, Still } from "remotion";

import { video } from "./config/video";
import {
  InputData,
  Intro as IntroType,
  Thumbnail as ThumbnailType,
} from "./interface/compositions";
import { Comment } from "./interface/post";

import post from "./data/post.json";

import Intro from "./components/Intro";
import Outro from "./components/Outro";
import Thumbnail from "./components/Thumbnail";
import Comments from "./components/Comments";

import "./styles/main.scss";

export const RemotionVideo: React.FC = () => {
  const { fps, height, width } = video;

  const {
    post: { title, author, score, all_awardings, subreddit, outro },
    comments,
  } = post;

  const inputData = getInputProps() as InputData;
  const prod = Object.keys(inputData).length !== 0;

  const introConfig: {
    durationInFrames: number;
    defaultProps: IntroType;
  } = (() => {
    if (prod && inputData.id === "intro")
      return {
        durationInFrames: inputData.durationInFrames as number,
        defaultProps: inputData,
      };

    return {
      durationInFrames: title.durationInFrames,
      defaultProps: {
        title: title.text,
        author,
        score,
        awards: all_awardings,
      },
    };
  })();

  const commentConfig: {
    durationInFrames: number;
    defaultProps: {
      comments: Comment[];
    };
  } = (() => {
    if (prod && inputData.id === "comments")
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

  const outroConfig: {
    durationInFrames: number;
    defaultProps: {
      outro: string;
    };
  } = (() => {
    if (prod && inputData.id === "outro")
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

  const thumbnailConfig: {
    defaultProps: ThumbnailType;
  } = (() => {
    if (prod && inputData.id === "thumbnail")
      return {
        defaultProps: inputData,
      };

    return {
      defaultProps: {
        title: title.text,
        awards: all_awardings,
        subreddit,
      },
    };
  })();

  return (
    <>
      <Composition
        id="intro"
        component={Intro}
        fps={fps}
        width={width}
        height={height}
        {...introConfig}
      />

      <Composition
        id="comments"
        component={Comments}
        fps={fps}
        width={width}
        height={height}
        {...commentConfig}
      />

      <Composition
        id="outro"
        component={Outro}
        fps={fps}
        width={width}
        height={height}
        {...outroConfig}
      />

      <Still
        id="thumbnail"
        component={Thumbnail}
        width={width}
        height={height}
        {...thumbnailConfig}
      />
    </>
  );
};

import React from "react";
import { getInputProps, registerRoot } from "remotion";

import { CompositionId } from "./interface/compositions";

import Intro from "./compositions/Intro";
import Comments from "./compositions/Comments";
import Mid from "./compositions/Mid";
import Outro from "./compositions/Outro";
import Thumbnail from "./compositions/Thumbnail";

import "./styles/main.scss";

const Video: React.FC = () => {
  const inputData = getInputProps() as { id: CompositionId };
  const prod = Object.keys(inputData).length !== 0;

  if (prod) {
    switch (inputData.id) {
      case "intro":
        return <Intro />;

      case "comments":
        return <Comments />;

      case "mid":
        return <Mid />;

      case "outro":
        return <Outro />;

      case "thumbnail":
        return <Thumbnail />;
    }
  }

  return (
    <>
      <Intro />
      <Comments />
      <Mid />
      <Outro />
      <Thumbnail />
    </>
  );
};

registerRoot(Video);

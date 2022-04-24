import { RefObject } from "react";

import { Comment } from "./post";

export type ScrollAnimationHandler = (args: {
  container: RefObject<HTMLUListElement>;
  comments: Comment[];
}) => [number[], number[]] | undefined;

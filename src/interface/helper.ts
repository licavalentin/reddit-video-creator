import { RefObject } from "react";

import { Comment } from "./post";

export type CalculateComments = (args: {
  commentsEl: RefObject<HTMLUListElement>;
  comments: Comment[];
}) => Promise<number>;

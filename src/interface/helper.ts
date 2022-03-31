import { RefObject } from "react";

export type CalculateComments = (args: {
  commentsEl: RefObject<HTMLUListElement>;
}) => Promise<number>;

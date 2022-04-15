import { Award, Comment } from "./post";

export type CompositionId =
  | "intro"
  | "outro"
  | "thumbnail"
  | "comments"
  | "mid";

export type Intro = {
  id?: "intro";
  title: string;
  author: string;
  awards: Award[];
  score: number;
  durationInFrames?: number;
};

export type Mid = {
  id?: "mid";
  logo: string;
};

export type Outro = {
  id?: "outro";
  outro: string;
  durationInFrames?: number;
};

export type Thumbnail = {
  id?: "thumbnail";
  title: string;
  subreddit: string;
  awards: Award[];
};

export type CommentsGroup = {
  id?: "comments";
  durationInFrames?: number;
  comments: Comment[];
};

export type CompositionData = Intro | CommentsGroup | Outro | Thumbnail | {};

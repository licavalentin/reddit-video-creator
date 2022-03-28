import { Award, PostComment } from "./post";

export type CompositionId = "intro" | "outro" | "thumbnail" | "comments";

export type Intro = {
  id?: "intro";
  title: string;
  author: string;
  awards: Award[];
  score: number;
};

export type Outro = {
  id?: "outro";
  outro: string;
};

export type Thumbnail = {
  id?: "thumbnail";
  title: string;
  subreddit: string;
  awards: Award[];
};

export type Comments = {
  id?: "comments";
  comments: PostComment[];
};

export type InputData = Intro | Outro | Thumbnail | Comments;

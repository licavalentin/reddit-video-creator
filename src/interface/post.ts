import { Subtitle } from "./audio";
import { Crop } from "./image";

export interface Award {
  count: number;
  name: string;
}

export interface Post {
  subreddit: string;
  title: string;
  subreddit_name_prefixed: string;
  ups: number;
  total_awards_received: number;
  score: number;
  all_awardings: Award[];
  id: string;
  author: string;
  num_comments: number;
  permalink: string;
  added?: boolean;
  created?: boolean;
}

export interface Avatar {
  head: string;
  face: string;
  body: string;
}

export interface Comment {
  content: string | Subtitle[];
  user: string;
  depth: number;
  date: number;
  score: number;
  avatar?: Avatar;
  audio?: string;
  width?: number;
  height: number;
  id?: number;
}

export interface PostFile {
  post: Post;
  comments: Comment[];
  exportPath: string;
}

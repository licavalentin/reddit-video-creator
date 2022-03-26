export interface Subreddit {
  display_name: string;
  title: string;
  display_name_prefixed: string;
  subscribers: number;
  public_description: string;
  id: string;
  url: string;
  added?: boolean;
}

export interface Search {
  kind: string;
  data: Subreddit;
}

export interface Pagination {
  next: null;
  before: null;
}

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
  selftext?: string;
}

export interface Posts {
  kind: string;
  data: Post;
}

export type Filter = "hot" | "new" | "top" | "rising";

export type TopFilter = "day" | "week" | "month" | "year" | "all";

export type Controls = {
  filter: Filter;
  topFilter?: TopFilter;
};

export interface Comment {
  ups: number;
  id: string;
  author: string;
  body: string;
  replies?: Replies | "";
  parent_id?: string;
  score: number;
  all_awardings: Award[];
  created_utc: number;
  depth: number;
  selected?: boolean;
  collapse?: boolean;
  visible?: boolean;
}

export interface CommentWrapper {
  kind: string | "more";
  data: Comment;
}

export interface Replies {
  kind: string | "more";
  data: {
    after: string;
    children: CommentWrapper[] | string[];
    before: string;
  };
}

export type PostComment = {
  content: string;
  user: string;
  depth: number;
  score: number;
  awards: Award[];
};

export interface PostFile {
  post: Post;
  comments: PostComment[];
  exportPath: string;
  voice: string;
  outro: string;
  music: string;
}

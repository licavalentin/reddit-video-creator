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

export interface Comment {
  ups: number;
  id: string;
  author: string;
  body: string;
  parent_id: string;
  score: number;
  all_awardings: Award[];
  created_utc: number;
  depth: number;
  selected?: boolean;
  collapse?: boolean;
  visible?: boolean;
}

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

export interface Award {
  count: number;
  name: string;
}

export interface TextComment {
  text: string;
  durationInFrames: number;
  frames?: [number, number];
  audio: string;
}

export interface Post {
  subreddit: string;
  selftext: string;
  title: TextComment | string;
  outro?: TextComment;
  author: string;
  over_18: boolean;
  all_awardings: Award[];
  num_comments: number;
  created_utc: number;
  score: number;
}

export interface AvatarDetails {
  face: number;
  head: number;
  body: number;
}

export interface Comment {
  author: string;
  body: TextComment[] | string | string[];
  replies?: Replies | "";
  score: number;
  all_awardings: Award[];
  created_utc: number;
  depth: number;
  avatar?: AvatarDetails;
}

export interface PostFile {
  post: Post;
  comments: {
    durationInFrames: number;
    commentGroup: Comment[][];
  };
  exportPath: string;
  voice: string;
  outro: string;
  music: string;
  video: string;
}

export type RedditData = [
  {
    data: {
      children: [
        {
          data: Post;
        }
      ];
    };
  },
  {
    data: {
      children: CommentWrapper[];
    };
  }
];

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

export interface Post {
  subreddit: string;
  selftext: string;
  title: string;
  author: string;
  over_18: boolean;
  all_awardings: Award[];
  num_comments: number;
  created_utc: number;
  score: number;
}

export interface AvatarDetails {
  face: string;
  head: string;
  body: string;
}

export interface CommentText {
  frame: number;
  text: string;
  audio: string;
  duration?: number;
}

export interface Comment {
  author: string;
  body: string | CommentText[];
  replies?: Replies | "";
  score: number;
  all_awardings: Award[];
  created_utc: number;
  depth: number;
  avatar?: AvatarDetails;
}

export interface CommentGroup {
  durationInFrames: number;
  durationInSeconds: number;
  comments: Comment[];
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

export type RenderPost = {
  title: string;
  duration: number;
  url: string;
  status: "finish" | "draft" | "queue";
  subreddit: string;
};

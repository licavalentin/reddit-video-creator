export interface Comment {
  text: string | string[];
  width?: number;
  height?: number;
  indentation: number;
  userName: string;
  score: number;
  created_utc: number;
}

export interface VideoDetails {
  title: string;
  userName: string;
  points: string;
  awards: string[];
  comments: Comment[];
}

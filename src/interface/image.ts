export enum FontFace {
  Username = "username-bold.fnt",
  Comment = "comment-regular.fnt",
  PostTitle = "post-title-medium.fnt",
  ThumbnailTitle = "cocogoose-thumbnail-title.fnt",
  ThumbnailSubreddit = "cocogoose-thumbnail-subreddit.fnt",
}

export type Crop = {
  aspect: number;
  height: number;
  unit: "px";
  width: number;
  x: number;
  y: number;
};

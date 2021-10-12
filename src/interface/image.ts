export enum FontFace {
  Light = "open-sans-light.fnt",
  Medium = "open-sans-medium.fnt",
  Regular = "open-sans-regular.fnt",
  MediumTitle = "open-sans-medium-post-title.fnt",
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

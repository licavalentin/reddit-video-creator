export enum FontFace {
  Username = "username-bold.fnt",
  Comment = "comment-regular.fnt",
  Stats = "stats-regular.fnt",
  PostTitle = "post-title-medium.fnt",
}

export type Crop = {
  aspect: number;
  height: number;
  unit: "px";
  width: number;
  x: number;
  y: number;
};

export type CompositionId = "intro" | "comments" | "outro" | "thumbnail";

export type GenerateVideo = (args: {
  id: CompositionId;
  output: string;
  data: any;
}) => Promise<string>;

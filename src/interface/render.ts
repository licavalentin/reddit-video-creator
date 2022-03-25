export type CompositionId = "intro" | "checkbox" | "circle" | "outro";

export type GenerateVideo = (args: {
  id: CompositionId;
  output: string;
  data: any;
}) => Promise<string>;

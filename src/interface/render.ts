import { CompositionId, InputData } from "./compositions";

export type GenerateVideo = (args: {
  id: CompositionId;
  output: string;
  data: InputData;
}) => Promise<string>;

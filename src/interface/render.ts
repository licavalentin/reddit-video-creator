import { CompositionId, InputData } from "./compositions";

export type GenerateVideo = (args: {
  bundled: string;
  id: CompositionId;
  output: string;
  data: InputData;
}) => Promise<string>;

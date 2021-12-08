export interface Subtitle {
  content: string;
  id?: number;
}

export interface AudioFileGeneration {
  textFilePath: string;
  exportPath: string;
  voice: string;
}

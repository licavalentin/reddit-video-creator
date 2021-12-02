export interface Subtitle {
  duration: number;
  content: string;
  id?: number;
}

export interface AudioFileGenerationConfig {
  balconPath: string;
  selectedVoice: string;
}

export interface AudioFileGeneration extends AudioFileGenerationConfig {
  textFilePath: string;
  exportPath: string;
}

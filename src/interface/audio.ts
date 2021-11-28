export interface Subtitle {
  time: {
    start: string;
    end: string;
    duration: number;
  };
  content: string;
}

export interface AudioFileGenerationConfig {
  balconPath: string;
  selectedVoice: string;
}

export interface AudioFileGeneration extends AudioFileGenerationConfig {
  textFilePath: string;
  exportPath: string;
}

import { execFile } from "child_process";
import { join } from "path";

import { renderPath } from "../config/paths";

import {
  AudioFileGeneration,
  AudioFileGenerationConfig,
} from "../interface/audio";

type AudioGenerator = (args: AudioFileGeneration) => Promise<null>;

/**
 * Generate Audio from text
 *
 * @param {string} textPath Text Path
 * @param {string} exportPath Export path for the wav file
 */
const generateAudioFile: AudioGenerator = ({
  textFilePath,
  exportPath,
  balconPath,
  selectedVoice,
}) => {
  return new Promise((resolve) => {
    execFile(
      balconPath,
      [
        "-f",
        textFilePath,
        "-w",
        `${join(exportPath, "audio.wav")}`,
        "-n",
        selectedVoice,
        "--encoding",
        "utf8",
        "-fr",
        "48",
        "--silence-end",
        "100",
        "--lrc-length",
        "100",
        "--srt-length",
        "100",
        "-srt",
        "--srt-enc",
        "utf8",
        "--srt-fname",
        `${join(exportPath, "subtitle.srt")}`,
        "--ignore-url",
      ],
      (error: Error) => {
        if (error) {
          console.log(error);
        }

        console.log("audio-generated");
        resolve(null);
      }
    );
  });
};

const init = async () => {
  const args = process.argv.slice(2);
  const folders = JSON.parse(args[0]) as string[];
  const generationConfig = JSON.parse(args[1]) as AudioFileGenerationConfig;

  for (const folder of folders) {
    const ids = folder.split("-");
    const exportPath = join(renderPath, ids[0], folder);

    await generateAudioFile({
      ...generationConfig,
      exportPath: exportPath,
      textFilePath: join(exportPath, "text.txt"),
    });
  }

  // Kill Worker
  process.exit();
};

init();

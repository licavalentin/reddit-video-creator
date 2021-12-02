import { execFile } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import { renderPath } from "../config/paths";

import {
  AudioFileGeneration,
  AudioFileGenerationConfig,
} from "../interface/audio";
import { Comment } from "../interface/post";

import { createRandomString, getFolders, getSubtitles } from "../utils/helper";

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
        "--encoding utf8",
        "-fr",
        "48",
        "--ignore-url",
        "--lrc-length",
        "80",
        "-srt",
        "--srt-length",
        "80",
        // "--srt-enc",
        // "utf8",
        "--srt-fname",
        `${join(exportPath, "subtitle.srt")}`,
        "--ignore-url",
      ],
      (error: Error) => {
        // if (error) {
        //   console.log("audio-generating-failed");
        //   resolve(null);
        // }

        console.log("audio-generated-successfully");
        resolve(null);
      }
    );
  });
};

const init = async () => {
  const args = process.argv.slice(2);
  const comments = JSON.parse(args[0]) as Comment[];
  const generationConfig = JSON.parse(args[1]) as AudioFileGenerationConfig;

  for (const comment of comments) {
    // Generate random folder
    const folderPath = join(renderPath, comment.id + "");
    mkdirSync(folderPath);

    // Write text file
    const textFilePath = join(folderPath, "text.txt");
    writeFileSync(textFilePath, comment.content as string);

    await generateAudioFile({
      ...generationConfig,
      exportPath: folderPath,
      textFilePath: textFilePath,
    });

    comment.audio = comment.id + "";
    comment.content = getSubtitles(join(folderPath, "subtitle.srt"));

    // writeFileSync(join(folderPath, "comment.json"), JSON.stringify(comment));
    process.send(comment);
  }

  // Kill Worker
  process.exit();
};

init();

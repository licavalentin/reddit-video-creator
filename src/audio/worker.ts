import { readFileSync } from "fs";
import { join } from "path";

import { generateAudioFile } from "./lib";

import { audio } from "../config/audio";

const init = async () => {
  const args = process.argv.slice(2);
  const jobs = JSON.parse(readFileSync(args[0]).toString()) as {
    text: string;
    id: [number, number, number];
  }[];

  for (const job of jobs) {
    const exportPath = join(
      __dirname,
      "..",
      "..",
      "public",
      "audio",
      `${job.id.join("-")}.mp3`
    );

    generateAudioFile({
      customAudio: audio.custom_audio,
      outputPath: exportPath,
      text: job.text,
    });
  }

  // Kill Worker
  process.exit();
};

init();

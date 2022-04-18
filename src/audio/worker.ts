import { readFileSync } from "fs";
import { join } from "path";
import { tempAudio, tempData } from "../config/paths";

import { generateAudioFile } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const comments = JSON.parse(readFileSync(args[0]).toString()) as string[];

  for (const ids of comments) {
    generateAudioFile({
      outputPath: join(tempAudio, `${ids}.mp3`),
      textFilePath: join(tempData, `${ids}.txt`),
    });
  }

  // Kill Worker
  process.exit();
};

init();

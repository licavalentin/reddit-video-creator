import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { tempAudio, tempData } from "../config/paths";
import { getDuration } from "../video/lib";

import { generateAudioFile } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const comments = JSON.parse(readFileSync(args[0]).toString()) as string[];

  for (const ids of comments) {
    const audioFile = join(tempAudio, `${ids}.mp3`);

    generateAudioFile({
      outputPath: audioFile,
      textFilePath: join(tempData, `${ids}.txt`),
    });

    const duration = getDuration({
      filePath: audioFile,
    });

    writeFileSync(join(tempData, `${ids}-duration.txt`), `${duration}`);
  }

  // Kill Worker
  process.exit();
};

init();

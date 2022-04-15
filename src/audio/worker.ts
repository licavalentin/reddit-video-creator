import { readFileSync } from "fs";
import { join } from "path";

import { generateAudioFile } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const comments = JSON.parse(readFileSync(args[0]).toString()) as string[];
  const tmpDir = args[1];

  for (const ids of comments) {
    generateAudioFile({
      outputPath: join(tmpDir, "audio", `${ids}.mp3`),
      textFilePath: join(tmpDir, "data", `${ids}.txt`),
    });
  }

  // Kill Worker
  process.exit();
};

init();

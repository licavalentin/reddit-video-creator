import { readFileSync } from "fs";
import { join } from "path";

import { generateAudioFile } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const comments = JSON.parse(readFileSync(args[0]).toString()) as [
    number,
    number,
    number
  ][];
  const tmpDir = args[1];

  for (const ids of comments) {
    generateAudioFile({
      outputPath: join(
        __dirname,
        "..",
        "..",
        "public",
        "audio",
        `${ids.join("-")}.mp3`
      ),
      textFilePath: join(tmpDir, `${ids.join("-")}.txt`),
    });
  }

  // Kill Worker
  process.exit();
};

init();

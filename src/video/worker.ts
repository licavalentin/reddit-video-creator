import { readFileSync } from "fs";

import { generateVideoFile, getDuration } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const comments = JSON.parse(readFileSync(args[0]).toString()) as {
    image: string;
    audio: string;
    exportPath: string;
    title: string;
  }[];

  for (const comment of comments) {
    generateVideoFile({
      ...comment,
      duration: getDuration({
        filePath: comment.audio,
      }),
    });
  }

  // Kill Worker
  process.exit();
};

init();

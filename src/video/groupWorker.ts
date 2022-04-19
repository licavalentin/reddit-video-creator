import { readFileSync } from "fs";

import { generateVideoFile, getDuration } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const comments = JSON.parse(readFileSync(args[0]).toString()) as string[][];

  for (const comment of comments) {
  }

  // Kill Worker
  process.exit();
};

init();

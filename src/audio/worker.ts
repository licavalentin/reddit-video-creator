import { readFileSync } from "fs";
import { join } from "path";

import { renderPath } from "../config/paths";

import { generateAudioFile } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const folders = JSON.parse(readFileSync(args[0]).toString()) as string[];

  const voice = args[1];

  for (const folder of folders) {
    const ids = folder.split("-");
    const exportPath = join(renderPath, ids[0], folder);

    generateAudioFile({
      exportPath,
      textFilePath: join(exportPath, "text.txt"),
      voice,
    });
  }

  // Kill Worker
  process.exit();
};

init();

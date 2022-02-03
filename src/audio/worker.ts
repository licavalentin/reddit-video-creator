import { readFileSync } from "fs";
import { join } from "path";

import { renderPath } from "../config/paths";

import { generateAudioFile } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const { jobs, voice, bal4web, balcon, customAudio } = JSON.parse(
    readFileSync(args[0]).toString()
  ) as {
    jobs: string[];
    voice: string;
    bal4web: string | null;
    balcon: string | null;
    customAudio: boolean;
  };

  for (const folder of jobs) {
    const ids = folder.split("-");
    const exportPath = join(renderPath, ids[0], folder);

    generateAudioFile({
      exportPath,
      textFilePath: join(exportPath, "text.txt"),
      voice,
      bal4web,
      balcon,
      customAudio,
    });
  }

  // Kill Worker
  process.exit();
};

init();

import { readFileSync } from "fs";
import { join } from "path";

import { renderPath } from "../config/paths";
import { getDuration } from "../utils/helper";

import { generateVideo } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const { jobs, ffmpeg, ffprobe, audioTrimDuration } = JSON.parse(
    readFileSync(args[0]).toString()
  ) as {
    jobs: string[];
    ffmpeg: string | null;
    ffprobe: string | null;
    audioTrimDuration: number;
  };

  for (const folder of jobs) {
    const ids = folder.split("-");
    const exportPath = join(renderPath, ids[0], folder);
    const audioPath = join(exportPath, "audio.mp3");

    generateVideo({
      image: join(exportPath, "image.png"),
      audio: audioPath,
      duration: getDuration({
        filePath: audioPath,
        audioTrimDuration,
        ffprobe,
      }),
      exportPath,
      ffmpeg,
    });
  }

  // Kill Worker
  process.exit();
};

init();

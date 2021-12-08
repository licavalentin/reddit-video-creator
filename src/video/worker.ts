import { join } from "path";

import { renderPath } from "../config/paths";
import { getDuration } from "../utils/helper";

import { generateVideo } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const folders = JSON.parse(args[0]) as string[];

  for (const folder of folders) {
    const ids = folder.split("-");
    const exportPath = join(renderPath, ids[0], folder);

    const audioDuration = getDuration(join(exportPath, "subtitle.srt"));

    if (audioDuration) {
      generateVideo({
        image: join(exportPath, "image.png"),
        audio: join(exportPath, "audio.wav"),
        duration: audioDuration,
        exportPath,
      });
    }

    console.log("video-generated");
  }

  // Kill Worker
  process.exit();
};

init();

import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { renderPath } from "../config/paths";

import { mergeVideos } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const { jobs, ffmpeg } = JSON.parse(readFileSync(args[0]).toString()) as {
    jobs: string[][]; // [["0-1", "0-2"], ["0-1"]]
    ffmpeg: string | null;
  };

  for (let i = 0; i < jobs.length; i++) {
    const folders = jobs[i]; // ["0-1", "0-2"]

    const exportPath = join(renderPath, folders[0].split("-")[0]);

    const listPath = join(exportPath, "list.txt");

    let stopComment: boolean = false;

    const videos = folders.map((folder) => {
      const videoExists = existsSync(
        join(renderPath, folders[0].split("-")[0], folder, "video.mp4")
      );

      if (!videoExists) {
        stopComment = true;
      }

      return `file '${join(
        renderPath,
        folders[0].split("-")[0],
        folder,
        "video.mp4"
      )}'`;
    });

    if (stopComment) {
      continue;
    }

    writeFileSync(listPath, videos.join(" \n"));

    mergeVideos({ listPath, exportPath, ffmpeg });

    // console.log("video-comment-merged");
  }

  // Kill Worker
  process.exit();
};

init();

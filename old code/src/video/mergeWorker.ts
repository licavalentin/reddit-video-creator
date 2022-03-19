import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { renderPath } from "../config/paths";

import { mergeVideos } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const { jobs, ffmpeg } = JSON.parse(readFileSync(args[0]).toString()) as {
    jobs: number[][]; // folders [1,2,3] create one group
    ffmpeg: string | null;
  };

  for (const commentGroup of jobs) {
    const folderPath = join(renderPath, "render-groups");

    const exportFolderPath = join(
      folderPath,
      `${commentGroup[0]}-${commentGroup[commentGroup.length - 1]}`
    );

    let stopComment: boolean = false;

    const videos = commentGroup.map((e) => {
      const videoExists = existsSync(join(renderPath, e + "", "video.mp4"));

      if (!videoExists) {
        stopComment = true;
      }

      return `file '${join(renderPath, e + "", "video.mp4")}`;
    });

    if (stopComment) {
      continue;
    }

    mkdirSync(exportFolderPath);

    const listPath = join(exportFolderPath, "list.txt");

    writeFileSync(listPath, videos.join(" \n"));

    mergeVideos({
      listPath,
      exportPath: exportFolderPath,
      ffmpeg,
    });

    // console.log("video-group-merged");
  }

  // Kill Worker
  process.exit();
};

init();

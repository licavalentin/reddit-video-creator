import { existsSync, writeFileSync } from "fs";
import { join } from "path";

import { renderPath } from "../config/paths";

import { mergeVideos } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const foldersGroup = JSON.parse(args[0]) as string[][]; // [["0-1", "0-2"], ["0-1"]]

  for (let i = 0; i < foldersGroup.length; i++) {
    const folders = foldersGroup[i]; // ["0-1", "0-2"]

    const parentFolderPath = join(renderPath, folders[0].split("-")[0]);

    const listPath = join(parentFolderPath, "list.txt");

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

    mergeVideos({ listPath, exportPath: parentFolderPath });

    // console.log("video-comment-merged");
  }

  // Kill Worker
  process.exit();
};

init();

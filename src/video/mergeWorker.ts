import { execFile } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import { renderPath } from "../config/paths";

/**
 * Merge All Videos together
 * @param inputPath Input Path
 * @param exportPath Path to export final output
 */
export const mergeVideos = async (listPath: string, exportPath: string) => {
  return new Promise((resolve, reject) => {
    execFile(
      "ffmpeg",
      [
        "-safe",
        "0",
        "-f",
        "concat",
        "-i",
        listPath,
        "-c",
        "copy",
        join(exportPath, "video.mp4"),
      ],
      (error) => {
        if (error) {
          console.log(error);
        }

        resolve(null);
      }
    );
  });
};

const init = async () => {
  const args = process.argv.slice(2);
  const comments = JSON.parse(args[0]) as number[][]; // folders [1,2,3] create one group

  for (const commentGroup of comments) {
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

    await mergeVideos(listPath, exportFolderPath);

    console.log("video-group-merged");
  }

  // Kill Worker
  process.exit();
};

init();

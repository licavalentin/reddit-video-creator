import { execFile } from "child_process";
import { existsSync, writeFileSync } from "fs";
import { join } from "path";

import { renderPath } from "../config/paths";

/**
 * Merge All Videos together
 * @param inputPath Input Path
 * @param exportPath Path to export final output
 */
export const mergeVideos = async (listFile: string, exportPath: string) => {
  const outPutFilePath = join(exportPath, `video.mp4`);

  const merge = () =>
    new Promise((resolve, reject) => {
      execFile(
        "ffmpeg",
        [
          "-safe",
          "0",
          "-f",
          "concat",
          "-i",
          listFile,
          "-c",
          "copy",
          outPutFilePath,
        ],
        (error) => {
          if (error) {
            console.log(error);

            reject(error);
          }

          resolve(null);
        }
      );
    });

  try {
    await merge();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

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

    await mergeVideos(listPath, parentFolderPath);

    console.log("video-comment-merged");
  }

  // Kill Worker
  process.exit();
};

init();

import { execFile } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import { renderPath } from "../config/paths";

/**
 * Merge All Videos together
 * @param title Post title
 * @param inputPath Input Path
 * @param exportPath Path to export final output
 */
export const mergeVideos = async (comments: number[]) => {
  const folderPath = join(renderPath, "render-groups");

  const folder = join(
    folderPath,
    `${comments[0]}-${comments[comments.length - 1]}`
  );
  mkdirSync(folder);

  const listPath = join(folder, "list.txt");

  const videos = comments
    .map((e) => join(renderPath, e + ""))
    .filter((f) => existsSync(join(f, "render.mp4")))
    .map((t) => `file '${join(t, "render.mp4")}`);

  writeFileSync(listPath, videos.join(" \n"));

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
        join(folder, "video.mp4"),
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
  const comments = JSON.parse(args[0]) as number[][];

  for (const commentGroup of comments) {
    await mergeVideos(commentGroup);

    console.log("video-group-merged");
  }

  // Kill Worker
  process.exit();
};

init();

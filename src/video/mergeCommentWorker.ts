import { execFile } from "child_process";
import { writeFileSync } from "fs";
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
  const folders = JSON.parse(args[0]) as string[][];

  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i];

    const exportPath = join(renderPath, folder[0].split("-")[0]);

    const listPath = join(exportPath, "list.txt");
    const listFile = folder.map(
      (e) =>
        `file '${join(renderPath, folder[0].split("-")[0], e, "video.mp4")}'`
    );

    writeFileSync(listPath, listFile.join(" \n"));

    await mergeVideos(listPath, exportPath);
  }

  // Kill Worker
  process.exit();
};

init();

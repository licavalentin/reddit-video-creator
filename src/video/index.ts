import cluster from "cluster";
import { cpus } from "os";
import { execFile } from "child_process";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";

import {
  getArgument,
  getFolders,
  splitByDepth,
  spreadWork,
} from "../utils/helper";
import { Comment } from "../interface/post";
import { renderPath } from "../config/paths";

export const AddBackgroundMusic = async (
  videoPath: string,
  audioPath: string,
  outputPath: string
) => {
  const ffmpegPath = getArgument("FFMPEG");

  return new Promise((resolve) => {
    execFile(
      ffmpegPath,
      [
        "-i",
        videoPath,
        "-filter_complex",
        `"amovie=${audioPath}:loop=0,asetpts=N/SR/TB[aud];[0:a][aud]amix[a]"`,
        "-map",
        "0:v",
        "-map",
        "'[a]'",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "256k",
        "-shortest",
        outputPath,
      ],
      (error: any) => {
        if (error) {
          console.log(error);

          // console.log("Video couldn't create successfully", "error");
          throw error;
        }

        // console.log("Video created successfully", "success");
        console.log("process-video-done");

        resolve(null);
      }
    );
  });
};

/**
 * Merge All Videos together
 * @param title Post title
 * @param inputPath Input Path
 * @param exportPath Path to export final output
 */
export const mergeVideos = async (
  title: string,
  inputPath: string,
  exportPath: string
) => {
  const folders = getFolders(inputPath);

  const outPutFilePath = join(exportPath, `${title}.mp4`);

  const listPath = join(inputPath, "list.txt");

  const videos = folders
    .filter((folder) => existsSync(join(inputPath, folder, "video.mp4")))
    .map((folder) => `file '${join(inputPath, folder, "video.mp4")}`);

  writeFileSync(listPath, videos.join(" \n"));

  const merge = () =>
    new Promise((resolve, reject) => {
      const ffmpegPath = getArgument("FFMPEG");

      execFile(
        ffmpegPath,
        [
          "-safe",
          "0",
          "-f",
          "concat",
          "-i",
          listPath,
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

export const generateCommentVideo = async (comments: Comment[]) => {
  return new Promise((resolve) => {
    const work = spreadWork(comments, cpus().length);
    let counter = work.length;

    for (const jobs of work) {
      cluster.setupPrimary({
        exec: join(__dirname, "worker.js"),
        args: [JSON.stringify(jobs)],
      });

      const worker = cluster.fork();

      worker.on("exit", () => {
        counter--;

        if (counter === 0) {
          resolve(null);
        }
      });
    }
  });
};

export const mergeCommentGroup = async (comments: Comment[]) => {
  return new Promise((resolve) => {
    const work = spreadWork(
      splitByDepth(comments).map((e) => e.map((c) => c.id)),
      cpus().length
    );

    let counter = work.length;

    mkdirSync(join(renderPath, "render-groups"));

    for (const jobs of work) {
      cluster.setupPrimary({
        exec: join(__dirname, "mergeWorker.js"),
        args: [JSON.stringify(jobs)],
      });

      const worker = cluster.fork();

      worker.on("exit", () => {
        counter--;

        if (counter === 0) {
          resolve(null);
        }
      });
    }
  });
};

export default async (comments: Comment[]) => {
  // Generate video for each comment
  await generateCommentVideo(comments);

  // Merge Comments by depth in groups
  await mergeCommentGroup(comments);
};

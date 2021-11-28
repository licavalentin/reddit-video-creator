import { execFile } from "child_process";
import { join } from "path";
import { existsSync, writeFileSync } from "fs";

import { getArgument, getFolders } from "../utils/helper";

/**
 * Generate Video from image and audio
 *
 * @param {string} image Path for image file
 * @param {string} audio Path for audio file
 * @param {string} path Export assets path
 * @param {number} duration Video duration
 */
export const generateVideo = async (
  image: string,
  audio: string,
  path: string,
  duration: number
) => {
  const ffmpegPath = getArgument("FFMPEG");

  return new Promise((resolve) => {
    // console.log("Creating Video", "action");

    execFile(
      ffmpegPath,
      [
        "-loop",
        "1",
        "-i",
        image,
        "-i",
        audio,
        "-c:v",
        "libx264",
        "-tune",
        "stillimage",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-pix_fmt",
        "yuv420p",
        "-shortest",
        "-t",
        duration.toString(),
        join(path, `video.mp4`),
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

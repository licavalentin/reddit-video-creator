import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

import { imageDetails } from "../config/image";
import { assetsPath } from "../config/paths";
import { fps } from "../config/video";

type GenerateVideo = (args: {
  image: string;
  audio?: string;
  duration: number;
  exportPath: string;
  title?: string;
  ffmpeg: string | null;
}) => void;

/**
 * Generate Video from frame data
 * @param renderDataPath Text file with frames data
 * @param outputPath Video Output path
 */
export const generateVideo: GenerateVideo = ({
  image,
  audio,
  duration,
  exportPath,
  title,
  ffmpeg,
}) => {
  const command = `${
    ffmpeg && existsSync(ffmpeg) ? `"${ffmpeg}"` : "ffmpeg"
  } -loop 1 -framerate ${fps} -i ${image} ${
    !audio
      ? `-i "${join(assetsPath, "music", "null.mp3")}" -vf "scale=${
          imageDetails.width
        }:${imageDetails.height}"`
      : `-i ${audio} -tune stillimage -c:a aac -b:a 192k -shortest`
  } -pix_fmt yuv420p -c:v libx264 -t ${duration} ${join(
    exportPath,
    `${title ?? "video"}.mp4`
  )}`;

  try {
    execSync(command, { stdio: "pipe" });
  } catch (error) {
    console.log(error);
  }

  console.log("video-generated");
};

type MergeVideos = (args: {
  listPath: string;
  exportPath: string;
  title?: string;
  ffmpeg: string | null;
  video?: boolean;
}) => void;

/**
 * Merge Videos together
 */
export const mergeVideos: MergeVideos = ({
  listPath,
  exportPath,
  title,
  ffmpeg,
  video = true,
}) => {
  const command = `${
    ffmpeg && existsSync(ffmpeg) ? `"${ffmpeg}"` : "ffmpeg"
  } -safe 0 -f concat -i ${listPath} -c copy "${join(
    exportPath,
    `${title ?? "video"}.${video ? "mp4" : "mp3"}`
  )}"`;

  try {
    execSync(command, { stdio: "pipe" });
  } catch (error) {
    console.log(error);
  }
};

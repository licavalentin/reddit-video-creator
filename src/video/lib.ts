import { execSync } from "child_process";
import { join } from "path";

import { video } from "../config/video";

type GetDuration = (args: {
  filePath: string;
  audioTrimDuration?: number;
}) => number;

/**
 * Get File Duration
 */
export const getDuration: GetDuration = ({
  filePath,
  audioTrimDuration = 0.8,
}) => {
  const args = `ffprobe -i "${filePath}" -show_entries format=duration -v quiet -of csv="p=0"`;

  try {
    return (
      Number(execSync(args, { stdio: "pipe" }).toString().trim()) -
      audioTrimDuration
    );
  } catch (error) {
    return 0;
  }
};

type GenerateFileVideo = (args: {
  image: string;
  audio?: string;
  duration: number;
  exportPath: string;
  title?: string;
}) => void;

/**
 * Generate Video from frame data
 */
export const generateVideoFile: GenerateFileVideo = ({
  image,
  audio,
  duration,
  exportPath,
  title,
}) => {
  const command = `ffmpeg -y -loop 1 -framerate ${
    video.ffmpegFps
  } -i "${image}" ${
    !audio
      ? `-i "${join(__dirname, "..", "..", "public", "null.mp3")}" -vf "scale=${
          video.width
        }:${video.height}"`
      : `-i "${audio}" -tune stillimage -c:a aac -b:a 192k -shortest`
  } -pix_fmt yuv420p -c:v libx264 -t ${duration} "${join(
    exportPath,
    `${title ?? "video"}.${video.fileFormat}`
  )}"`;

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
}) => void;
/**
 * Merge Videos together
 */
export const mergeVideos: MergeVideos = ({ listPath, exportPath, title }) => {
  const command = `ffmpeg -y -safe 0 -f concat -i "${listPath}" -c copy "${join(
    exportPath,
    `${title ?? "video"}.${video.fileFormat}`
  )}"`;

  try {
    execSync(command, { stdio: "pipe" });
  } catch (error) {
    console.log(error);
  }
};

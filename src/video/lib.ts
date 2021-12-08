import { execFileSync } from "child_process";
import { join } from "path";

import { imageDetails } from "../config/image";

import { getArgument } from "../utils/helper";

export const AddBackgroundMusic = async (
  videoPath: string,
  audioPath: string,
  outputPath: string
) => {
  const ffmpeg = getArgument("FFMPEG") ?? "ffmpeg";

  const args = [
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
  ];

  try {
    execFileSync(ffmpeg, args, { stdio: "pipe" });
  } catch (error) {
    // console.log(error);
  }

  // console.log("process-video-done");
};

type GenerateVideo = (args: {
  image: string;
  audio?: string;
  duration: number;
  exportPath: string;
  title?: string;
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
}) => {
  const ffmpeg = getArgument("FFMPEG") ?? "ffmpeg";

  const args = [
    "-loop",
    "1",
    "-framerate",
    "5",
    "-i",
    image,
    ...(() => {
      if (!audio) {
        return [
          "-f",
          "lavfi",
          "-i",
          "anullsrc=channel_layout=stereo:sample_rate=44100",
          "-vf",
          `scale=${imageDetails.width}:${imageDetails.height}`,
        ];
      }

      return [
        "-i",
        audio,
        "-tune",
        "stillimage",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-shortest",
      ];
    })(),

    "-pix_fmt",
    "yuv420p",
    "-c:v",
    "libx264",
    "-t",
    duration.toString(),
    join(exportPath, `${title ?? "video"}.mp4`),
  ];

  try {
    execFileSync(ffmpeg, args, { stdio: "pipe" });
  } catch (error) {
    // console.log(error);
  }
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
  const ffmpeg = getArgument("FFMPEG") ?? "ffmpeg";

  const args = [
    "-safe",
    "0",
    "-f",
    "concat",
    "-i",
    listPath,
    "-c",
    "copy",
    join(exportPath, `${title ?? "video"}.mp4`),
  ];

  try {
    execFileSync(ffmpeg, args, { stdio: "pipe" });
  } catch (error) {
    // console.log(error);
  }
};

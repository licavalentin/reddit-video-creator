import { execFile } from "child_process";
import { join } from "path";

import { renderPath } from "../config/paths";
import { getDuration } from "../utils/helper";

type GenerateVideo = (args: {
  image: string;
  audio: string;
  duration: number;
  exportPath: string;
}) => Promise<null>;

/**
 * Generate Video from frame data
 * @param renderDataPath Text file with frames data
 * @param outputPath Video Output path
 */
const generateVideo: GenerateVideo = ({
  image,
  audio,
  duration,
  exportPath,
}) => {
  return new Promise((resolve) => {
    execFile(
      "ffmpeg",
      [
        "-loop",
        "1",
        "-framerate",
        "5",
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
        join(exportPath, `video.mp4`),
      ],
      (err) => {
        if (err) {
          console.log(err);
        }

        resolve(null);
      }
    );
  });
};

const init = async () => {
  const args = process.argv.slice(2);
  const folders = JSON.parse(args[0]) as string[];

  for (const folder of folders) {
    const ids = folder.split("-");
    const exportPath = join(renderPath, ids[0], folder);

    await generateVideo({
      image: join(exportPath, "image.png"),
      audio: join(exportPath, "audio.wav"),
      duration: getDuration(join(exportPath, "subtitle.srt")),
      exportPath,
    });

    console.log("comment-video-created");
  }

  // Kill Worker
  process.exit();
};

init();

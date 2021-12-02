import { execFile } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";

import { renderPath } from "../config/paths";
import { Subtitle } from "../interface/audio";
import { Comment } from "../interface/post";

/**
 * Generate Video from frame data
 * @param renderDataPath Text file with frames data
 * @param outputPath Video Output path
 */
const generateVideo = (renderDataPath: string, outputPath: string) => {
  return new Promise((resolve) => {
    execFile(
      "ffmpeg",
      [
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        renderDataPath,
        "-c:v",
        "libx264",
        "-r",
        "24",
        "-pix_fmt",
        "yuv420p",
        join(outputPath, "video.mp4"),
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

const addAudio = (videoPath: string, audioPath: string, outputPath: string) => {
  return new Promise((resolve) => {
    execFile(
      "ffmpeg",
      [
        "-y",
        "-i",
        videoPath,
        "-i",
        audioPath,
        "-map",
        "0",
        "-map",
        "1:a",
        "-c:v",
        "copy",
        "-shortest",
        outputPath,
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
  const comments = JSON.parse(args[0]) as Comment[];

  for (const comment of comments) {
    const folder = join(renderPath, comment.id + "");

    const fileList = (comment.content as Subtitle[])
      .map(
        (content, index) =>
          `file '${join(folder, `${comment.id}-${index}.png`)}'\nduration ${
            content.duration
          }`
      )
      .join("\n")
      .concat(
        `\nfile '${join(
          folder,
          `${comment.id}-${comment.content.length - 1}.png`
        )}'\nduration 200`
      );

    const renderListPath = join(folder, "data.txt");

    writeFileSync(renderListPath, fileList);

    await generateVideo(renderListPath, join(folder));

    await addAudio(
      join(folder, "video.mp4"),
      join(folder, "audio.wav"),
      join(folder, "render.mp4")
    );
  }

  //   const fileList = subtitle
  //     .map((item, index) => `file '${images[index]}'\nduration ${item.time.time}`)
  //     .join("\n");

  // Kill Worker
  process.exit();
};

init();

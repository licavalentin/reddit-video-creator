import cluster from "cluster";
import { writeFileSync } from "fs";
import { join } from "path";
import {
  commentPath,
  ffmpegFile,
  imagePath,
  introPath,
  midPath,
  outroPath,
  tempAudio,
  tempData,
} from "../config/paths";
import { video } from "../config/video";

import { Comment, CommentText } from "../interface/post";
import { spreadWork } from "../utils/render";

type MergeFrames = (args: { comments: Comment[][] }) => Promise<null>;

/**
 * Merge Frames
 */
export const mergeFrames: MergeFrames = async ({ comments }) => {
  return new Promise((resolve) => {
    const files: {
      image: string;
      audio: string;
      exportPath: string;
      title: string;
    }[] = [
      {
        image: imagePath(introPath, 0),
        audio: join(tempAudio, "intro.mp3"),
        exportPath: introPath,
        title: "video-0",
      },
      {
        image: imagePath(outroPath, 0),
        audio: join(tempAudio, "outro.mp3"),
        exportPath: outroPath,
        title: "video-0",
      },
      {
        image: imagePath(midPath, 0),
        audio: join(__dirname, "..", "..", "public", "null.mp3"),
        exportPath: midPath,
        title: "video-0",
      },
    ];

    for (let i = 0; i < comments.length; i++) {
      const commentGroupPath = commentPath(i);

      const lastBody = comments[i][comments[i].length - 1]
        .body as CommentText[];
      let totalFrames = lastBody[lastBody.length - 1].frame;

      for (let j = 0; j < comments[i].length; j++) {
        const body = comments[i][j].body as CommentText[];

        for (let k = 0; k < body.length; k++) {
          const { frame } = body[k];

          files.push({
            image: imagePath(
              commentGroupPath,
              String(frame).padStart(Math.ceil(totalFrames / 10), "0")
            ),
            audio: join(tempAudio, `${[i, j, k].join("-")}.mp3`),
            exportPath: commentGroupPath,
            title: `video-${frame}`,
          });
        }
      }
    }

    const work = spreadWork(files);
    let counter = work.length;

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      const jobsFilePath = join(tempData, `${index}-video.json`);

      writeFileSync(jobsFilePath, JSON.stringify(jobs));

      cluster.setupPrimary({
        exec: join(__dirname, "worker.ts"),
        args: [jobsFilePath],
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

import cluster from "cluster";
import { existsSync, writeFileSync } from "fs";
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
import { mergeVideos } from "./lib";

type MergeFrames = (args: { comments: Comment[][] }) => Promise<null>;

/**
 * Merge Frames
 */
export const mergeFrames: MergeFrames = async ({ comments }) => {
  return new Promise((resolve) => {
    const introData = {
      image: imagePath(introPath, 0),
      audio: join(tempAudio, "intro.mp3"),
      exportPath: introPath,
      title: "video-0",
    };

    const outroData = {
      image: imagePath(outroPath, 0),
      audio: join(tempAudio, "outro.mp3"),
      exportPath: outroPath,
      title: "video-0",
    };

    const midData = {
      image: imagePath(midPath, 0),
      audio: join(__dirname, "..", "..", "public", "null.mp3"),
      exportPath: midPath,
      title: "video-0",
    };

    const files: {
      image: string;
      audio: string;
      exportPath: string;
      title: string;
    }[] = [introData, outroData, midData];

    const fileList: string[] = [
      join(introData.exportPath, `${introData.title}.${video.fileFormat}`),
      join(midData.exportPath, `${midData.title}.${video.fileFormat}`),
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

          const audioFilePath = join(tempAudio, `${[i, j, k].join("-")}.mp3`);

          if (!existsSync(audioFilePath)) {
            continue;
          }

          const commentData = {
            image: imagePath(
              commentGroupPath,
              String(frame).padStart(String(totalFrames).length, "0")
            ),
            audio: audioFilePath,
            exportPath: commentGroupPath,
            title: `video-${frame}`,
          };

          files.push(commentData);

          fileList.push(
            join(
              commentData.exportPath,
              `${commentData.title}.${video.fileFormat}`
            )
          );
        }
      }

      fileList.push(
        join(midData.exportPath, `${midData.title}.${video.fileFormat}`)
      );
    }

    fileList.push(
      join(outroData.exportPath, `${outroData.title}.${video.fileFormat}`)
    );

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
        console.log(`🍿 Video Group ${counter} finished`);

        counter--;

        if (counter === 0) {
          const listPath = join(tempData, "render-list.txt");

          writeFileSync(
            listPath,
            fileList
              .filter((e) => existsSync(e))
              .map((e) => ffmpegFile(e))
              .join(" \n")
          );

          console.log(`📦 Merging Videos`);

          mergeVideos({
            listPath,
            exportPath: "C:\\Users\\licav\\Desktop",
          });

          resolve(null);
        }
      });
    }
  });
};

type RenderVideo = (args: { comments: Comment[][] }) => Promise<void>;

const renderVideo: RenderVideo = async ({ comments }) => {
  await mergeFrames({
    comments,
  });
};

export default renderVideo;

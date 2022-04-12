import cluster from "cluster";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { video } from "../config/video";

import { Comment, Post, TextComment } from "../interface/post";

import { deleteFolder, getDuration, spreadWork } from "../utils/render";

type CreateAudio = (args: {
  post: Post;
  comments: Comment[][];
  tmpDir: string;
}) => Promise<{
  post: Post;
  comments: {
    durationInFrames: number;
    commentsGroup: Comment[];
  }[];
}>;

export const createAudio: CreateAudio = async ({ post, comments, tmpDir }) => {
  return new Promise(async (resolve) => {
    console.log("🎵 Generating Audio");

    const audioPath = join(__dirname, "..", "..", "public", "audio");

    if (existsSync(audioPath)) deleteFolder(audioPath);

    mkdirSync(audioPath);

    const audios: string[] = [];
    for (let i = 0; i < comments.length; i++) {
      const commentGroup = comments[i];
      for (let j = 0; j < commentGroup.length; j++) {
        const body = commentGroup[j].body as string[];
        for (let k = 0; k < body.length; k++) {
          const fileName = [i, j, k].join("-");

          writeFileSync(join(tmpDir, `${fileName}.txt`), body[k]);

          audios.push(fileName);
        }
      }
    }

    const introId = "intro";
    writeFileSync(join(tmpDir, `${introId}.txt`), post.title as string);

    const outroId = "outro";
    const outroMessage = "Thank you for watching";
    writeFileSync(join(tmpDir, `${outroId}.txt`), outroMessage);

    audios.push(introId, outroId);

    const work = spreadWork(audios);
    let counter = work.length;

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      const jobsFilePath = join(tmpDir, `${index}-audio.json`);

      writeFileSync(jobsFilePath, JSON.stringify(jobs));

      cluster.setupPrimary({
        exec: join(__dirname, "worker.ts"),
        args: [jobsFilePath, tmpDir],
      });

      const worker = cluster.fork();

      worker.on("exit", () => {
        counter--;

        if (counter === 0) {
          resolve({
            post: {
              ...post,
              title: (() => {
                const audioFilePath = `${introId}.mp3`;

                const durationInSeconds = getDuration({
                  filePath: join(audioPath, audioFilePath),
                });

                return {
                  text: post.title as string,
                  durationInFrames: Math.ceil(durationInSeconds * video.fps),
                  audio: audioFilePath,
                };
              })(),
              outro: (() => {
                const audioFilePath = `${outroId}.mp3`;

                const durationInSeconds = getDuration({
                  filePath: join(audioPath, audioFilePath),
                });

                return {
                  text: outroMessage,
                  durationInFrames: Math.ceil(durationInSeconds * video.fps),
                  audio: audioFilePath,
                };
              })(),
            },
            comments: comments.map((commentGroup, i) => {
              let durationInFrames: number = 0;

              const commentsGroup = commentGroup.map((comment, j) => ({
                ...comment,
                body: (comment.body as string[]).map((text, k) => {
                  const audioFilePath = `${[i, j, k].join("-")}.mp3`;

                  const durationInSeconds = getDuration({
                    filePath: join(audioPath, audioFilePath),
                  });

                  const frames = Math.ceil(durationInSeconds * video.fps);

                  durationInFrames += frames;

                  return {
                    text,
                    durationInFrames: frames,
                    audio: audioFilePath,
                  };
                }) as TextComment[],
              }));

              return {
                durationInFrames,
                commentsGroup,
              };
            }),
          });
        }
      });
    }
  });
};

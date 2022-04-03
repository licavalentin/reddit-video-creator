import cluster from "cluster";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import { video } from "../config/video";
import { Comment, CommentBody } from "../interface/post";

import { deleteFolder, getDuration, spreadWork } from "../utils/render";

type CreateAudio = (args: {
  comments: Comment[][];
  tmpDir: string;
}) => Promise<Comment[][]>;

export const createAudio: CreateAudio = async ({ comments, tmpDir }) => {
  return new Promise(async (resolve) => {
    console.log("🎵 Generating Audio");

    const audioPath = join(__dirname, "..", "..", "public", "audio");
    deleteFolder(audioPath);
    mkdirSync(audioPath);

    const audios: [number, number, number][] = [];
    for (let i = 0; i < comments.length; i++) {
      const commentGroup = comments[i];
      for (let j = 0; j < commentGroup.length; j++) {
        const body = commentGroup[j].body as CommentBody[];
        for (let k = 0; k < body.length; k++) {
          writeFileSync(
            join(tmpDir, `${[i, j, k].join("-")}.txt`),
            body[k].text
          );
          audios.push([i, j, k]);
        }
      }
    }

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
          resolve(
            comments.map((cg, i) => {
              let totalDuration = 0;

              console.log("🎵 Audio Generated Successfully");

              return cg.map((c, j) => {
                return {
                  ...c,
                  body: (c.body as CommentBody[]).map((t, k) => {
                    const filePath = join(
                      __dirname,
                      "..",
                      "..",
                      "public",
                      "audio",
                      `${[i, j, k].join("-")}.mp3`
                    );
                    const duration = Math.ceil(
                      getDuration({
                        filePath,
                      })
                    );

                    const data = {
                      ...t,
                      frames: [
                        totalDuration > 0 ? totalDuration * video.fps + 1 : 0,
                        (totalDuration + duration) * video.fps,
                      ],
                    };

                    totalDuration += duration;

                    return data;
                  }),
                };
              });
            })
          );
        }
      });
    }
  });
};

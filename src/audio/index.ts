import cluster from "cluster";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import { Comment } from "../interface/post";
import { deleteFolder } from "../utils/render";

import { spreadWork } from "./lib";

type CreateAudio = (args: {
  comments: Comment[][];
  tmpDir: string;
}) => Promise<null>;

export const createAudio: CreateAudio = async ({ comments, tmpDir }) => {
  return new Promise(async (resolve) => {
    const audioPath = join(__dirname, "..", "..", "public", "audio");
    deleteFolder(audioPath);
    mkdirSync(audioPath);

    const jobs: { text: string; id: [number, number, number] }[] = [];

    for (let i = 0; i < comments.length; i++) {
      const commentsList = comments[i];

      for (let j = 0; j < commentsList.length; j++) {
        const comment = commentsList[j];

        for (let k = 0; k < (comment.body as string[]).length; k++) {
          jobs.push({
            text: (comment.body as string[])[k],
            id: [i, j, k],
          });
        }
      }
    }

    const work = spreadWork(jobs);

    let counter = work.length;

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      const audioDataPath = join(tmpDir, `${index}-audio.json`);

      writeFileSync(audioDataPath, JSON.stringify(jobs));

      cluster.setupPrimary({
        exec: join(__dirname, "worker.js"),
        args: [
          JSON.stringify({
            audioDataPath,
          }),
        ],
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

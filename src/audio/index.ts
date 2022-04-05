import cluster from "cluster";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import { Comment } from "../interface/post";

import { deleteFolder, spreadWork } from "../utils/render";

type CreateAudio = (args: {
  comments: Comment[][];
  tmpDir: string;
}) => Promise<null>;

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
        const body = commentGroup[j].body as string[];
        for (let k = 0; k < body.length; k++) {
          writeFileSync(join(tmpDir, `${[i, j, k].join("-")}.txt`), body[k]);
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
          resolve(null);
        }
      });
    }
  });
};

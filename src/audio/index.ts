import cluster from "cluster";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import { Comment, CommentText, Post } from "../interface/post";

import { spreadWork } from "../utils/render";

type CreateAudio = (args: {
  post: Post;
  comments: Comment[][];
  tmpDir: string;
}) => Promise<null>;

export const createAudio: CreateAudio = async ({ post, comments, tmpDir }) => {
  return new Promise(async (resolve) => {
    console.log("🎵 Generating Audio");

    const dataPath = join(tmpDir, "data");
    mkdirSync(dataPath);
    const audioPath = join(tmpDir, "audio");
    mkdirSync(audioPath);

    const audios: string[] = [];
    for (let i = 0; i < comments.length; i++) {
      const commentGroup = comments[i];
      for (let j = 0; j < commentGroup.length; j++) {
        const body = commentGroup[j].body as CommentText[];
        for (let k = 0; k < body.length; k++) {
          const fileName = [i, j, k].join("-");

          writeFileSync(join(dataPath, `${fileName}.txt`), body[k].text);

          audios.push(fileName);
        }
      }
    }

    const introId = "intro";
    writeFileSync(join(dataPath, `${introId}.txt`), post.title as string);

    const outroId = "outro";
    const outroMessage = "Thank you for watching see you on another video buy";
    writeFileSync(join(dataPath, `${outroId}.txt`), outroMessage);

    audios.push(introId, outroId);

    const work = spreadWork(audios);
    let counter = work.length;

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      const jobsFilePath = join(dataPath, `${index}-audio.json`);

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

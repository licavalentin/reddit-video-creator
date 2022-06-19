import cluster from "cluster";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import { tempAudio, tempData } from "../config/paths";
import { CommentGroup, CommentText, Post } from "../interface/post";

import { spreadWork } from "../utils/render";

type CreateAudio = (args: {
  post: Post;
  comments: CommentGroup[];
}) => Promise<null>;

export const createAudio: CreateAudio = async ({ post, comments }) => {
  return new Promise(async (resolve) => {
    mkdirSync(tempData);
    mkdirSync(tempAudio);

    const audios: string[] = [];
    for (let i = 0; i < comments.length; i++) {
      const commentGroup = comments[i];
      for (let j = 0; j < commentGroup.comments.length; j++) {
        const body = commentGroup.comments[j].body as CommentText[];
        for (let k = 0; k < body.length; k++) {
          const fileName = [i, j, k].join("-");

          const cleanText = body[k].text
            .replace(/<br>/g, " ")
            .replace(
              /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
              ""
            )
            .replace(/\*/g, "")
            .replace(/’/g, "'")
            .replace(/”|“/g, '"')
            .replaceAll(".", ",")
            .replaceAll("?", ",")
            .replaceAll("!", ",")
            .replaceAll("_", " ");

          if (cleanText.replace(/[^a-zA-Z0-9]+/g, "-").length < 3) {
            continue;
          }

          writeFileSync(join(tempData, `${fileName}.txt`), cleanText);

          audios.push(fileName);
        }
      }
    }

    const introId = "intro";
    writeFileSync(join(tempData, `${introId}.txt`), post.title as string);

    const outroId = "outro";
    const outroMessage =
      "Make sure to subscribe and turn on notification, See you on another video, Bye";
    writeFileSync(join(tempData, `${outroId}.txt`), outroMessage);

    audios.push(introId, outroId);

    const work = spreadWork(audios);
    let counter = work.length;

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      const jobsFilePath = join(tempData, `${index}-audio.json`);

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

import cluster from "cluster";
import { writeFileSync } from "fs";
import { join } from "path";

import { tempPath } from "../config/paths";
import { Comment } from "../interface/post";

import { getPost, spreadWork } from "../utils/helper";
import { getVoice } from "./lib";

export default async (comments: Comment[]): Promise<null> => {
  return new Promise(async (resolve) => {
    const {
      cli: { balcon, bal4web },
      customAudio,
    } = getPost();

    const folders = [];
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      for (let j = 0; j < comment.content.length; j++) {
        folders.push(`${i}-${j}`);
      }
    }

    const work = spreadWork(folders);
    let counter = work.length;

    const voice = getVoice();

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      const jobsFilePath = join(tempPath, "data", `${index}-audio.json`);

      writeFileSync(
        jobsFilePath,
        JSON.stringify({
          jobs,
          voice,
          bal4web,
          balcon,
          customAudio,
        })
      );

      cluster.setupPrimary({
        exec: join(__dirname, "worker.js"),
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

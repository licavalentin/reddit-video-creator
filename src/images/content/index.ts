import cluster from "cluster";
import { cpus } from "os";
import { join } from "path";

import { Subtitle } from "../../interface/audio";
import { Comment } from "../../interface/post";

import { spreadWork } from "../../utils/helper";

export default async (comments: Comment[][]) => {
  return new Promise((resolve) => {
    const textJobs: {
      text: string;
      id: string;
    }[] = [];

    for (let i = 0; i < comments.length; i++) {
      const commentGroup = comments[i];

      for (let j = 0; j < commentGroup.length; j++) {
        const comment = commentGroup[j];

        for (let c = 0; c < (comment.content as Subtitle[]).length; c++) {
          textJobs.push({
            text: (comment.content as Subtitle[])
              .slice(0, c + 1)
              .map((e) => e.content)
              .join(" "),
            id: `${i}-${j}-${c}`,
          });
        }
      }
    }

    const work = spreadWork(textJobs, cpus().length);
    let counter = work.length;

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      cluster.setupPrimary({
        exec: join(__dirname, "worker.js"),
        args: [JSON.stringify(jobs)],
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

import cluster from "cluster";
import { cpus } from "os";
import { join } from "path";

import { Comment } from "../../interface/post";

import { spreadWork } from "../../utils/helper";

export default async (comments: Comment[][]) => {
  return new Promise((resolve) => {
    const work = spreadWork(comments, cpus().length);
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

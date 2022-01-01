import cluster from "cluster";
import { writeFileSync } from "fs";
import { join } from "path";

import { tempPath } from "../../config/paths";
import { Comment } from "../../interface/post";

import { spreadWork } from "../../utils/helper";

export default async (comments: Comment[][]) => {
  return new Promise((resolve) => {
    const work = spreadWork(comments);
    let counter = work.length;

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      const jobsFilePath = join(tempPath, "data", `${index}-frames.json`);

      writeFileSync(jobsFilePath, JSON.stringify(jobs));

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

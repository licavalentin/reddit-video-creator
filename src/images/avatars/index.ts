import { writeFileSync } from "fs";
import { join } from "path";
import cluster from "cluster";

import { avatarAssets, tempData } from "../../config/paths";

import { getFolders, getPost, spreadWork } from "../../utils/helper";

export const generateAvatar = async () => {
  return new Promise(async (resolve) => {
    // Get created post
    const { comments } = getPost();

    const heads = getFolders(join(avatarAssets, "head"));
    const faces = getFolders(join(avatarAssets, "face"));
    const bodies = getFolders(join(avatarAssets, "body"));

    const work = spreadWork(comments.map((e) => e.id));

    let counter = work.length;

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      const jobsFilePath = join(tempData, `${index}-avatars.json`);

      writeFileSync(
        jobsFilePath,
        JSON.stringify({
          heads,
          faces,
          bodies,
          comments: jobs,
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

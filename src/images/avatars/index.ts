import { writeFileSync } from "fs";
import { join } from "path";
import cluster from "cluster";

import { imagePath, renderPath } from "../../config/paths";

import { getFolders, getPost, spreadWork } from "../../utils/helper";

export const generateAvatar = async () => {
  // Get created post
  const { comments } = getPost();

  return new Promise(async (resolve) => {
    const avatarAssets = join(imagePath, "reddit-avatar");

    const heads = getFolders(join(avatarAssets, "head"));
    const faces = getFolders(join(avatarAssets, "face"));
    const bodies = getFolders(join(avatarAssets, "body"));

    const work = spreadWork(comments.map((e) => e.id));
    let counter = work.length;

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      const jobsFilePath = join(renderPath, index + "", "avatars.json");

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

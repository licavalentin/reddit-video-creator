import { join } from "path";
import { cpus } from "os";
import cluster from "cluster";

import { imagePath } from "../../config/paths";
import { Comment } from "../../interface/post";

import { getFolders, spreadWork } from "../../utils/helper";

type GenerateAvatar = (comments: Comment[]) => Promise<void>;

export const generateAvatar: GenerateAvatar = async (comments) => {
  return new Promise(async (resolve) => {
    const avatarAssets = join(imagePath, "reddit-avatar");

    const heads = getFolders(join(avatarAssets, "head"));
    const faces = getFolders(join(avatarAssets, "face"));
    const bodies = getFolders(join(avatarAssets, "body"));

    const work = spreadWork(comments);
    let counter = work.length;

    for (const job of work) {
      cluster.setupPrimary({
        exec: join(__dirname, "worker.js"),
        args: [
          JSON.stringify({
            heads,
            faces,
            bodies,
            comments: job,
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

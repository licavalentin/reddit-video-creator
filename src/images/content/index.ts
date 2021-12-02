import cluster from "cluster";
import { cpus } from "os";
import { join } from "path";

import { Subtitle } from "../../interface/audio";
import { Comment } from "../../interface/post";

import { spreadWork } from "../../utils/helper";

interface CommentJob extends Comment {
  commentId: number;
}

export default async (comments: Comment[][]) => {
  return new Promise((resolve) => {
    const textJobs: CommentJob[] = [];

    for (let i = 0; i < comments.length; i++) {
      const commentGroup = comments[i];

      for (let j = 0; j < commentGroup.length; j++) {
        const comment = commentGroup[j];

        for (let c = 0; c < (comment.content as Subtitle[]).length; c++) {
          textJobs.push({
            ...comment,
            content: (comment.content as Subtitle[])
              .slice(0, c + 1)
              .map((e) => e.content)
              .join(" "),
            commentId: (comment.content as Subtitle[])[c].id,
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

import cluster from "cluster";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import { tempData, renderPath } from "../../config/paths";
import { Subtitle } from "../../interface/audio";
import { Comment } from "../../interface/post";

import { spreadWork } from "../../utils/helper";

interface CommentJob extends Comment {
  commentId: number;
}

export default async (comments: Comment[][]) => {
  return new Promise(async (resolve) => {
    const textJobs: CommentJob[] = [];

    for (let i = 0; i < comments.length; i++) {
      const commentGroup = comments[i];

      for (let j = 0; j < commentGroup.length; j++) {
        const comment = commentGroup[j];

        for (let c = 0; c < (comment.content as Subtitle[]).length; c++) {
          const parentFolderPath = join(
            renderPath,
            comment.id + "",
            `${comment.id}-${(comment.content as Subtitle[])[c].id}`
          );

          mkdirSync(parentFolderPath);

          // Write text

          const illegalChars = [
            "*",
            "’",
            "”",
            "“",
            "!",
            "|",
            ".",
            ",",
            ":",
            "\n",
            "_",
          ];

          let filteredText = (comment.content as Subtitle[])[c].content;

          for (const char of illegalChars) {
            filteredText = filteredText.replaceAll(char, " ");
          }

          writeFileSync(join(parentFolderPath, "text.txt"), filteredText);

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

    const work = spreadWork(textJobs);
    let counter = work.length;

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      const jobsFilePath = join(tempData, `${index}-content.json`);

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

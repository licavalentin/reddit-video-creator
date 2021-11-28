import { execFile } from "child_process";
import { join } from "path/posix";
import { cpus } from "os";
import cluster from "cluster";
import { mkdirSync } from "fs";

import { audioRenderPath } from "../config/paths";
import { Comment } from "../interface/post";

import { getArgument, getFolders, spreadWork } from "../utils/helper";

/**
 * Get Voices List
 * @returns List of voices
 */
export const getVoices = async (): Promise<string[]> => {
  return new Promise((resolve) => {
    const balconPath = getArgument("BALCON");

    execFile(balconPath, ["-l"], (error, stdout) => {
      if (error) {
        console.log(error);

        throw error;
      }

      const listOfVoice = stdout
        .trim()
        .split("\n")
        .map((v) => v.trim())
        .filter((v) => v !== "SAPI 5:");

      resolve(listOfVoice);
    });
  });
};

export const startWorker = async () => {
  return new Promise((resolve) => {});
};

export default async (comments: Comment[]): Promise<Comment[]> => {
  return new Promise(async (resolve) => {
    const balconPath = getArgument("BALCON");

    let selectedVoice = getArgument("VOICE");

    if (!selectedVoice) {
      const voices = await getVoices();
      selectedVoice = voices[0];
    }

    mkdirSync(audioRenderPath);

    const work = spreadWork(comments, cpus().length);

    const availableWork = work.filter((e) => e.length > 0);
    let count = availableWork.length;

    for (let index = 0; index < availableWork.length; index++) {
      const jobs = work[index];

      const config = {
        balconPath,
        selectedVoice,
      };

      cluster.setupPrimary({
        exec: join(__dirname, "worker.js"),
        args: [JSON.stringify(jobs), JSON.stringify(config)],
        // args: [index + ""],
      });

      const worker = cluster.fork();

      worker.on("exit", () => {
        count--;

        if (count === 0) {
          // const newComments = getFolders(audioRenderPath).map(
          //   (folder) =>
          //     JSON.parse(
          //       readFileSync(
          //         join(audioRenderPath, folder, "comment.json")
          //       ).toString()
          //     ) as Comment
          // );

          console.log("process-audio-done");
          resolve(null);
        }
      });
    }
  });
};

import { execFile } from "child_process";
import { join } from "path/posix";
import { cpus } from "os";
import cluster from "cluster";

import { Comment } from "../interface/post";

import { getArgument, spreadWork } from "../utils/helper";

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

export default async (comments: Comment[]): Promise<null> => {
  return new Promise(async (resolve) => {
    const balconPath = getArgument("BALCON");

    let selectedVoice = getArgument("VOICE");

    if (!selectedVoice) {
      const voices = await getVoices();
      selectedVoice = voices[0];
    }

    const folders = [];
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      for (let j = 0; j < comment.content.length; j++) {
        folders.push(`${i}-${j}`);
      }
    }

    const work = spreadWork(folders, cpus().length);
    let counter = work.length;

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      const config = {
        balconPath,
        selectedVoice,
      };

      cluster.setupPrimary({
        exec: join(__dirname, "worker.js"),
        args: [JSON.stringify(jobs), JSON.stringify(config)],
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

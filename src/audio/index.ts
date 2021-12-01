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
    const newComments = [];

    for (let index = 0; index < availableWork.length; index++) {
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

      worker.on("message", (message) => {
        newComments.push(message);
      });

      worker.on("exit", () => {
        if (newComments.length === comments.length) {
          resolve(newComments);
        }
      });
    }
  });
};

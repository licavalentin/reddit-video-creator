import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import { audio } from "../config/audio";
import { Comment } from "../interface/post";

import { deleteFolder } from "../utils/render";

import { generateAudioFile } from "./lib";

type CreateAudio = (args: { comments: Comment[][]; tmpDir: string }) => void;

export const createAudio: CreateAudio = ({ comments, tmpDir }) => {
  const audioPath = join(__dirname, "..", "..", "public", "audio");
  deleteFolder(audioPath);
  mkdirSync(audioPath);

  for (let i = 0; i < comments.length; i++) {
    const commentsList = comments[i];

    for (let j = 0; j < commentsList.length; j++) {
      const comment = commentsList[j];

      for (let k = 0; k < (comment.body as string[]).length; k++) {
        const textFilePath = join(tmpDir, `${[i, j, k].join("-")}.txt`);

        writeFileSync(textFilePath, comment.body[k]);

        generateAudioFile({
          outputPath: join(audioPath, `${[i, j, k].join("-")}.mp3`),
          textFilePath,
        });
      }
    }
  }
};

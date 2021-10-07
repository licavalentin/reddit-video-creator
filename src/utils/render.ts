import cluster from "cluster";
import { cpus } from "os";
import { join } from "path";
import { mkdirSync } from "fs";

import { tempPath } from "../config/paths";
import { Comment } from "../interface/video";

import { createRandomString, getFolders } from "../utils/helper";
import generateAudio from "../audio/index";
import { generateVideo } from "../video/index";
import { createCommentImage } from "../images/image";

/**
 * Render Audio and Video
 * @param path Folder path with images
 */
export const renderVideo = (path: string) => {
  return new Promise(async (resolve) => {
    let count = cpus().length;

    if (cluster.isPrimary) {
      for (const cpu of cpus()) {
        cluster.fork();
      }

      cluster.on("exit", (worker, code, signal) => {
        count--;

        if (count === 0) {
          resolve(null);
        }
      });
    } else {
      const folders = getFolders(path);
      const leftFolders = folders.length % cpus().length;
      const folderPerCpu = Math.floor(folders.length / cpus().length);

      const index = cluster.worker.id - 1;
      const numOfFolders =
        folderPerCpu + (index === cpus().length - 1 ? leftFolders : 0);
      const startIndex = index !== 0 ? index * folderPerCpu : 0;
      const endIndex = startIndex + numOfFolders;
      const listOfFolders = folders.slice(startIndex, endIndex);

      for (const folder of listOfFolders) {
        // const folderPath = join(path, folder);
        // const imagePath = join(folderPath, "image.jpg");
        // const textPath = join(folderPath, "text.txt");
        // const audioPath = join(folderPath, "audio.wav");
        // try {
        //   const duration = await generateAudio(textPath, audioPath);
        //   await generateVideo(imagePath, audioPath, folderPath, duration);
        // } catch (error) {
        //   console.log(error);
        // }
      }

      cluster.worker.kill();
    }
  });
};

/**
 * Render Images
 * @param comments Comments List
 */
export const renderImage = (comments: Comment[][]) => {
  return new Promise(async (resolve) => {
    let count = cpus().length;
    let test = false;

    if (cluster.isPrimary) {
      for (let index = 0; index < cpus().length; index++) {
        cluster.fork();
      }

      test = true;

      cluster.on("exit", (worker, code, signal) => {
        count--;

        console.log(test);

        if (count === 0) {
          resolve(null);
        }
      });
    } else {
      // const leftComments = comments.length % cpus().length;
      // const commentsPerCpu = Math.floor(comments.length / cpus().length);

      // const index = cluster.worker.id - 1;
      // const numOfComments =
      //   commentsPerCpu + (index === cpus().length - 1 ? leftComments : 0);
      // const startIndex = index !== 0 ? index * commentsPerCpu : 0;
      // const endIndex = startIndex + numOfComments;
      // const listOfComments = comments.slice(startIndex, endIndex);

      // const folder = join(tempPath, `${index}-${createRandomString(4)}`);

      // mkdirSync(folder);

      // console.log(folder);

      // for (const comments of listOfComments) {
      //   await createCommentImage(comments, folder);
      // }

      cluster.worker.kill();
    }
  });
};

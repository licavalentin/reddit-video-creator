import {
  mkdirSync,
  existsSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
  lstatSync,
  readFileSync,
} from "fs";
import { join } from "path";

import { renderPath, imagePath } from "../config/paths";

import { Comment, PostFile } from "interface/post";
import { Arguments } from "../interface/utils";
import { Subtitle } from "interface/audio";

/**
 * Create Random String
 * @param {number} size
 * @returns
 */
export const createRandomString = (size: number) =>
  (Math.random() + 1).toString(36).substring(size || 7);

/**
 * List all files and folders inside folder
 * @param path Folder path
 * @returns List of files and folders inside folder
 */
export const getFolders = (path: string | null): string[] => {
  const files: string[] = readdirSync(path) ?? [];

  const filesList: string[] = [];

  for (const file of files) {
    const index = parseInt(file.split("-")[0], 10);
    filesList[index] = file;
  }

  return filesList.filter((item) => !item.includes(".json"));
};

/**
 * Roundup number to 1k, 1M ...
 * @param number Number to Roundup
 * @returns Rounded number
 */
export const roundUp = (number: number): string => {
  const newStr = ("" + number)
    .split("")
    .reverse()
    .join("")
    .match(/.{1,3}/g) as string[];

  return `${newStr[newStr.length - 1].split("").reverse().join("")}${
    " kmgtpe"[newStr.length - 1]
  }`;
};

/**
 * Delete Folder with its contents
 * @param path Folder path
 */
export const deleteFolder = (path: string) => {
  if (existsSync(path)) {
    readdirSync(path).forEach((file: string) => {
      const curPath = join(path, file);
      if (lstatSync(curPath).isDirectory()) {
        deleteFolder(curPath);
      } else {
        unlinkSync(curPath);
      }
    });
    rmdirSync(path);
  }
};

/**
 * Reset Temp folder for new process
 */
export const resetTemp = async () => {
  deleteFolder(renderPath);
  mkdirSync(renderPath);
};

/**
 * Get Argument value
 */
export const getArgument = (key: Arguments) => {
  let value: string | null = null;

  const args = process.argv
    .filter((arg) => arg.split("=").length > 1)
    .map((arg) => arg.split("="));

  for (const argument of args) {
    if (argument[0] === key) {
      value = argument[1];
      break;
    }
  }

  return value;
};

/**
 * Get Aspect Ratio for images
 */
export const getAspectRatio = async (width: number, height: number) => {
  return height == 0 ? width : getAspectRatio(height, width % height);
};

/**
 * Convert sentence to time
 * @param sentence Sentence to convert number
 */
export const countWords = (sentence: string): number => {
  const words = sentence.split(" ");
  return parseFloat((words.length / 170).toFixed(1).replace(".0", ""));
};

/**
 * Slugify post title to file
 * @param title File title
 * @param short If its
 * @returns File title
 */
export const slugify = (title: string, short?: boolean) => {
  const illegalLetter = ["\\", "/", ":", "*", "?", '"', "<", ">", "|"];

  for (const letter of illegalLetter) {
    title = title.split(letter).join("");
  }

  return `${title} reddit askreddit storytime ${short ? "#short" : ""}`;
};

/**
 * Parse Subtitle Time Format 00:00:00,1
 * @param time Time
 * @returns {number} Duration in seconds
 */
const parseTime = (time: string): number => {
  const timer = time.split(":");
  let timeCount = 0;

  for (let i = 0; i < timer.length; i++) {
    const time = timer[i];

    switch (i) {
      case 0:
        timeCount += Number(time) * 3600; // Hours
        break;

      case 1:
        timeCount += Number(time) * 60; // Minutes
        break;

      case 2:
        timeCount += parseFloat(time.replace(",", ".")); // Seconds
        break;
    }
  }

  return timeCount;
};

/**
 * Convert Subtitle into Array
 * @param subtitlePath Subtitle Path
 * @returns
 */
export const getSubtitles = (subtitlePath: string) => {
  const subtitle = readFileSync(subtitlePath).toString();

  const arr = subtitle
    .trim()
    .split("\r\n")
    .filter((e) => e !== "");

  const finalArr: Subtitle[] = [];

  for (let i = 0; i < arr.length; ) {
    const time = arr[i + 1].split("-->").map((e) => e.trim());

    finalArr.push({
      duration: Number((parseTime(time[1]) - parseTime(time[0])).toFixed(2)),
      content: arr[i + 2],
    });

    i = i + 3;
  }

  return finalArr;
};

/**
 * Get Post data
 */
export const getPost = () => {
  const { post, comments, exportPath }: PostFile = JSON.parse(
    readFileSync(getArgument("POST")).toString()
  );

  return {
    post,
    comments: comments.map((e, index) => ({ ...e, id: index })),
    exportPath,
  };
};

/**
 * Split Comment by Depth
 */
export const splitByDepth = (commentsList: Comment[]) => {
  const comments: Comment[][] = [];
  const commentGroup: Comment[] = [];

  for (const comment of commentsList) {
    if (comment.depth === 0 && commentGroup.length !== 0) {
      comments.push(commentGroup);
    }

    commentGroup.push(comment);
  }

  if (commentGroup.length > 0) {
    comments.push(commentGroup);
  }

  return comments;
};

/**
 * Generate random avatar
 */
export const generateRandomAvatar = (): {
  head: string;
  face: string;
  body: string;
} => {
  const randomPicker = (length: number) => {
    return Math.floor(Math.random() * length);
  };

  const avatarAssets = join(imagePath, "reddit-avatar");

  const heads = getFolders(join(avatarAssets, "head"));
  const faces = getFolders(join(avatarAssets, "face"));
  const bodies = getFolders(join(avatarAssets, "body"));

  return {
    head: heads[randomPicker(heads.length)],
    face: faces[randomPicker(faces.length)],
    body: bodies[randomPicker(bodies.length)],
  };
};

/**
 * Spread work count for each cluster
 * @param work Array of any items
 * @param jobCount Job spread count
 */
export const spreadWork = <T extends unknown>(
  work: T[],
  jobCount: number
): T[][] => {
  const workPerCpu = Math.floor(work.length / jobCount);
  let leftWork = work.length % jobCount;
  const workSpreed: T[][] = [];
  let counter = 0;

  for (let i = 0; i < jobCount; i++) {
    const increment = i < leftWork ? workPerCpu + 1 : workPerCpu;
    workSpreed[i] = work.slice(counter, counter + increment);
    counter += increment;
  }

  return workSpreed;
};

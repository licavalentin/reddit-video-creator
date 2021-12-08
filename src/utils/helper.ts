import { cpus } from "os";
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

import { renderPath } from "../config/paths";
import { Comment, PostFile } from "interface/post";
import { Arguments } from "../interface/utils";
import { Subtitle } from "../interface/audio";

/**
 * Create Random String
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
 */
export const countWords = (sentence: string): number => {
  const words = sentence.split(" ");
  return parseFloat((words.length / 170).toFixed(1).replace(".0", ""));
};

/**
 * Slugify post title to file
 */
export const slugify = (title: string) => {
  const illegalLetter = [
    "\\",
    "/",
    ":",
    "*",
    "?",
    '"',
    "<",
    ">",
    "|",
    ".",
    ",",
  ];

  for (const letter of illegalLetter) {
    title = title.split(letter).join("");
  }

  return title;
};

/**
 * Parse Subtitle Time Format 00:01:00,1 into seconds
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
 * Get Subtitle duration
 */
export const getDuration = (subtitlePath: string) => {
  const subtitle = readFileSync(subtitlePath).toString();

  const arr = subtitle
    .trim()
    .split("\r\n")
    .filter((e) => e !== "");

  const time = arr[arr.length - 2].split("-->").map((e) => e.trim());

  return parseTime(time[1]);
};

/**
 * Convert Subtitle into Array
 */
export const getSubtitles = (subtitlePath: string) => {
  const subtitle = readFileSync(subtitlePath).toString();

  const arr = subtitle
    .trim()
    .split("\r\n")
    .filter((e) => e !== "");

  const finalArr: Subtitle[] = [];

  for (let i = 0; i < arr.length; ) {
    finalArr.push({
      content: arr[i + 2].trim(),
    });

    i = i + 3;
  }

  return finalArr.map((e, index) => ({ ...e, id: index }));
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
  let commentGroup: Comment[] = [];

  for (const comment of commentsList) {
    if (comment.depth === 0 && commentGroup.length !== 0) {
      comments.push(commentGroup);
      commentGroup = [];
    }

    commentGroup.push(comment);
  }

  if (commentGroup.length > 0) {
    comments.push(commentGroup);
  }

  return comments;
};

/**
 * Spread work count for each cluster
 * @param work Array of any items
 */
export const spreadWork = <T extends unknown>(work: T[]): T[][] => {
  const cpuCount = cpus().length;
  const workPerCpu = Math.floor(work.length / cpuCount);
  let leftWork = work.length % cpuCount;
  const workSpreed: T[][] = [];
  let counter = 0;

  for (let i = 0; i < cpuCount; i++) {
    const increment = i < leftWork ? workPerCpu + 1 : workPerCpu;
    workSpreed[i] = work.slice(counter, counter + increment);
    counter += increment;
  }

  return workSpreed;
};

import cluster from "cluster";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";

import Jimp from "jimp";

import { imagePath, renderPath } from "../config/paths";
import { imageDetails } from "../config/image";
import { Comment } from "../interface/post";
import { Subtitle } from "../interface/audio";

import {
  createRandomString,
  getFolders,
  getPost,
  slugify,
  splitByDepth,
  spreadWork,
} from "../utils/helper";
import { createPostTitle } from "../images/postTitle";
import { generateThumbnail } from "../images/thumbnail";
import { generateVideo, mergeVideos } from "./lib";

const generateCommentTextVideo = async (comments: Comment[]) => {
  return new Promise((resolve) => {
    const folders = [];
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      for (let j = 0; j < comment.content.length; j++) {
        folders.push(`${i}-${j}`);
      }
    }

    const work = spreadWork(folders);
    let counter = work.length;

    for (const jobs of work) {
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

const mergeCommentGroup = async (comments: Comment[]) => {
  return new Promise((resolve) => {
    const work = spreadWork(
      splitByDepth(comments).map((e) => e.map((c) => c.id))
    );

    let counter = work.length;

    mkdirSync(join(renderPath, "render-groups"));

    for (const jobs of work) {
      cluster.setupPrimary({
        exec: join(__dirname, "mergeWorker.js"),
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

const createChannelPoster = async () => {
  const image = new Jimp(
    imageDetails.width,
    imageDetails.height,
    imageDetails.background
  );

  const channelPoster = await Jimp.read(
    join(imagePath, "mid-video-poster.png")
  );

  channelPoster.scaleToFit(imageDetails.width, imageDetails.height);

  image.composite(channelPoster, 0, 0);

  const posterPath = join(renderPath, "mid-video-poster.png");

  await image.writeAsync(posterPath);

  generateVideo({
    duration: 1,
    image: posterPath,
    exportPath: renderPath,
    title: "mid-video",
  });
};

const mergeFinalVideo = async (exportPath: string) => {
  const parentPath = join(renderPath, "render-groups");

  await createPostTitle();

  const videos = getFolders(parentPath)
    .filter((f) => existsSync(join(parentPath, f, "video.mp4")))
    .map(
      (t) =>
        `file '${join(parentPath, t, "video.mp4")}'\nfile '${join(
          renderPath,
          "mid-video.mp4"
        )}'`
    );

  const listPath = join(parentPath, "list.txt");

  writeFileSync(
    listPath,
    [
      `file '${join(renderPath, "post-title", "video.mp4")}'\nfile '${join(
        renderPath,
        "mid-video.mp4"
      )}'`,
      ...videos,
    ].join("\n")
  );

  const { post } = getPost();

  const postTitle = post.title
    .toLocaleLowerCase()
    .split(" ")
    .join("-")
    .split("")
    .filter((_, index) => index < 10)
    .join("");

  const videoExportPath = join(
    exportPath,
    `${postTitle}-${createRandomString(3)}`
  );

  mkdirSync(videoExportPath);

  writeFileSync(join(videoExportPath, "data.txt"), post.title);

  await generateThumbnail(videoExportPath);

  const cleanTitle = slugify(post.title);

  mergeVideos({
    listPath,
    exportPath: videoExportPath,
    title: cleanTitle,
  });

  console.log(`process-done=${join(videoExportPath, cleanTitle)}.mp4`);
};

const mergeCommentVideo = async (comments: Comment[]) => {
  return new Promise((resolve) => {
    const folders = comments.map((e, i) =>
      (e.content as Subtitle[]).map((s, j) => `${i}-${j}`)
    );

    const work = spreadWork(folders);
    let counter = work.length;

    for (const jobs of work) {
      cluster.setupPrimary({
        exec: join(__dirname, "mergeCommentWorker.js"),
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

export default async (comments: Comment[], exportPath: string) => {
  // Generate video for each comment
  await generateCommentTextVideo(comments);

  // Merge comment videos
  await mergeCommentVideo(comments);

  // Merge Comments by depth in groups
  await mergeCommentGroup(comments);

  // Generate Channel Mid video Poster
  await createChannelPoster();

  // Merge Final Video
  await mergeFinalVideo(exportPath);
};

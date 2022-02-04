import cluster from "cluster";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";

import Jimp from "jimp";

import {
  assetsPath,
  imagePath,
  renderPath,
  tempData,
  tempPath,
} from "../config/paths";
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
import { createOutro } from "../images/outro";
import { generateThumbnail } from "../images/thumbnail";
import { generateVideo, mergeVideos } from "./lib";
import { addBackgroundMusic } from "../audio/lib";

const generateCommentTextVideo = async (comments: Comment[]) => {
  return new Promise((resolve) => {
    const {
      cli: { ffmpeg, ffprobe },
      audioTrimDuration,
    } = getPost();

    const folders = [];
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      for (let j = 0; j < comment.content.length; j++) {
        folders.push(`${i}-${j}`);
      }
    }

    const work = spreadWork(folders);
    let counter = work.length;

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      const jobsFilePath = join(
        tempPath,
        "data",
        `${index}-generateCommentTextVideo.json`
      );

      writeFileSync(
        jobsFilePath,
        JSON.stringify({
          jobs,
          ffmpeg,
          ffprobe,
          audioTrimDuration,
        })
      );

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

const mergeCommentGroup = async (comments: Comment[]) => {
  return new Promise((resolve) => {
    const {
      cli: { ffmpeg },
    } = getPost();

    const work = spreadWork(
      splitByDepth(comments).map((e) => e.map((c) => c.id))
    );

    let counter = work.length;

    mkdirSync(join(renderPath, "render-groups"));

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      const jobsFilePath = join(
        tempPath,
        "data",
        `${index}-mergeCommentGroup.json`
      );

      writeFileSync(
        jobsFilePath,
        JSON.stringify({
          jobs,
          ffmpeg,
        })
      );

      cluster.setupPrimary({
        exec: join(__dirname, "mergeWorker.js"),
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

const createChannelPoster = async () => {
  const {
    poster,
    cli: { ffmpeg },
  } = getPost();

  const image = new Jimp(
    imageDetails.width,
    imageDetails.height,
    imageDetails.background
  );

  const channelPoster = await Jimp.read(
    poster ?? join(imagePath, "mid-video.png")
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
    ffmpeg,
  });
};

const mergeFinalVideo = async () => {
  const {
    exportPath,
    post,
    cli: { ffmpeg, ffprobe },
  } = getPost();

  const parentPath = join(renderPath, "render-groups");

  await createPostTitle();

  await createOutro();

  const videos = [
    `file '${join(renderPath, "post-title", "video.mp4")}'`,
    ...getFolders(parentPath)
      .filter((f) => existsSync(join(parentPath, f, "video.mp4")))
      .map((t) => `file '${join(parentPath, t, "video.mp4")}'`),
  ].join(`\nfile '${join(renderPath, "mid-video.mp4")}'\n`);

  const listPath = join(parentPath, "list.txt");

  writeFileSync(
    listPath,
    [videos, `\nfile '${join(renderPath, "outro", "video.mp4")}'`].join("\n")
  );

  // const postTitle = post.title
  //   .toLocaleLowerCase()
  //   .split(" ")
  //   .join("-")
  //   .split("")
  //   .filter((_, index) => index < 10)
  //   .join("");

  const videoExportPath = join(exportPath, createRandomString(3));

  mkdirSync(videoExportPath);

  mergeVideos({
    listPath,
    exportPath: tempData,
    ffmpeg,
  });

  addBackgroundMusic({
    videoPath: join(tempData, "video.mp4"),
    audioPath: join(tempPath, "music", "music.mp3"),
    outputPath: videoExportPath,
    ffmpeg,
    ffprobe,
  });

  writeFileSync(join(videoExportPath, "data.txt"), post.title);

  await generateThumbnail(videoExportPath);

  console.log(`process-done=${join(videoExportPath, "video.mp4")}`);
};

const mergeCommentVideo = async (comments: Comment[]) => {
  return new Promise((resolve) => {
    const {
      cli: { ffmpeg },
    } = getPost();

    const folders = comments.map((e, i) =>
      (e.content as Subtitle[]).map((s, j) => `${i}-${j}`)
    );

    const work = spreadWork(folders);
    let counter = work.length;

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      const jobsFilePath = join(
        tempPath,
        "data",
        `${index}-mergeCommentVideo.json`
      );

      writeFileSync(
        jobsFilePath,
        JSON.stringify({
          jobs,
          ffmpeg,
        })
      );

      cluster.setupPrimary({
        exec: join(__dirname, "mergeCommentWorker.js"),
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

export default async (comments: Comment[]) => {
  // Generate video for each comment
  await generateCommentTextVideo(comments);

  // Merge comment videos
  await mergeCommentVideo(comments);

  // Merge Comments by depth in groups
  await mergeCommentGroup(comments);

  // Generate Channel Mid video Poster
  await createChannelPoster();

  // Merge Final Video
  await mergeFinalVideo();
};

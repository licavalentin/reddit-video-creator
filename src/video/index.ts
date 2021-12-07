import cluster from "cluster";
import { cpus } from "os";
import { execFile } from "child_process";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";

import Jimp from "jimp";

import {
  createRandomString,
  getFolders,
  getPost,
  slugify,
  splitByDepth,
  spreadWork,
} from "../utils/helper";
import { Comment } from "../interface/post";
import { imagePath, renderPath } from "../config/paths";
import { Subtitle } from "../interface/audio";
import { imageDetails } from "../config/image";
import { createPostTitle } from "../images/postTitle";
import { generateThumbnail } from "../images/thumbnail";

export const AddBackgroundMusic = async (
  videoPath: string,
  audioPath: string,
  outputPath: string
) => {
  return new Promise((resolve) => {
    execFile(
      "ffmpeg",
      [
        "-i",
        videoPath,
        "-filter_complex",
        `"amovie=${audioPath}:loop=0,asetpts=N/SR/TB[aud];[0:a][aud]amix[a]"`,
        "-map",
        "0:v",
        "-map",
        "'[a]'",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "256k",
        "-shortest",
        outputPath,
      ],
      (error: any) => {
        if (error) {
          console.log(error);

          // console.log("Video couldn't create successfully", "error");
          throw error;
        }

        // console.log("Video created successfully", "success");
        console.log("process-video-done");

        resolve(null);
      }
    );
  });
};

/**
 * Merge All Videos together
 * @param title Post title
 * @param inputPath Input Path
 * @param exportPath Path to export final output
 */
export const mergeVideos = async (
  title: string,
  inputPath: string,
  exportPath: string
) => {
  const folders = getFolders(inputPath);

  const outPutFilePath = join(exportPath, `${title}.mp4`);

  const listPath = join(inputPath, "list.txt");

  // if (folders.length > 1) {

  // }

  const videos = folders
    .filter((folder) => existsSync(join(inputPath, folder, "video.mp4")))
    .map((folder) => `file '${join(inputPath, folder, "video.mp4")}`);

  writeFileSync(listPath, videos.join(" \n"));

  const merge = () =>
    new Promise((resolve, reject) => {
      execFile(
        "ffmpeg",
        [
          "-safe",
          "0",
          "-f",
          "concat",
          "-i",
          listPath,
          "-c",
          "copy",
          outPutFilePath,
        ],
        (error) => {
          if (error) {
            console.log(error);

            reject(error);
          }

          resolve(null);
        }
      );
    });

  try {
    await merge();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const generateCommentTextVideo = async (comments: Comment[]) => {
  return new Promise((resolve) => {
    const folders = [];
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      for (let j = 0; j < comment.content.length; j++) {
        folders.push(`${i}-${j}`);
      }
    }

    const work = spreadWork(folders, cpus().length);
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

export const mergeCommentGroup = async (comments: Comment[]) => {
  return new Promise((resolve) => {
    const work = spreadWork(
      splitByDepth(comments).map((e) => e.map((c) => c.id)),
      cpus().length
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

  image.writeAsync(posterPath);

  const generateVideo = ({ image, exportPath }) => {
    return new Promise((resolve) => {
      execFile(
        "ffmpeg",
        [
          "-loop",
          "1",
          "-framerate",
          "5",
          "-i",
          image,
          "-f",
          "lavfi",
          "-i",
          "anullsrc=channel_layout=stereo:sample_rate=44100",
          "-c:v",
          "libx264",
          "-t",
          "1",
          "-pix_fmt",
          "yuv420p",
          "-vf",
          `scale=${imageDetails.width}:${imageDetails.height}`,
          join(exportPath, `mid-video.mp4`),
        ],
        (err) => {
          if (err) {
            console.log(err);
          }

          resolve(null);
        }
      );
    });
  };

  await generateVideo({ image: posterPath, exportPath: renderPath });
};

export const mergeFinalVideo = async (exportPath: string) => {
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

  return new Promise((resolve) => {
    execFile(
      "ffmpeg",
      [
        "-safe",
        "0",
        "-f",
        "concat",
        "-i",
        listPath,
        "-c",
        "copy",
        join(
          videoExportPath,
          `${slugify(post.title)} reddit askreddit story.mp4`
        ),
      ],
      async (error) => {
        if (error) {
          console.log(error);
        }

        resolve(null);
      }
    );
  });
};

const mergeCommentVideo = async (comments: Comment[]) => {
  return new Promise((resolve) => {
    const folders = comments.map((e, i) =>
      (e.content as Subtitle[]).map((s, j) => `${i}-${j}`)
    );

    const work = spreadWork(folders, cpus().length);
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

  // const parentPath = join(renderPath, "render-groups");

  // await AddBackgroundMusic(
  //   join(parentPath, "video.mp4"),
  //   join(assetsPath, "music", "piano.mp3"),
  //   join(exportPath, "final.mp4")
  // );
};

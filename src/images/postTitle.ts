import { join } from "path";
import { writeFileSync, existsSync, mkdirSync, readFileSync } from "fs";
import { execFile } from "child_process";

import Jimp from "jimp";

import { dataPath, fontPath, assetsPath, renderPath } from "../config/paths";
import { commentDetails, imageDetails } from "../config/image";
import { FontFace } from "../interface/image";

import { generateVoting } from "./voting";
import { getArgument, getDuration, getPost, roundUp } from "../utils/helper";
import { getVoices } from "../audio/index";

const generateVideo = () => {
  const exportPath = join(renderPath, "post-title");

  const duration = getDuration(join(exportPath, "subtitle.srt"));

  return new Promise((resolve) => {
    execFile(
      "ffmpeg",
      [
        "-loop",
        "1",
        "-framerate",
        "5",
        "-i",
        join(exportPath, "image.png"),
        "-i",
        join(exportPath, "audio.wav"),
        "-c:v",
        "libx264",
        "-tune",
        "stillimage",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-pix_fmt",
        "yuv420p",
        "-shortest",
        "-t",
        duration.toString(),
        join(exportPath, `video.mp4`),
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

/**
 * Generate Audio from text
 *
 * @param {string} textPath Text Path
 * @param {string} exportPath Export path for the wav file
 */
const generateAudioFile = ({
  textFilePath,
  exportPath,
}: {
  textFilePath: string;
  exportPath: string;
}) => {
  return new Promise(async (resolve) => {
    const balconPath = getArgument("BALCON");

    let selectedVoice = getArgument("VOICE");

    if (!selectedVoice) {
      const voices = await getVoices();
      selectedVoice = voices[0];
    }

    execFile(
      balconPath,
      [
        "-f",
        textFilePath,
        "-w",
        `${join(exportPath, "audio.wav")}`,
        "-n",
        selectedVoice,
        "--encoding",
        "utf8",
        "-fr",
        "48",
        "--silence-end",
        "200",
        "--lrc-length",
        "100",
        "--srt-length",
        "100",
        "-srt",
        "--srt-enc",
        "utf8",
        "--srt-fname",
        `${join(exportPath, "subtitle.srt")}`,
        "--ignore-url",
      ],
      (error: Error) => {
        if (error) {
          console.log(error);
        }

        console.log("audio-generated");
        resolve(null);
      }
    );
  });
};

/**
 * Create Video for Reddit post title
 *
 * @param post Post details
 * @param {string} post.title Post title
 * @param {string} post.userName Post Author username
 * @param {number} post.points Post points
 * @param {Array} post.awards Array with paths to award image
 * @returns
 */
export const createPostTitle = async () => {
  const {
    post: { title, author: userName, score: points, all_awardings },
  } = getPost();

  const awards = all_awardings.map((e) => e.name);

  try {
    const image = new Jimp(
      imageDetails.width,
      imageDetails.height,
      imageDetails.background
    );

    const voting = await generateVoting(80, roundUp(points));

    const font = await Jimp.loadFont(
      join(fontPath, "title", FontFace.PostTitle)
    );

    const maxWidth = imageDetails.width - commentDetails.widthMargin;
    const titleHeight = Jimp.measureTextHeight(font, title, maxWidth);

    // Print post title
    image.print(
      font,
      (imageDetails.width - maxWidth) / 2 + 50,
      (imageDetails.height - titleHeight) / 2,
      title,
      maxWidth
    );

    // Print post username
    const userNameText = `Posted by ${userName}`;
    const smallFont = await Jimp.loadFont(
      join(fontPath, "comments", FontFace.Username)
    );
    const usernameWidth = Jimp.measureText(smallFont, userNameText);
    const usernameHeight = Jimp.measureTextHeight(
      smallFont,
      userNameText,
      usernameWidth + 10
    );

    image.print(
      smallFont,
      (imageDetails.width - maxWidth) / 2 + 50,
      (imageDetails.height - titleHeight) / 2 - 50,
      userNameText,
      maxWidth
    );

    // Add post award images
    const awardsPath = join(assetsPath, "images", "reddit-awards");
    const awardsList = JSON.parse(
      readFileSync(join(dataPath, "reddit-awards.json")).toString()
    ) as {
      title: string;
      path: string;
    }[];
    const filteredAwards = awards.filter((_, index) => index < 7);

    for (let i = 0; i < filteredAwards.length; i++) {
      const award = filteredAwards[i];
      let awardImagePath: string | null = null;

      for (const item of awardsList) {
        if (item.title === award) {
          awardImagePath = item.path;
          break;
        }
      }

      if (!awardImagePath) {
        break;
      }

      if (!existsSync(join(awardsPath, awardImagePath))) {
        continue;
      }

      const awardImage: Jimp | null = await Jimp.read(
        join(awardsPath, awardImagePath)
      );

      awardImage.resize(Jimp.AUTO, usernameHeight + 20);

      image.composite(
        awardImage,
        (imageDetails.width - maxWidth) / 2 + 70 + usernameWidth + i * 45,
        (imageDetails.height - titleHeight) / 2 - 55 + 5
      );
    }

    // Add voting image
    image.composite(
      voting,
      (imageDetails.width - maxWidth) / 2 - 50,
      (imageDetails.height - titleHeight) / 2 + titleHeight / 2 - 80 * 2 + 50
    );

    // Read text
    const folderPath = join(renderPath, "post-title");

    mkdirSync(folderPath);

    const textPath = join(folderPath, "text.txt");

    // Write image
    await image.writeAsync(join(folderPath, "image.png"));

    writeFileSync(textPath, title);

    await generateAudioFile({
      textFilePath: textPath,
      exportPath: folderPath,
    });

    await generateVideo();
  } catch (err) {
    console.log(err);
  }
};

import { join } from "path";
import { writeFileSync, existsSync, mkdirSync, readFileSync } from "fs";

import Jimp from "jimp";
import profanity from "profanity-util";

import { dataPath, fontPath, assetsPath, renderPath } from "../config/paths";
import { commentDetails, imageDetails } from "../config/image";
import { FontFace } from "../interface/image";

import { generateVoting } from "./voting";
import { generateAudioFile, getVoice } from "../audio/lib";
import { generateVideo } from "../video/lib";
import { getDuration, getPost, roundUp } from "../utils/helper";

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
    cli: { ffmpeg, ffprobe, balcon, bal4web },
    customAudio,
    audioTrimDuration,
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
      (imageDetails.height - titleHeight) / 2 - 10,
      profanity.purify(title)[0],
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
    const imagePath = join(folderPath, "image.png");

    // Write image
    await image.writeAsync(imagePath);

    writeFileSync(
      textPath,
      (profanity.purify(title)[0] as string).replaceAll(".", " ")
    );

    generateAudioFile({
      textFilePath: textPath,
      exportPath: folderPath,
      voice: getVoice(),
      balcon,
      bal4web,
      customAudio,
    });

    const exportPath = join(renderPath, "post-title");
    const audioPath = join(folderPath, "audio.wav");

    const duration = getDuration({
      ffprobe,
      audioTrimDuration,
      audioPath,
    });

    generateVideo({
      duration,
      image: imagePath,
      exportPath,
      audio: audioPath,
      ffmpeg,
    });
  } catch (err) {
    // console.log(err);
  }
};

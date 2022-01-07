import { join } from "path";

import Jimp from "jimp";
import { decode } from "html-entities";
import profanity from "profanity-util";

import { fontPath, renderPath } from "../config/paths";
import { imageDetails, commentDetails } from "../config/image";
import { FontFace } from "../interface/image";
import { getPost } from "../utils/helper";
import { mkdirSync } from "fs";

/**
 * Generate array of sentences from comment
 * @param {string} text Comment text
 */
const splitText = (text: string): string[] => {
  // Decode html code to text
  const words = decode(
    text
      // Remove emoji
      .replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
        ""
      )
      // Remove \n etc
      // .replace(/\r?\n|\r/g, " ")
      // Remove url
      .replace(/(?:https?|ftp):\/\/[\n\S]+/g, "")
  )
    .split(" ")
    .filter((text) => text.trim() !== "");

  if (words.length === 1) {
    return words;
  }

  const sentences: string[] = [];
  let sentence: string[] = [];

  for (const word of words) {
    sentence.push(word);

    const chars = [",", ".", "!", "?"];

    const mergedText = sentence.join(" ");

    if (
      (chars.some((char) => word.includes(char)) && mergedText.length > 50) ||
      mergedText.length > 90
    ) {
      sentences.push(mergedText);
      sentence = [];
    }
  }

  if (sentence.length !== 0) {
    sentences.push(sentence.join(" "));
  }

  return sentences.map((c) => c.trim());
};

/**
 * Get Width, Height and Indentation for each comment
 * @returns Comments with width, height and indentation for each comment
 */
export const measureContent = async () => {
  const { comments } = getPost();

  try {
    const parentPath = join(fontPath, "comments");
    const font = await Jimp.loadFont(join(parentPath, FontFace.Comment));
    const fontBold = await Jimp.loadFont(join(parentPath, FontFace.Username));

    const userNameText = `/y/Name`;
    const userNameHeight = Jimp.measureTextHeight(
      fontBold,
      userNameText,
      Jimp.measureText(fontBold, userNameText)
    );

    let totalProcesses = 0;

    const newComments = comments.map((comment, commentIndex) => {
      mkdirSync(join(renderPath, commentIndex + ""));

      const commentWidth =
        imageDetails.width -
        commentDetails.widthMargin -
        comment.depth * commentDetails.depth;

      const filteredText = profanity.purify(comment.content as string)[0];
      const splittedText = splitText(filteredText);

      totalProcesses += splittedText.length;

      const sentences = filteredText.split("\n");
      let commentHeight: number = userNameHeight + commentDetails.margin;

      if (sentences.length > 1) {
        const textWidth = Jimp.measureText(font, splittedText.join(" ")) + 300;
        const textHeight = Jimp.measureTextHeight(
          font,
          splittedText.join(" "),
          textWidth
        );

        for (const sentence of sentences) {
          commentHeight +=
            sentence === ""
              ? textHeight
              : Jimp.measureTextHeight(font, sentence, commentWidth);
        }
      } else {
        commentHeight += Jimp.measureTextHeight(
          font,
          splittedText.join(" "),
          commentWidth
        );
      }

      return {
        ...comment,
        content: splittedText.map((text, index) => ({
          content: text.trim(),
          id: index,
        })),
        width: commentWidth,
        height: commentHeight,
      };
    });

    console.log(
      `process-count=${totalProcesses * 4 + comments.length * 2 + 1}`
    );

    return newComments;
  } catch (error) {
    throw error;
  }
};

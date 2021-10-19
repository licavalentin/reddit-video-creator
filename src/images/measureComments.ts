import { join } from "path";

import Jimp from "jimp";
import { decode } from "html-entities";

import { fontPath } from "../config/paths";
import { imageDetails, commentDetails } from "../config/image";
import { FontFace } from "../interface/image";
import { Comment } from "../interface/video";

/**
 * Generate array of sentences from comment
 * @param {string} text Comment text
 */
const splitText = (text: string): string[] => {
  const words = decode(
    text
      // Remove emoji
      .replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
        ""
      )
      // Remove \n etc
      .replace(/\r?\n|\r/g, " ")
      // Remove url
      .replace(/(?:https?|ftp):\/\/[\n\S]+/g, "")
  )
    .split(" ")
    .filter((text) => text.trim() !== "");

  if (words.length === 1) {
    return words;
  }

  const sentences: string[] = [];

  let sentence: string = "";
  for (const word of words) {
    sentence += `${word} `;

    const chars = [",", ".", "!", "?"];

    if (chars.some((char) => word.includes(char)) || sentence.length > 90) {
      sentences.push(sentence.trim());
      sentence = "";
    }
  }

  if (sentence !== "") {
    sentences.push(sentence.trim());
  }

  return sentences;
};

/**
 * Get Width, Height and Indentation for each comment
 * @param comments Comments List
 * @returns Comments with width, height and indentation for each comment
 */
export const measureComments = async (comments: Comment[]) => {
  try {
    const font = await Jimp.loadFont(join(fontPath, FontFace.Medium));

    return comments
      .map((comment) => {
        const commentWidth =
          imageDetails.width -
          commentDetails.widthMargin -
          comment.indentation * commentDetails.indentation;

        const splittedComment = splitText(comment.text as string);

        const commentHeight = Jimp.measureTextHeight(
          font,
          splittedComment.join(" "),
          commentWidth
        );

        return {
          ...comment,
          text: splittedComment,
          width: commentWidth,
          height: commentHeight,
        };
      })
      .filter((c) => c.text.length !== 0);
  } catch (error) {
    throw error;
  }
};

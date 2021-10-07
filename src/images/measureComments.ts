import { join } from "path";

import Jimp from "jimp";

import { imageDetails, commentDetails } from "../config/image";
import { FontFace } from "../interface/image";
import { Comment } from "../interface/video";
import { getArgument } from "../utils/helper";

/**
 * Generate array of sentences from comment
 * @param {string} text Comment text
 */
const splitText = (text: string): string[] => {
  const words = text.split(" ");

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
    sentences.push(sentence);
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
    const assetsPath = getArgument("ASSETS");
    const fontPath = join(assetsPath, "font");

    const font = await Jimp.loadFont(join(fontPath, FontFace.Medium));

    return comments.map((comment) => {
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
    });
  } catch (error) {
    throw error;
  }
};

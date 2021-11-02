import { join } from "path";

import Jimp from "jimp";

import { fontPath } from "../config/paths";
import { imageDetails, commentDetails } from "../config/image";
import { FontFace } from "../interface/image";
import { Comment } from "../interface/video";

/**
 * Fit comments to screen size
 * @param comments List of comments
 * @returns New list of comments
 */
export const transformComments = async (comments: Comment[]) => {
  // Load font
  const font = await Jimp.loadFont(join(fontPath, FontFace.Medium));
  const fontLight = await Jimp.loadFont(join(fontPath, FontFace.Light));

  const userNameText = `/y/Name`;
  const userNameHeight = Jimp.measureTextHeight(
    fontLight,
    userNameText,
    Jimp.measureText(fontLight, userNameText)
  );

  let maxHeight = imageDetails.height - commentDetails.heightMargin;
  const finalComments: Comment[][] = [];
  let commentsTree: Comment[] = [];

  const splitComments = (comment: Comment) => {
    for (let i = 0; i < (comment.text as string[]).length; i++) {
      const sentence = (comment.text as string[]).slice(0, i + 1);

      const sentenceHeight =
        Jimp.measureTextHeight(
          font,
          sentence.join(" "),
          comment.width as number
        ) +
        commentDetails.margin +
        userNameHeight;

      if (maxHeight - sentenceHeight > 0) {
        continue;
      }

      const addedText = (comment.text as string[]).slice(0, i);

      const addedSentenceHeight =
        Jimp.measureTextHeight(
          font,
          addedText.join(" "),
          comment.width as number
        ) +
        userNameHeight +
        commentDetails.margin;

      const addedComment = {
        ...comment,
        text: addedText,
        height: addedSentenceHeight,
      };

      finalComments.push([...commentsTree, addedComment]);
      commentsTree = [];
      maxHeight = imageDetails.height - commentDetails.heightMargin;

      const leftText = (comment.text as string[]).slice(i);
      const leftSentenceHeight =
        Jimp.measureTextHeight(
          font,
          leftText.join(" "),
          comment.width as number
        ) +
        commentDetails.margin +
        userNameHeight;

      const leftComment = {
        ...comment,
        text: leftText,
        height: leftSentenceHeight,
      };

      if (maxHeight - leftSentenceHeight < 0) {
        splitComments(leftComment);
      } else {
        commentsTree.push(leftComment);
        maxHeight -= leftSentenceHeight;
      }

      break;
    }
  };

  for (const comment of comments) {
    if (comment.indentation === 0) {
      if (commentsTree.length !== 0) {
        finalComments.push(commentsTree);
      }

      commentsTree = [];
      maxHeight = imageDetails.height - commentDetails.heightMargin;
    }

    const currentHeight = maxHeight - (comment.height as number);

    if (currentHeight > 0) {
      commentsTree.push(comment);
      maxHeight = currentHeight;
      continue;
    }

    if (currentHeight === 0) {
      maxHeight = imageDetails.height - commentDetails.heightMargin;
      finalComments.push([...commentsTree, comment]);
      commentsTree = [];
      continue;
    }

    if (currentHeight < 0) {
      splitComments(comment);
    }
  }

  if (commentsTree.length > 0) {
    finalComments.push(commentsTree);
  }

  return finalComments;
};

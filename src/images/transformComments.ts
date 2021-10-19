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
        ) + commentDetails.margin;

      if (maxHeight - sentenceHeight > 0) {
        continue;
      }

      const addedText = (comment.text as string[]).slice(0, i);

      const addedSentenceHeight = Jimp.measureTextHeight(
        font,
        addedText.join(" "),
        comment.width as number
      );

      const addedComment = {
        ...comment,
        text: addedText,
        height: addedSentenceHeight,
      };

      // if (addedComment.text.length !== 0) {
      // }

      finalComments.push([...commentsTree, addedComment]);
      commentsTree = [];
      maxHeight = imageDetails.height - commentDetails.heightMargin;

      const leftText = (comment.text as string[]).slice(i);

      const leftSentenceHeight = Jimp.measureTextHeight(
        font,
        leftText.join(" "),
        comment.width as number
      );

      const leftComment = {
        ...comment,
        text: leftText,
        height: leftSentenceHeight,
      };

      const leftCommentHeight = leftSentenceHeight + commentDetails.margin;

      if (maxHeight - leftCommentHeight < 0) {
        splitComments(leftComment);
      } else {
        commentsTree.push(leftComment);
        maxHeight -= leftCommentHeight;
        break;
      }
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

    const currentHeight =
      maxHeight - (comment.height as number) - commentDetails.margin;

    if (currentHeight > 0) {
      commentsTree.push(comment);
      maxHeight = currentHeight;
      continue;
    }

    if (currentHeight === 0) {
      commentsTree.push(comment);
      finalComments.push(commentsTree);
      maxHeight = imageDetails.height - commentDetails.heightMargin;
      commentsTree = [];

      continue;
    }

    if (currentHeight < 0) {
      splitComments(comment);

      // if (commentsTree.length > 0) {
      //   finalComments.push(commentsTree);
      // }
    }
  }

  if (commentsTree.length > 0) {
    finalComments.push(commentsTree);
  }

  return finalComments;
};

import { join } from "path";

import Jimp from "jimp";

import { fontPath } from "../config/paths";
import { imageDetails, commentDetails } from "../config/image";
import { FontFace } from "../interface/image";
import { Comment } from "../interface/post";
import { Subtitle } from "../interface/audio";

/**
 * Fit comments to screen size
 * @param comments List of comments
 * @returns New list of comments
 */
export const transformComments = async (comments: Comment[]) => {
  // Load font
  const parentPath = join(fontPath, "comments");
  const font = await Jimp.loadFont(join(parentPath, FontFace.Comment));
  const fontBold = await Jimp.loadFont(join(parentPath, FontFace.Username));

  const userNameText = `/y/Name`;
  const userNameHeight = Jimp.measureTextHeight(
    fontBold,
    userNameText,
    Jimp.measureText(fontBold, userNameText)
  );

  let maxHeight = imageDetails.height - commentDetails.heightMargin;
  const finalComments: Comment[][] = [];
  let commentsTree: Comment[] = [];

  const commentStartHeight = commentDetails.margin + userNameHeight;

  const splitComments = (comment: Comment) => {
    const commentText = (comment.content as Subtitle[]).map((e) => e.content);

    for (let i = 0; i < commentText.length; i++) {
      const sentence = commentText.slice(0, i + 1);

      let sentenceHeight = commentStartHeight;

      sentence
        .join(" ")
        .split("\n")
        .forEach(
          (text) =>
            (sentenceHeight += Jimp.measureTextHeight(
              font,
              text,
              comment.width as number
            ))
        );

      if (maxHeight - sentenceHeight > 0) {
        continue;
      }

      const addedText = commentText.slice(0, i);

      let addedSentenceHeight = commentStartHeight;

      addedText
        .join(" ")
        .split("\n")
        .forEach(
          (text) =>
            (addedSentenceHeight += Jimp.measureTextHeight(
              font,
              text,
              comment.width as number
            ))
        );

      const addedComment = {
        ...comment,
        content: comment.content.slice(0, i),
        height: addedSentenceHeight,
      };

      finalComments.push([...commentsTree, addedComment]);
      commentsTree = [];
      maxHeight = imageDetails.height - commentDetails.heightMargin;

      const leftText = commentText.slice(i);
      let leftSentenceHeight = commentStartHeight;
      leftText
        .join(" ")
        .split("\n")
        .forEach(
          (text) =>
            (leftSentenceHeight += Jimp.measureTextHeight(
              font,
              text,
              comment.width as number
            ))
        );

      const leftComment = {
        ...comment,
        content: comment.content.slice(i),
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
    if (comment.depth === 0) {
      if (commentsTree.length > 0) {
        finalComments.push(commentsTree);
      }

      commentsTree = [];
      maxHeight = imageDetails.height - commentDetails.heightMargin;
    }

    const currentHeight = maxHeight - (comment.height as number);

    if (currentHeight > 0) {
      commentsTree.push(comment);
      maxHeight = currentHeight;
    } else {
      splitComments(comment);
    }
  }

  if (commentsTree.length > 0) {
    finalComments.push(commentsTree);
  }

  return finalComments;
};

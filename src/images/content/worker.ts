import { join } from "path";

import Jimp from "jimp";

import {
  assetsPath,
  renderPath,
  fontPath,
  imagePath,
} from "../../config/paths";
import { commentDetails, imageDetails } from "../../config/image";
import { FontFace } from "../../interface/image";
import { Comment } from "../../interface/post";

import { roundUp } from "../../utils/helper";

interface CommentJob extends Comment {
  commentId: number;
}

const init = async () => {
  const args = process.argv.slice(2);
  const work = JSON.parse(args[0]) as CommentJob[];

  // Load font
  const parentPath = join(fontPath, "comments");
  const font = await Jimp.loadFont(join(parentPath, FontFace.Comment));
  const fontBold = await Jimp.loadFont(join(parentPath, FontFace.Username));
  const statsFont = await Jimp.loadFont(join(parentPath, FontFace.Stats));
  const depthLine = await Jimp.read(join(imagePath, "comment-line.png"));
  const upsArrow = await Jimp.read(join(assetsPath, "images", "ups-arrow.png"));

  const topMargin = 50;

  for (let index = 0; index < work.length; index++) {
    const job = work[index];

    const image = new Jimp(
      imageDetails.width,
      job.height,
      imageDetails.background
    );

    const startX =
      (job.depth as number) * commentDetails.depth +
      commentDetails.widthMargin / 2;

    // Print username
    const userNameHeight = Jimp.measureTextHeight(
      fontBold,
      job.user,
      Jimp.measureText(fontBold, job.user)
    );
    const userNameWidth = Jimp.measureText(fontBold, job.user);
    image.print(fontBold, startX, topMargin, job.user);

    // Write UpArrow
    upsArrow.resize(Jimp.AUTO, userNameHeight + 4);
    const upsArrowWidth = upsArrow.getWidth();
    image.composite(
      upsArrow,
      startX + userNameWidth + 25,
      topMargin + userNameHeight / 2 - 3
    );

    // Print Comment Score
    const commentScore = roundUp(job.score);
    image.print(
      statsFont,
      startX + userNameWidth + 20 + upsArrowWidth + 10,
      topMargin,
      commentScore
    );

    // Composite avatar image
    const avatarImage = await Jimp.read(
      join(renderPath, job.id + "", "avatar.png")
    );

    // Print comment content
    const contentHeight = Jimp.measureTextHeight(font, job.content, job.width);
    image.print(
      font,
      startX,
      commentDetails.margin + userNameHeight,
      job.content,
      job.width
    );

    // Composite indentation line
    depthLine.resize(4, contentHeight);
    image.composite(depthLine, startX - 38, avatarImage.getHeight() - 10);

    image.composite(avatarImage, startX - commentDetails.avatarSize, 0);

    for (let i = 1; i < job.depth + 1; i++) {
      depthLine.resize(
        4,
        contentHeight + commentDetails.margin + userNameHeight + 3
      );

      image.composite(depthLine, i * commentDetails.depth + 62, 0);
    }

    const parentFolderPath = join(
      renderPath,
      job.id + "",
      `${job.id}-${job.commentId}`
    );

    // Write comment to temp
    await image.writeAsync(join(parentFolderPath, "image.png"));

    console.log("content-generated");
  }

  // Kill Worker
  process.exit();
};

init();

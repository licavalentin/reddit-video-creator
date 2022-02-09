import { join } from "path";
import { readFileSync } from "fs";

import Jimp from "jimp";

import { assetsPath, renderPath, fontPath } from "../../config/paths";
import { commentDetails, imageDetails } from "../../config/image";
import { FontFace } from "../../interface/image";
import { Comment } from "../../interface/post";

import { roundUp } from "../../utils/helper";

interface CommentJob extends Comment {
  commentId: number;
}

const init = async () => {
  const args = process.argv.slice(2);
  const work = JSON.parse(readFileSync(args[0]).toString()) as CommentJob[];

  // Load font
  const parentPath = join(fontPath, "comments");
  const font = await Jimp.loadFont(join(parentPath, FontFace.Comment));
  const fontBold = await Jimp.loadFont(join(parentPath, FontFace.Username));
  const statsFont = await Jimp.loadFont(join(parentPath, FontFace.Stats));
  const upsArrow = await Jimp.read(join(assetsPath, "images", "ups-arrow.png"));

  upsArrow.color([{ apply: "xor", params: [commentDetails.colors.main] }]);

  const topMargin = 50;

  for (let index = 0; index < work.length; index++) {
    try {
      const job = work[index];

      const image = new Jimp(
        imageDetails.width,
        job.height,
        imageDetails.background
      );

      let startX =
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
        startX + userNameWidth + upsArrowWidth + 35,
        topMargin,
        commentScore
      );

      // Composite avatar image
      const avatarImage = await Jimp.read(
        join(renderPath, job.id + "", "avatar.png")
      );

      image.composite(avatarImage, startX - commentDetails.avatarSize, 0);

      // Print comment content
      const contentHeight: number = Jimp.measureTextHeight(
        font,
        (job.content as string).trim(),
        job.width
      );

      image.print(
        font,
        startX,
        commentDetails.margin + userNameHeight,
        job.content,
        job.width
      );

      // Composite indentation main line
      const depthLine = new Jimp(
        5,
        job.height,
        commentDetails.colors.secondary
      );

      image.composite(depthLine, startX - 38, avatarImage.getHeight());

      const mainDepthLine = new Jimp(
        5,
        contentHeight - 15,
        commentDetails.colors.main
      );

      image.composite(mainDepthLine, startX - 38, avatarImage.getHeight());

      // const playCircleWidth = 4 * 3 + 2;
      // const playCircle = new Jimp(
      //   playCircleWidth,
      //   playCircleWidth,
      //   commentDetails.colors.main
      // );

      // playCircle.circle();

      // image.composite(
      //   playCircle,
      //   startX - 38 - 5,
      //   avatarImage.getHeight() + contentHeight - 15 - playCircle.getHeight()
      // );

      for (let i = 1; i < job.depth + 1; i++) {
        const depthLineDepth = new Jimp(
          5,
          job.height,
          commentDetails.colors.main
        );

        image.composite(depthLineDepth, i * commentDetails.depth + 62, 0);
      }

      const parentFolderPath = join(
        renderPath,
        job.id + "",
        `${job.id}-${job.commentId}`
      );

      // Write comment to temp
      await image.writeAsync(join(parentFolderPath, "image.png"));

      console.log("content-generated");
    } catch (error) {
      // console.log(error);
    }
  }

  // Kill Worker
  process.exit();
};

init();

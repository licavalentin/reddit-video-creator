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
  const indentationLine = await Jimp.read(join(imagePath, "comment-line.png"));

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
    image.print(fontBold, startX, commentDetails.margin - 10, job.user);

    // Write UpArrow
    const upsArrow = await Jimp.read(
      join(assetsPath, "images", "ups-arrow.png")
    );
    upsArrow.resize(Jimp.AUTO, userNameHeight - 10);
    const upsArrowWidth = upsArrow.getWidth();
    image.composite(
      upsArrow,
      startX + userNameWidth + 20,
      commentDetails.margin - 5
    );

    // Print Comment Score
    const commentScore = roundUp(job.score);
    const scoreWidth = Jimp.measureText(font, commentScore);
    image.print(
      font,
      startX + userNameWidth + 20 + upsArrowWidth + 10,
      commentDetails.margin - 10,
      commentScore
    );

    // Write Clock
    const clock = await Jimp.read(join(assetsPath, "images", "clock.png"));
    clock.resize(Jimp.AUTO, userNameHeight - 10);
    const clockWidth = clock.getWidth();
    image.composite(
      clock,
      startX + userNameWidth + 20 + upsArrowWidth + 10 + scoreWidth + 20,
      commentDetails.margin - 5
    );
    image.print(
      font,
      startX +
        userNameWidth +
        20 +
        upsArrowWidth +
        10 +
        scoreWidth +
        20 +
        clockWidth +
        10,
      commentDetails.margin - 10,
      new Date(job.date * 1000).toLocaleDateString("en-US")
    );

    // Composite avatar image
    const avatarImage = await Jimp.read(
      join(renderPath, job.id + "", "avatar.png")
    );
    image.composite(avatarImage, startX - commentDetails.avatarSize - 10, 0);

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
    indentationLine.resize(8, contentHeight - 23);
    image.composite(indentationLine, startX - 50, avatarImage.getHeight());

    // Write comment to temp
    await image.writeAsync(
      join(renderPath, job.id + "", `${job.id}-${job.commentId}.png`)
    );

    console.log("image-content-generated");
  }

  // Kill Worker
  process.exit();
};

init();

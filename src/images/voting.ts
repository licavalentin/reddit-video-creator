import { join } from "path";

import Jimp from "jimp";

import { commentDetails } from "../config/image";
import { imagePath, fontPath } from "../config/paths";
import { FontFace } from "../interface/image";

/**
 * Generate voting image
 *
 * @param {number} width Voting Width
 * @param {string} voteCount Voting count
 */
export const generateVoting = async (
  width: number,
  voteCount: string | undefined
) => {
  const arrowImage = await Jimp.read(join(imagePath, "ups-arrow.png"));
  const arrowSize = width - 30;
  const arrow = arrowImage.resize(arrowSize, arrowSize);

  const imageHeight = arrowSize * 2 + (voteCount ? 70 : 30);

  const image = new Jimp(width, imageHeight);

  const font = await Jimp.loadFont(
    join(fontPath, "comments", FontFace.Username)
  );

  if (voteCount) {
    const textWidth = Jimp.measureText(font, voteCount);
    const textHeight = Jimp.measureTextHeight(font, voteCount, width);

    image.print(
      font,
      (width - textWidth) / 2,
      imageHeight / 2 - textHeight,
      voteCount
    );
  }

  const downArrow = arrow.clone().rotate(180);
  downArrow.color([{ apply: "xor", params: ["#ffffff"] }]);

  arrow.color([{ apply: "xor", params: [commentDetails.colors.main] }]);

  image.composite(arrow, (width - arrowSize) / 2, 0);

  image.composite(downArrow, (width - arrowSize) / 2, imageHeight - arrowSize);

  return image;
};

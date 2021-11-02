import { join } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";

import Jimp from "jimp";

import { fontPath, assetsPath, dataPath } from "../config/paths";
import { imageDetails, thumbnailDetail } from "../config/image";
import { Crop, FontFace } from "../interface/image";

export const generateThumbnail = async (
  post: {
    title: string;
    subreddit: string;
    awards: string[];
  },
  bgImage: string,
  cropDetails: Crop,
  exportPath: string
) => {
  try {
    // Create new instance of an image
    const image = new Jimp(
      imageDetails.width,
      imageDetails.height,
      imageDetails.background
    );

    // Composite background image
    const backgroundImage = await Jimp.read(bgImage);
    backgroundImage
      .crop(cropDetails.x, cropDetails.y, cropDetails.width, cropDetails.height)
      .scaleToFit(imageDetails.width, imageDetails.height);
    image.composite(
      backgroundImage,
      imageDetails.width - backgroundImage.getWidth(),
      0
    );

    // Composite background Shadow
    const backgroundShadow = await Jimp.read(
      join(assetsPath, "images", "thumbnail-shadow.png")
    );
    backgroundShadow.scaleToFit(imageDetails.width, imageDetails.height);
    image.composite(backgroundShadow, 0, 0);

    // Print post subreddit name
    const subredditText = `/r/${post.subreddit}`;
    const subredditFont = await Jimp.loadFont(
      join(fontPath, FontFace.ThumbnailSubreddit)
    );
    const textWith = Jimp.measureText(subredditFont, subredditText);
    const textHeight = Jimp.measureTextHeight(
      subredditFont,
      subredditText,
      textWith
    );
    image.print(
      subredditFont,
      thumbnailDetail.widthMargin,
      thumbnailDetail.heightMargin,
      subredditText
    );

    // Add post award images
    const awardsPath = join(assetsPath, "images", "reddit-awards");
    const awardsList = JSON.parse(
      readFileSync(join(dataPath, "reddit-awards.json")).toString()
    ) as {
      title: string;
      path: string;
    }[];
    const filteredAwards = post.awards.filter((_, index) => index < 3);

    for (let i = 0; i < filteredAwards.length; i++) {
      const award = filteredAwards[i];
      let awardImagePath: string | null = null;

      for (const item of awardsList) {
        if (item.title === award) {
          awardImagePath = item.path;
          break;
        }
      }

      if (!awardImagePath) {
        break;
      }

      if (!existsSync(join(awardsPath, awardImagePath))) {
        continue;
      }

      const awardImage: Jimp | null = await Jimp.read(
        join(awardsPath, awardImagePath)
      );

      awardImage.resize(textHeight, textHeight);

      image.composite(
        awardImage,
        textWith + thumbnailDetail.widthMargin + 50 + i * textHeight + i * 20,
        thumbnailDetail.heightMargin
      );
    }

    // Print post title
    const maxHeight =
      imageDetails.height - textHeight - thumbnailDetail.heightMargin - 50;
    const maxWidth = imageDetails.width - imageDetails.width / 3;

    let selectedFont = null;
    let greenText = null;
    const fonts = ["120", "130", "140", "150", "160", "170", "180", "190"];

    for (const font of fonts) {
      const titleFont = await Jimp.loadFont(
        join(fontPath, FontFace.ThumbnailTitle.replace(".", `-${font}.`))
      );

      const titleHeight = Jimp.measureTextHeight(
        titleFont,
        post.title,
        maxWidth
      );

      if (maxHeight > titleHeight) {
        selectedFont = titleFont;
        greenText = await Jimp.loadFont(
          join(
            fontPath,
            FontFace.ThumbnailTitle.replace(".", `-${font}-green.`)
          )
        );
      } else {
        break;
      }
    }

    const splitText = post.title.split(" ");
    let currentX = thumbnailDetail.widthMargin;
    let currentY =
      thumbnailDetail.heightMargin + textHeight + thumbnailDetail.titleMargin;
    let isGreen: boolean = false;

    for (const text of splitText) {
      const currentTextWidth = Jimp.measureText(selectedFont, text);
      const currentTextHeight = Jimp.measureTextHeight(
        selectedFont,
        text,
        currentTextWidth + 10
      );

      if (currentX + currentTextWidth > maxWidth) {
        isGreen = !isGreen;
        currentX = thumbnailDetail.widthMargin;
        currentY += currentTextHeight;
      }

      image.print(
        !isGreen ? selectedFont : greenText,
        currentX,
        currentY,
        text
      );

      currentX += currentTextWidth + 40;
    }

    // Write Image
    const imagePath = join(exportPath, `thumbnail.jpg`);
    const base64 = await image.getBase64Async(Jimp.MIME_JPEG);
    const base64Data = base64.replace(/^data:image\/jpeg;base64,/, "");
    writeFileSync(imagePath, base64Data, "base64");
  } catch (error) {
    console.log(error);
  }
};

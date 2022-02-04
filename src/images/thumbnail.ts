import { join } from "path";
import { readdirSync } from "fs";

import Jimp from "jimp";
import profanity from "profanity-util";

import { fontPath, assetsPath } from "../config/paths";
import { thumbnailDetail } from "../config/image";
import { getPost, slugify } from "../utils/helper";

export const generateThumbnail = async (exportPath: string) => {
  const { post, colors } = getPost();

  try {
    const postTitle = profanity.purify(post.title.toUpperCase())[0];

    // Create new instance of an image
    const image = new Jimp(thumbnailDetail.width, thumbnailDetail.height);

    // Composite background image
    // const backgroundImage = await Jimp.read(background);
    // backgroundImage
    //   .crop(crop.x, crop.y, crop.width, crop.height)
    //   .scaleToFit(imageDetails.width, imageDetails.height);
    // image.composite(
    //   backgroundImage,
    //   imageDetails.width - backgroundImage.getWidth(),
    //   0
    // );

    // Composite background Shadow
    const backgroundShadow = await Jimp.read(
      join(assetsPath, "images", "thumbnail-shadow.png")
    );
    image.composite(backgroundShadow, 0, 0);

    // Select Font
    const fonts = readdirSync(join(fontPath, "thumbnail")).filter((e) =>
      e.endsWith(".fnt")
    );

    const maxTextHeight = thumbnailDetail.height - 10;
    const maxTextWidth = thumbnailDetail.width / 2;
    let selectedFont = null;
    let titleHeight = 0;

    for (const font of fonts) {
      const titleFont = await Jimp.loadFont(join(fontPath, "thumbnail", font));

      const textHeight = Jimp.measureTextHeight(
        titleFont,
        postTitle,
        maxTextWidth
      );

      if (textHeight < maxTextHeight && textHeight > titleHeight) {
        selectedFont = titleFont;
        titleHeight = textHeight;
      }
    }

    const textWidth = Jimp.measureText(selectedFont, postTitle);
    const textHeight = Jimp.measureTextHeight(
      selectedFont,
      postTitle,
      textWidth + 100
    );

    const separatedText: { text: string; width: number }[][] = [];
    let currentText: { text: string; width: number }[] = [];
    let availableSpace = maxTextWidth;

    for (let i = 0; i < postTitle.split(" ").length; i++) {
      const text = postTitle.split(" ")[i].trim();

      const textWidth = Jimp.measureText(selectedFont, `${text} `);

      if (availableSpace - textWidth > 0) {
        currentText.push({ text, width: textWidth });
        availableSpace -= textWidth;
      } else {
        separatedText.push(currentText);
        currentText = [{ text, width: textWidth }];
        availableSpace = maxTextWidth - textWidth;
      }
    }

    separatedText.push(currentText);

    const lines = separatedText.map((items) => {
      let totalWidth = 0;

      for (const item of items) {
        totalWidth += item.width;
      }

      return totalWidth;
    });

    const lineBarImage = new Jimp(
      thumbnailDetail.width,
      textHeight - 10,
      colors.background
    );

    const textImage = new Jimp(thumbnailDetail.width, thumbnailDetail.height);

    for (let i = 0; i < lines.length; i++) {
      const width = lines[i];

      image.composite(
        lineBarImage,
        -(thumbnailDetail.width - width - 20),
        thumbnailDetail.height / 2 - titleHeight / 2 + textHeight * i + 10
      );

      const text = separatedText[i].map((e) => e.text).join(" ");

      textImage.print(
        selectedFont,
        20,
        thumbnailDetail.height / 2 - titleHeight / 2 + textHeight * i,
        text,
        maxTextWidth
      );
    }

    textImage.color([{ apply: "xor", params: [colors.color] }]);

    image.composite(textImage, 0, 0);

    // image.print(
    //   selectedFont,
    //   20,
    //   thumbnailDetail.height / 2 - titleHeight / 2,
    //   postTitle,
    //   maxTextWidth
    // );

    const thumbnailPath = join(exportPath, "thumbnail");

    await image.writeAsync(thumbnailPath);
  } catch (error) {
    // console.log(error);
  }
};

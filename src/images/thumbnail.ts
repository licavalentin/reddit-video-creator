import { join } from "path";
import { readdirSync } from "fs";

import Jimp from "jimp";

import { fontPath, assetsPath } from "../config/paths";
import { thumbnailDetail } from "../config/image";
import { getPost, slugify } from "../utils/helper";

export const generateThumbnail = async (exportPath: string) => {
  const { post } = getPost();

  try {
    const postTitle = post.title.toUpperCase();

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

    const maxTextHeight = thumbnailDetail.height - 20;
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

    const seperatedText: number[][] = [];
    let currentText: number[] = [];
    let availableSpace = maxTextWidth;

    for (let i = 0; i < postTitle.split(" ").length; i++) {
      const text = postTitle.split(" ")[i];

      const textWidth = Jimp.measureText(selectedFont, `${text} `);

      if (availableSpace - textWidth > 0) {
        currentText.push(textWidth);
        availableSpace -= textWidth;
      } else {
        seperatedText.push(currentText);
        currentText = [textWidth];
        availableSpace = maxTextWidth - textWidth;
      }
    }

    seperatedText.push(currentText);

    const lines = seperatedText.map((e) =>
      e.reduce((prev, curr) => (prev += curr))
    );

    const lineBarImage = new Jimp(
      thumbnailDetail.width,
      textHeight - 10,
      "#e93222"
    );

    for (let i = 0; i < lines.length; i++) {
      const width = lines[i];

      image.composite(
        lineBarImage,
        -(thumbnailDetail.width - width - 20),
        thumbnailDetail.height / 2 - titleHeight / 2 + textHeight * i + 10
      );
    }

    image.print(
      selectedFont,
      20,
      thumbnailDetail.height / 2 - titleHeight / 2,
      postTitle,
      maxTextWidth
    );

    const thumbnailPath = join(
      exportPath,
      `${slugify(post.title)} reddit askreddit storytime.png`
    );

    await image.writeAsync(thumbnailPath);
  } catch (error) {
    console.log(error);
  }
};

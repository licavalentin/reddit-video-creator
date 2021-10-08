import { join } from "path";
import { writeFileSync, mkdirSync } from "fs";

import Jimp from "jimp";

import { fontPath, imagePath } from "../config/paths";
import { imageDetails, commentDetails } from "../config/image";
import { FontFace } from "../interface/image";
import { Comment } from "../interface/video";

import { getFolders, createRandomString } from "../utils/helper";

/**
 * Generate images from comments
 * @param comments List of comments
 */
export const createCommentImage = async (
  comments: Comment[],
  inputPath: string
) => {
  try {
    // Load Font
    const font = await Jimp.loadFont(join(fontPath, FontFace.Medium));
    const fontLight = await Jimp.loadFont(join(fontPath, FontFace.Light));
    const indentationLine = await Jimp.read(
      join(imagePath, "comment-line.png")
    );

    // All comments height combined
    let totalHeight = commentDetails.margin;
    for (const comment of comments) {
      totalHeight += (comment.height as number) + commentDetails.margin;
    }

    // Create new instance of an image
    const image = new Jimp(
      imageDetails.width,
      imageDetails.height,
      imageDetails.background
    );

    // X coordinate to start writing text
    let currentHeight = (imageDetails.height - totalHeight) / 2;

    let addedText: string;

    // Write comments and create image
    const writeText = async (comment: Comment) => {
      // Text X start coordinate
      const textX =
        (comment.indentation as number) * commentDetails.indentation +
        commentDetails.widthMargin / 2;

      // Write username
      const userNameText = `/u/${comment.userName}`;
      const userNameWidth = Jimp.measureText(fontLight, userNameText);
      const userNameHeight = Jimp.measureTextHeight(
        fontLight,
        userNameText,
        userNameWidth
      );

      // Print username
      image.print(
        fontLight,
        textX,
        currentHeight - userNameHeight,
        userNameText
      );

      // Write completed comment paragraph
      if (typeof comment.text === "string") {
        // Print paragraph
        image.print(font, textX, currentHeight, comment.text, comment.width);

        // Composite indentation line
        indentationLine.resize(5, comment.height as number);
        image.composite(indentationLine, textX - 20, currentHeight);

        // Lower X by removing height of the paragraph combined with authors height
        currentHeight += (comment.height as number) + commentDetails.margin;

        // Comments writing is completed continue with the next comment in list
        return;
      }

      const writtenText = addedText ?? comment.text[0];

      image.print(
        font,
        textX,
        currentHeight,
        comment.text[0],
        comment.width as number
      );

      // Measure written text
      const textHeight = Jimp.measureTextHeight(
        font,
        comment.text[0],
        comment.width as number
      );

      // Composite indentation line
      indentationLine.resize(5, textHeight);
      image.composite(indentationLine, textX - 20, currentHeight);

      // const mergedText = comment.text.slice(0, 2).join(" ");

      const mergedText = `${comment.text[0]}${
        comment.text[1] ? ` ${comment.text[1]}` : ""
      }`;

      addedText = comment.text[1] ?? undefined;

      comment.text =
        comment.text.length > 1
          ? [mergedText, ...comment.text.slice(2)]
          : mergedText;

      // Get list of folders in temp dir
      const folders = getFolders(inputPath);

      // Generate new folder path
      const folderPath = join(
        inputPath,
        `${folders.length}-${createRandomString(4)}`
      );

      // Create path
      mkdirSync(folderPath);

      // Create text file path
      const textPath = join(folderPath, "text.txt");
      // Write text into file
      writeFileSync(textPath, writtenText);

      // Write Image
      // console.log("Creating comment image", "action");

      // Create image file path
      const imagePath = join(folderPath, `image.jpg`);

      const base64 = await image.getBase64Async(Jimp.MIME_JPEG);
      const base64Data = base64.replace(/^data:image\/jpeg;base64,/, "");
      writeFileSync(imagePath, base64Data, "base64");

      // console.log("Image created successfully", "success");

      await writeText(comment);

      console.log("process-image-done");
    };

    for (const comment of comments) {
      await writeText(comment);
    }
  } catch (err) {
    console.log(err);
  }
};

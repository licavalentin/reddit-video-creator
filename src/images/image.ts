// import { join } from "path";
// import { writeFileSync, mkdirSync } from "fs";

// import Jimp from "jimp";

// import { assetsPath, fontPath, imagePath } from "../config/paths";
// import { imageDetails, commentDetails } from "../config/image";
// import { FontFace } from "../interface/image";
// import { Comment } from "../interface/video";

// import { getFolders, createRandomString, roundUp } from "../utils/helper";
// import { generateAvatar } from "./avatar";

// /**
//  * Generate images from comments
//  * @param comments List of comments
//  */
// export const createCommentImage = async (
//   comments: Comment[],
//   inputPath: string
// ) => {
//   try {
//     // Load Font
//     const font = await Jimp.loadFont(
//       join(fontPath, "comments", FontFace.Comment)
//     );
//     const fontBold = await Jimp.loadFont(
//       join(fontPath, "comments", FontFace.Username)
//     );
//     const indentationLine = await Jimp.read(
//       join(imagePath, "comment-line.png")
//     );

//     const avatarWidth = 70;
//     const avatars: {
//       added: boolean;
//       avatar: Jimp;
//     }[] = [];

//     // All comments height combined
//     let totalHeight = 0;
//     for (const comment of comments) {
//       totalHeight += comment.height as number;

//       avatars.push({
//         added: false,
//         avatar: await generateAvatar(avatarWidth),
//       });
//     }

//     // Create new instance of an image
//     const image = new Jimp(
//       imageDetails.width,
//       imageDetails.height,
//       imageDetails.background
//     );

//     // X coordinate to start writing text
//     let currentHeight = (imageDetails.height - totalHeight) / 2 + 80;

//     let addedText: string;

//     // Write comments and create image
//     const writeText = async (comment: Comment, index) => {
//       // Text X start coordinate
//       const textX =
//         (comment.indentation as number) * commentDetails.depth +
//         commentDetails.widthMargin / 2;

//       // Composite Avatar and Write User Name
//       if (avatars[index] && !avatars[index].added) {
//         // Write username
//         const userNameWidth = Jimp.measureText(fontBold, comment.userName);
//         const userNameHeight = Jimp.measureTextHeight(
//           fontBold,
//           comment.userName,
//           userNameWidth
//         );

//         // Print username
//         image.print(
//           fontBold,
//           textX,
//           currentHeight - userNameHeight,
//           comment.userName
//         );

//         image.composite(
//           avatars[index].avatar,
//           textX - avatarWidth - 10,
//           currentHeight - userNameHeight - avatarWidth + 25
//         );

//         const upsArrow = await Jimp.read(
//           join(assetsPath, "images", "ups-arrow.png")
//         );
//         upsArrow.resize(Jimp.AUTO, userNameHeight - 5);
//         const upsArrowWidth = upsArrow.getWidth();

//         image.composite(
//           upsArrow,
//           textX + userNameWidth + 20,
//           currentHeight - userNameHeight + 3
//         );

//         const commentScore = roundUp(comment.score);
//         const scoreWidth = Jimp.measureText(font, commentScore);

//         image.print(
//           font,
//           textX + userNameWidth + 20 + upsArrowWidth + 10,
//           currentHeight - userNameHeight,
//           commentScore
//         );

//         const clock = await Jimp.read(join(assetsPath, "images", "clock.png"));
//         clock.resize(Jimp.AUTO, userNameHeight - 5);
//         const clockWidth = clock.getWidth();

//         image.composite(
//           clock,
//           textX + userNameWidth + 20 + upsArrowWidth + 10 + scoreWidth + 20,
//           currentHeight - userNameHeight + 3
//         );

//         const newClock = new Date(
//           comment.created_utc * 1000
//         ).toLocaleDateString("en-US");
//         image.print(
//           font,
//           textX +
//             userNameWidth +
//             20 +
//             upsArrowWidth +
//             10 +
//             scoreWidth +
//             20 +
//             clockWidth +
//             10,
//           currentHeight - userNameHeight,
//           newClock
//         );

//         avatars[index].added = true;
//       }

//       // Write completed comment paragraph
//       if (typeof comment.text === "string") {
//         // Print paragraph
//         image.print(font, textX, currentHeight, comment.text, comment.width);

//         // Composite indentation line
//         // indentationLine.resize(5, comment.height as number);
//         // image.composite(indentationLine, textX - 20, currentHeight);

//         // Lower X by removing height of the paragraph combined with authors height
//         currentHeight += comment.height as number;

//         // Comments writing is completed continue with the next comment in list
//         return;
//       }

//       const writtenText = addedText ?? comment.text[0];

//       image.print(
//         font,
//         textX,
//         currentHeight,
//         comment.text[0],
//         comment.width as number
//       );

//       // Measure written text
//       const textHeight = Jimp.measureTextHeight(
//         font,
//         comment.text[0],
//         comment.width as number
//       );

//       // Composite indentation line
//       indentationLine.resize(8, textHeight - 25);
//       image.composite(indentationLine, textX - 50, currentHeight + 20);

//       // const mergedText = comment.text.slice(0, 2).join(" ");

//       const mergedText = `${comment.text[0]}${
//         comment.text[1] ? ` ${comment.text[1]}` : ""
//       }`;

//       addedText = comment.text[1] ?? undefined;

//       comment.text =
//         comment.text.length > 1
//           ? [mergedText, ...comment.text.slice(2)]
//           : mergedText;

//       // Get list of folders in temp dir
//       const folders = getFolders(inputPath);

//       // Generate new folder path
//       const folderPath = join(
//         inputPath,
//         `${folders.length}-${createRandomString(4)}`
//       );

//       // Create path
//       mkdirSync(folderPath);

//       // Create text file path
//       const textPath = join(folderPath, "text.txt");
//       // Write text into file
//       writeFileSync(
//         textPath,
//         writtenText
//           // .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, "")
//           .replace(/\*/g, "")
//       );

//       // Write Image
//       // Create image file path
//       const imagePath = join(folderPath, `image.jpg`);
//       const base64 = await image.getBase64Async(Jimp.MIME_JPEG);
//       const base64Data = base64.replace(/^data:image\/jpeg;base64,/, "");
//       writeFileSync(imagePath, base64Data, "base64");

//       await writeText(comment, index);

//       console.log("process-image-done");
//     };

//     for (let index = 0; index < comments.length; index++) {
//       const comment = comments[index];

//       await writeText(comment, index);
//     }
//   } catch (err) {
//     console.log(err);
//   }
// };

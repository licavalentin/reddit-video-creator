// import { join } from "path";
// import { writeFileSync, existsSync, mkdirSync, readFileSync } from "fs";

// import Jimp from "jimp";

// import { dataPath, fontPath, assetsPath } from "../config/paths";
// import { commentDetails, imageDetails } from "../config/image";
// import { FontFace } from "../interface/image";

// import { generateVoting } from "./voting";
// import generateAudio from "../audio/index";
// import { generateVideo } from "../video/index";

// /**
//  * Create Video for Reddit post title
//  *
//  * @param post Post details
//  * @param {string} post.title Post title
//  * @param {string} post.userName Post Author username
//  * @param {number} post.points Post points
//  * @param {Array} post.awards Array with paths to award image
//  * @returns
//  */
// export const createPostTitle = async ({
//   title,
//   userName,
//   points,
//   awards,
//   exportPath,
// }: {
//   title: string;
//   userName: string;
//   points: string;
//   awards: string[];
//   exportPath: string;
// }) => {
//   try {
//     const image = new Jimp(
//       imageDetails.width,
//       imageDetails.height,
//       imageDetails.background
//     );

//     const voting = await generateVoting(80, points);

//     const font = await Jimp.loadFont(
//       join(fontPath, "title", FontFace.PostTitle)
//     );

//     const maxWidth = imageDetails.width - commentDetails.widthMargin;
//     const titleHeight = Jimp.measureTextHeight(font, title, maxWidth);

//     // Print post title
//     image.print(
//       font,
//       (imageDetails.width - maxWidth) / 2 + 50,
//       (imageDetails.height - titleHeight) / 2,
//       title,
//       maxWidth
//     );

//     // Print post username
//     const userNameText = `Posted by ${userName}`;
//     const smallFont = await Jimp.loadFont(
//       join(fontPath, "comments", FontFace.Username)
//     );
//     const usernameWidth = Jimp.measureText(smallFont, userNameText);
//     const usernameHeight = Jimp.measureTextHeight(
//       smallFont,
//       userNameText,
//       usernameWidth + 10
//     );

//     image.print(
//       smallFont,
//       (imageDetails.width - maxWidth) / 2 + 50,
//       (imageDetails.height - titleHeight) / 2 - 50,
//       userNameText,
//       maxWidth
//     );

//     // Add post award images
//     const awardsPath = join(assetsPath, "images", "reddit-awards");
//     const awardsList = JSON.parse(
//       readFileSync(join(dataPath, "reddit-awards.json")).toString()
//     ) as {
//       title: string;
//       path: string;
//     }[];
//     const filteredAwards = awards.filter((_, index) => index < 7);

//     for (let i = 0; i < filteredAwards.length; i++) {
//       const award = filteredAwards[i];
//       let awardImagePath: string | null = null;

//       for (const item of awardsList) {
//         if (item.title === award) {
//           awardImagePath = item.path;
//           break;
//         }
//       }

//       if (!awardImagePath) {
//         break;
//       }

//       if (!existsSync(join(awardsPath, awardImagePath))) {
//         continue;
//       }

//       const awardImage: Jimp | null = await Jimp.read(
//         join(awardsPath, awardImagePath)
//       );

//       awardImage.resize(Jimp.AUTO, usernameHeight);

//       image.composite(
//         awardImage,
//         (imageDetails.width - maxWidth) / 2 + 70 + usernameWidth + i * 45,
//         (imageDetails.height - titleHeight) / 2 - 50 + 5
//       );
//     }

//     // Add voting image
//     image.composite(
//       voting,
//       (imageDetails.width - maxWidth) / 2 - 50,
//       (imageDetails.height - titleHeight) / 2 + titleHeight / 2 - 80 * 2 + 50
//     );

//     // Read text
//     const folderPath = join(exportPath, "0-post-title");

//     mkdirSync(folderPath);

//     const imagePath = join(folderPath, "image.jpg");
//     const textPath = join(folderPath, "text.txt");

//     // Write image
//     // console.log("Creating post title image", "action");

//     const base64 = await image.getBase64Async(Jimp.MIME_JPEG);
//     const base64Data = base64.replace(/^data:image\/jpeg;base64,/, "");
//     writeFileSync(imagePath, base64Data, "base64");

//     // console.log("Image created successfully", "success");

//     writeFileSync(textPath, title);

//     const audioPath = join(folderPath, "audio.wav");

//     try {
//       const duration = await generateAudio(textPath, audioPath);
//       await generateVideo(imagePath, audioPath, folderPath, duration);
//     } catch (error) {
//       console.log(error);
//     }
//   } catch (err) {
//     console.log(err);
//   }
// };

export {};

// import { join } from "path";
// import { mkdirSync } from "fs";

// import { renderPath } from "../config/paths";
// import { commentDetails, imageDetails } from "../config/image";
// import { Comment } from "../interface/video";

// import { getPost } from "../utils/helper";
// import { countWords, getFolders, roundUp, slugify } from "../utils/helper";
// import { createCommentImage } from "../images/image";
// import generateAudio from "../audio";
// import { generateVideo, mergeVideos } from "../video";
// import { createPostTitle } from "./postTitle";

// type GenerateShorts = (time: number, exportPath: string) => Promise<void>;

// export const generateShorts: GenerateShorts = async (
//   time = 0.8,
//   exportPath
// ) => {
//   imageDetails.width = 1080;
//   imageDetails.height = 1920;
//   commentDetails.margin = 50;
//   commentDetails.indentation = 50;
//   commentDetails.widthMargin = 300;

//   const { comments, post } = await getPost();

//   const shortsPath = join(renderPath, "shorts");
//   mkdirSync(shortsPath);

//   let totalTime = countWords(post.title);
//   const selectedComments: Comment[][] = [];

//   for (const item of comments) {
//     const commentList: Comment[] = [];

//     commentLoop: for (const comment of item) {
//       const wordTimeCount = countWords((comment.text as string[]).join(" "));

//       if (wordTimeCount <= time - totalTime) {
//         commentList.push(comment);
//         totalTime += wordTimeCount;
//       } else {
//         break commentLoop;
//       }
//     }

//     if (commentList.length > 0) {
//       selectedComments.push(commentList);
//     }

//     if (time - totalTime <= 0) {
//       break;
//     }
//   }

//   await createPostTitle({
//     awards: post.all_awardings.map((award) => award.name),
//     points: roundUp(post.ups),
//     title: post.title,
//     userName: post.author,
//     exportPath: shortsPath,
//   });

//   for (const comments of selectedComments) {
//     await createCommentImage(comments, shortsPath);
//   }

//   const folders = getFolders(shortsPath);

//   for (const currentFolder of folders.slice(1)) {
//     const folderPath = join(shortsPath, currentFolder);
//     const imagePath = join(folderPath, "image.jpg");
//     const textPath = join(folderPath, "text.txt");
//     const audioPath = join(folderPath, "audio.mp3");
//     try {
//       const duration = await generateAudio(textPath, audioPath);

//       await generateVideo(imagePath, audioPath, folderPath, duration);
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   await mergeVideos(`${slugify(post.title)} short`, shortsPath, exportPath);
// };

export const generateShorts = async () => {};

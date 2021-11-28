// import { cpus } from "os";
// import cluster from "cluster";
// import { mkdirSync, existsSync, writeFileSync } from "fs";
// import { join } from "path";

// import { renderPath, tempPath } from "./config/paths";

// import {
//   resetTemp,
//   createRandomString,
//   getFolders,
//   roundUp,
//   slugify,
//   getPost,
// } from "./utils/helper";
// import { createPostTitle } from "./images/postTitle";
// import { createCommentImage } from "./images/image";
// import { generateVideo, mergeVideos } from "./video/index";
// import generateAudio from "./audio/index";
// import { generateThumbnail } from "./images/thumbnail";
// import { generateShorts } from "./images/shorts";

// /**
//  * Generate single comment tree images
//  * @param title Post Title
//  * @param comments Comments List
//  * @param exportPath Path to export final output
//  */
// const createPost = async () => {
//   try {
//     if (cluster.isPrimary) {
//       // Check if temp path exists
//       if (!existsSync(tempPath)) {
//         return;
//       }

//       await resetTemp();

//       for (let index = 0; index < cpus().length; index++) {
//         cluster.fork();
//       }

//       let count = cpus().length;

//       cluster.on("exit", async () => {
//         count--;

//         if (count === 0) {
//           const { post, exportPath } = await getPost();

//           await createPostTitle({
//             awards: post.all_awardings.map((award) => award.name),
//             points: roundUp(post.ups),
//             title: post.title,
//             userName: post.author,
//             exportPath: renderPath,
//           });

//           const randomString = createRandomString(3);
//           const postTitle = post.title
//             .toLocaleLowerCase()
//             .split(" ")
//             .join("-")
//             .split("")
//             .filter((_, index) => index < 10)
//             .join("");

//           const postFolder = join(exportPath, `${postTitle}-${randomString}`);

//           mkdirSync(postFolder);

//           const filePath = slugify(post.title);

//           await mergeVideos(filePath, renderPath, postFolder);

//           // await generateThumbnail(
//           //   {
//           //     title: post.title,
//           //     awards: post.all_awardings.map((award) => award.name),
//           //     subreddit: post.subreddit,
//           //   },
//           //   backgroundPath,
//           //   cropDetails,
//           //   postFolder
//           // );

//           await generateShorts(0.8, postFolder);

//           writeFileSync(join(postFolder, "data.txt"), post.title);

//           console.log(`process-done=${join(postFolder, `${filePath}.mp4`)}`);
//         }
//       });
//     } else {
//       const { comments } = getPost();

//       const leftComments = comments.length % cpus().length;
//       const commentsPerCpu = Math.floor(comments.length / cpus().length);

//       const index = cluster.worker.id - 1;
//       const numOfComments =
//         commentsPerCpu + (index === cpus().length - 1 ? leftComments : 0);
//       const startIndex = index !== 0 ? index * commentsPerCpu : 0;
//       const endIndex = startIndex + numOfComments;
//       const listOfComments = comments.slice(startIndex, endIndex);

//       if (listOfComments.length !== 0) {
//         const folder = join(
//           renderPath,
//           `${index + 1}-${createRandomString(4)}`
//         );

//         mkdirSync(folder);

//         for (const comments of listOfComments) {
//           await createCommentImage(comments, folder);
//         }

//         const folders = getFolders(folder);

//         for (const currentFolder of folders) {
//           const folderPath = join(folder, currentFolder);
//           const imagePath = join(folderPath, "image.jpg");
//           const textPath = join(folderPath, "text.txt");
//           const audioPath = join(folderPath, "audio.wav");
//           try {
//             const duration = await generateAudio(textPath, audioPath);

//             await generateVideo(imagePath, audioPath, folderPath, duration);
//           } catch (error) {
//             console.log(error);
//           }
//         }

//         await mergeVideos("video", folder, folder);

//         console.log("process-merge-done");
//       }

//       cluster.worker.kill();
//     }
//   } catch (err) {
//     console.log(err);
//   }
// };

// // createPost();

export {};

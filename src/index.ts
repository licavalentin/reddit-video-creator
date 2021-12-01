import {
  generateRandomAvatar,
  getFolders,
  getPost,
  resetTemp,
  // splitByDepth,
} from "./utils/helper";

import generateAudio from "./audio/index";
import { readFileSync, writeFileSync } from "fs";
import { audioRenderPath } from "./config/paths";
import { join } from "path";
import { setInterval } from "timers";
import { measureContent } from "./images/measureComments";
import { transformComments } from "./images/transformComments";
import generateContent from "./images/content/index";

const renderVideo = async () => {
  // Reset temp
  await resetTemp();

  // Get created post
  const post = getPost();

  // Generate random avatar for each comment
  for (const comment of post.comments) {
    comment.avatar = generateRandomAvatar();
  }

  // Generate audio file for each comment
  const newPost = await generateAudio(post.comments);

  // Measure content and split into groups
  const measureText = await measureContent(newPost.sort((a, b) => a.id - b.id));
  const transformedComments = await transformComments(measureText);

  // Generate Content images
  await generateContent(transformedComments);

  // for (const comment of post.comments) {
  //   console.log(readFileSync(comment.audio.replace("audio.wav", "text.txt")));
  // }

  // Split comments by depth
  // const comments = splitByDepth(post.comments);
};

const init = async () => {
  console.time("Render");

  await renderVideo();

  console.timeEnd("Render");
};

init();

// import { getVoices } from "./audio/index";
// import { execFile } from "child_process";
// import { mkdirSync, writeFileSync } from "fs";
// import { join } from "path";

// import { AudioFileGeneration } from "./interface/audio";

// import { getArgument, createRandomString } from "./utils/helper";

// type AudioGenerator = (args: AudioFileGeneration) => Promise<null>;

// /**
//  * Generate Audio from text
//  *
//  * @param {string} textPath Text Path
//  * @param {string} exportPath Export path for the wav file
//  */
// const generateAudioFile: AudioGenerator = ({
//   textFilePath,
//   exportPath,
//   balconPath,
//   selectedVoice,
// }) => {
//   return new Promise(async (resolve) => {
//     execFile(
//       balconPath,
//       [
//         "-f",
//         textFilePath,
//         "-w",
//         `${join(exportPath, "audio.wav")}`,
//         "-n",
//         selectedVoice,
//         "--encoding utf8",
//         "-fr",
//         "48",
//         "--ignore-url",
//         "--lrc-length",
//         "80",
//         "-srt",
//         "--srt-length",
//         "80",
//         // "--srt-enc",
//         // "utf8",
//         "--srt-fname",
//         `${join(exportPath, "subtitle.srt")}`,
//       ],
//       async (error: Error) => {
//         if (error) {
//           console.log("audio-generating-failed");

//           throw error;
//         }

//         console.log("audio-generated-successfully");
//         resolve(null);
//       }
//     );
//   });
// };

// const test = async () => {
//   const folderPath = join(__dirname, "..", "testing", createRandomString(2));

//   mkdirSync(folderPath);

//   const textPath = join(folderPath, "test.txt");
//   writeFileSync(textPath, "hello world");

//   let selectedVoice = getArgument("VOICE");

//   if (!selectedVoice) {
//     const voices = await getVoices();
//     selectedVoice = voices[0];
//   }

//   await generateAudioFile({
//     balconPath: getArgument("BALCON"),
//     textFilePath: textPath,
//     selectedVoice: selectedVoice,
//     exportPath: folderPath,
//   });
// };

// const bruh = async () => {
//   for (let i = 0; i < 10; i++) {
//     console.log(`process-start-id-${i}`);
//     await test();
//   }
// };

// bruh();

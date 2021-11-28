// import {
//   generateRandomAvatar,
//   getPost,
//   resetTemp,
//   // splitByDepth,
// } from "./utils/helper";

// import generateAudio from "./audio/index";
// import { writeFileSync } from "fs";

// const renderVideo = async () => {
//   // Reset temp
//   await resetTemp();

//   // Get created post
//   const post = getPost();

//   // Generate random avatar for each comment
//   for (const comment of post.comments) {
//     comment.avatar = generateRandomAvatar();
//   }

//   // Generate audio file for each comment
//   const newComments = await generateAudio(post.comments);

//   writeFileSync("./test.json", JSON.stringify(newComments));

//   // Split comments by depth
//   // const comments = splitByDepth(post.comments);
// };

// renderVideo();

import { getVoices } from "./audio/index";
import { execFile } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";

import { AudioFileGeneration } from "./interface/audio";

import { getArgument } from "./utils/helper";

type AudioGenerator = (args: AudioFileGeneration) => Promise<null>;

/**
 * Generate Audio from text
 *
 * @param {string} textPath Text Path
 * @param {string} exportPath Export path for the wav file
 */
const generateAudioFile: AudioGenerator = ({
  textFilePath,
  exportPath,
  balconPath,
  selectedVoice,
}) => {
  return new Promise(async (resolve) => {
    execFile(
      balconPath,
      [
        "-f",
        textFilePath,
        "-w",
        `${join(exportPath, "audio.wav")}`,
        "-n",
        selectedVoice,
        "--encoding utf8",
        "-fr",
        "48",
        "--ignore-url",
        "--lrc-length",
        "80",
        "-srt",
        "--srt-length",
        "80",
        // "--srt-enc",
        // "utf8",
        "--srt-fname",
        `${join(exportPath, "subtitle.srt")}`,
      ],
      async (error: Error) => {
        if (error) {
          console.log("audio-generating-failed");

          throw error;
        }

        console.log("audio-generated-successfully");
        resolve(null);
      }
    );
  });
};

const test = async () => {
  const folderPath = join(__dirname, "..", "testing");

  const textPath = join(folderPath, "test.txt");
  writeFileSync(textPath, "hello world");

  let selectedVoice = getArgument("VOICE");

  if (!selectedVoice) {
    const voices = await getVoices();
    selectedVoice = voices[0];
  }

  await generateAudioFile({
    balconPath: getArgument("BALCON"),
    textFilePath: textPath,
    selectedVoice: selectedVoice,
    exportPath: folderPath,
  });
};

test();

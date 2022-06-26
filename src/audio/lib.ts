import { execSync } from "child_process";

import settings from "../data/settings.json";

const voices = [
  "AriaNeural",
  "JennyNeural",
  "GuyNeural",
  "AmberNeural",
  "AshleyNeural",
  "CoraNeural",
  "ElizabethNeural",
  "MichelleNeural",
  "MonicaNeural",
  "AnaNeural",
  "BrandonNeural",
  "ChristopherNeural",
  "JacobNeural",
  "EricNeural",
];

type AudioGenerator = (args: {
  textFilePath: string;
  outputPath: string;
}) => void;

/**
 * Generate Audio from text
 */
export const generateAudioFile: AudioGenerator = ({
  textFilePath,
  outputPath,
}) => {
  const command = `${
    process.platform === "win32" ? "bal4web" : `wine ${settings.bal4web}`
  } -s m -l en-Us -iu -n ${
    settings.voice !== "" ? settings.voice : voices[0]
  } -f "${textFilePath}" -w "${outputPath}"`;

  try {
    execSync(command, {
      timeout: 3 * 60000,
      stdio: "ignore",
    });
  } catch (error) {
    // console.log(error);
  }
};

// type AddBackgroundMusic = (args: {
//   videoPath: string;
//   audioPath: string;
//   outputPath: string;
//   ffmpeg: string | null;
//   ffprobe: string | null;
// }) => void;

// export const addBackgroundMusic: AddBackgroundMusic = async ({
//   videoPath,
//   audioPath,
//   outputPath,
//   ffmpeg,
//   ffprobe,
// }) => {
//   const videoDuration = getDuratio({
//     ffprobe,
//     audioTrimDuration: 0,
//     filePath: videoPath,
//   });

//   const musicDuration = getDuration({
//     ffprobe,
//     audioTrimDuration: 0,
//     filePath: audioPath,
//   });

//   const backgroundAudioPath = join(tempData, "background-music.mp3");

//   if (videoDuration > musicDuration) {
//     const audioFiles = [];

//     for (let i = 0; i < Math.ceil(videoDuration / musicDuration); i++) {
//       audioFiles.push(`file '${audioPath}'`);
//     }

//     const audioListPath = join(tempData, "audio-list.txt");

//     writeFileSync(audioListPath, audioFiles.join("\n"));

//     mergeVideos({
//       exportPath: tempData,
//       listPath: audioListPath,
//       video: false,
//       title: "music",
//       ffmpeg,
//     });
//   }

//   const audioCommand = `${
//     ffmpeg && existsSync(ffmpeg) ? `"${ffmpeg}"` : "ffmpeg"
//   } -y -i "${
//     videoDuration > musicDuration
//       ? join(tempPath, "data", "music.mp3")
//       : audioPath
//   }" -filter:a volume=0.03 "${backgroundAudioPath}"`;

//   try {
//     execSync(audioCommand, { stdio: "pipe" });
//   } catch (error) {
//     console.log(error);
//   }

//   const exportPath = join(outputPath, "video.mp4");

//   const command = `${
//     ffmpeg && existsSync(ffmpeg) ? `"${ffmpeg}"` : "ffmpeg"
//   } -y -i "${videoPath}" -i "${backgroundAudioPath}" -filter_complex "[0:a][1:a]amerge=inputs=2[a]" -map 0:v -map [a] -c:v copy -ac 2 -t ${videoDuration} "${exportPath}"`;

//   try {
//     execSync(command, { stdio: "pipe" });
//   } catch (error) {
//     console.log(error);
//   }

//   console.log("background-audio-generated");
// };

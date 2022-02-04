import { execSync } from "child_process";
import { copyFileSync, existsSync, writeFileSync } from "fs";
import { join } from "path";

import { assetsPath, tempData } from "../config/paths";

import { mergeVideos } from "../video/lib";
import { getDuration, getPost } from "../utils/helper";

/**
 * Get Voices List
 * @returns List of voices
 */
export const getVoice = () => {
  const {
    cli: { balcon, bal4web },
    voice,
    customAudio,
  } = getPost();

  if (voice) return voice;

  if (!customAudio) {
    const voices = execSync(
      `${balcon && existsSync(balcon) ? `"${balcon}"` : "balcon"} -l`
    ).toString();

    const listOfVoice = voices
      .trim()
      .split("\n")
      .map((v) => v.trim())
      .filter((v) => v !== "SAPI 5:");

    return listOfVoice[0];
  } else {
    const voices = execSync(
      `${bal4web && existsSync(bal4web) ? `"${bal4web}"` : "bal4web"} -s m -m`
    ).toString();

    const listOfVoice = voices
      .trim()
      .split("\n")
      .map((v) => v.trim())
      .filter((v) => v !== "* Microsoft Azure *" && v.includes("en-US"))[0]
      .split(" en-US ")[1]
      .slice(1, -1)
      .split(", ");

    return listOfVoice[0];
  }
};

type AudioGenerator = (args: {
  textFilePath: string;
  exportPath: string;
  voice: string;
  balcon?: string | null;
  bal4web?: string | null;
  customAudio: boolean;
}) => void;

/**
 * Generate Audio from text
 */
export const generateAudioFile: AudioGenerator = ({
  textFilePath,
  exportPath,
  voice,
  balcon,
  bal4web,
  customAudio,
}) => {
  const outputPath = join(exportPath, "audio.mp3");

  if (!customAudio) {
    const command = `${
      balcon && existsSync(balcon) ? `"${balcon}"` : "balcon"
    } -n ${voice} -f "${textFilePath}" -w "${outputPath}"`;

    try {
      execSync(command);
    } catch (error) {
      console.log(error);
    }
  } else {
    const command = `${
      bal4web && existsSync(bal4web) ? `"${bal4web}"` : "bal4web"
    } -s Microsoft -l en-Us -n ${voice} -f "${textFilePath}" -w "${outputPath}"`;

    try {
      execSync(command);
    } catch (error) {
      console.log(error);
    }
  }

  console.log("audio-generated");
};

type AddBackgroundMusic = (args: {
  videoPath: string;
  audioPath: string;
  outputPath: string;
  ffmpeg: string | null;
  ffprobe: string | null;
}) => void;

export const addBackgroundMusic: AddBackgroundMusic = async ({
  videoPath,
  audioPath,
  outputPath,
  ffmpeg,
  ffprobe,
}) => {
  const videoDuration = getDuration({
    ffprobe,
    audioTrimDuration: 0,
    filePath: videoPath,
  });

  const musicDuration = getDuration({
    ffprobe,
    audioTrimDuration: 0,
    filePath: audioPath,
  });

  const audioOutputPath = join(tempData, "music.mp3");
  const backgroundAudioPath = join(tempData, "background-music.mp3");

  if (videoDuration > musicDuration) {
    const audioFiles = [];

    for (let i = 0; i < Math.ceil(videoDuration / musicDuration); i++) {
      audioFiles.push(`file '${audioPath}'`);
    }

    const audioListPath = join(tempData, "audio-list.txt");

    writeFileSync(audioListPath, audioFiles.join("\n"));

    mergeVideos({
      exportPath: tempData,
      listPath: audioListPath,
      video: false,
      title: "music",
      ffmpeg,
    });
  } else {
    copyFileSync(audioPath, audioOutputPath);
  }

  const audioCommand = `${
    ffmpeg && existsSync(ffmpeg) ? `"${ffmpeg}"` : "ffmpeg"
  } -y -i ${audioOutputPath} -filter:a volume=0.03 ${backgroundAudioPath}`;

  try {
    execSync(audioCommand, { stdio: "pipe" });
  } catch (error) {
    console.log(error);
  }

  const exportPath = join(outputPath, "video.mp4");

  const command = `${
    ffmpeg && existsSync(ffmpeg) ? `"${ffmpeg}"` : "ffmpeg"
  } -y -i ${videoPath} -i ${backgroundAudioPath} -filter_complex "[0:a][1:a]amerge=inputs=2[a]" -map 0:v -map [a] -c:v copy -ac 2 -shortest -t ${videoDuration} ${exportPath}`;

  try {
    execSync(command, { stdio: "pipe" });
  } catch (error) {
    console.log(error);
  }

  console.log("background-audio-generated");
};

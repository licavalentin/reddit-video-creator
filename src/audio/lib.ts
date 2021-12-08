import { execFileSync } from "child_process";
import { join } from "path";

import { AudioFileGeneration } from "../interface/audio";

import { getArgument } from "../utils/helper";

/**
 * Get Voices List
 * @returns List of voices
 */
export const getVoice = () => {
  const balcon = getArgument("BALCON") ?? "balcon";

  const selectedVoice = getArgument("VOICE");

  if (selectedVoice) {
    return selectedVoice;
  }

  const voices = execFileSync(balcon, ["-l"]).toString();

  const listOfVoice = voices
    .trim()
    .split("\n")
    .map((v) => v.trim())
    .filter((v) => v !== "SAPI 5:");

  return listOfVoice[0];
};

type AudioGenerator = (args: AudioFileGeneration) => void;

/**
 * Generate Audio from text
 */
export const generateAudioFile: AudioGenerator = ({
  textFilePath,
  exportPath,
  voice,
}) => {
  let selectedVoice = voice ?? getVoice();

  const balcon = getArgument("BALCON") ?? "balcon";

  const args = [
    "-f",
    textFilePath,
    "-w",
    `${join(exportPath, "audio.wav")}`,
    "-n",
    selectedVoice,
    "--encoding",
    "utf8",
    "-fr",
    "48",
    "--silence-end",
    "200",
    "--lrc-length",
    "100",
    "--srt-length",
    "100",
    "-srt",
    "--srt-enc",
    "utf8",
    "--srt-fname",
    `${join(exportPath, "subtitle.srt")}`,
    "--ignore-url",
  ];

  try {
    execFileSync(balcon, args);
  } catch (error) {
    // console.log(error);
  }

  console.log("audio-generated");
};

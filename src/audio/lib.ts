import { execSync } from "child_process";
import { cpus } from "os";

import { audio } from "../config/audio";

/**
 * Get Voices List
 * @returns List of voices
 */
export const getVoice = () => {
  if (!audio.custom_audio) {
    const voices = execSync(`balcon -l`).toString();

    const listOfVoice = voices
      .trim()
      .split("\n")
      .map((v) => v.trim())
      .filter((v) => v !== "SAPI 5:");

    return listOfVoice[0];
  } else {
    const voices = execSync(`bal4web -s m -m`).toString();

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
  outputPath: string;
}) => void;

/**
 * Generate Audio from text
 */
export const generateAudioFile: AudioGenerator = ({
  textFilePath,
  outputPath,
}) => {
  if (!audio.custom_audio) {
    const command = `balcon -n ${audio.voice_name} -f "${textFilePath}" -w "${outputPath}"`;

    try {
      execSync(command);
    } catch (error) {
      console.log(error);
    }
  } else {
    const command = `bal4web -s m -l en-Us -n ${audio.voice_name} -f "${textFilePath}" -w "${outputPath}"`;

    try {
      execSync(command);
    } catch (error) {
      console.log(error);
    }
  }

  // console.log("audio-generated");
};

/**
 * Spread work count for each cluster
 * @param work Array of any items
 */
export const spreadWork = <T extends unknown>(work: T[]): T[][] => {
  const cpuCount = cpus().length;
  const workPerCpu = Math.floor(work.length / cpuCount);
  let leftWork = work.length % cpuCount;
  const workSpreed: T[][] = [];
  let counter = 0;

  for (let i = 0; i < cpuCount; i++) {
    const increment = i < leftWork ? workPerCpu + 1 : workPerCpu;
    workSpreed[i] = work.slice(counter, counter + increment);
    counter += increment;
  }

  return workSpreed.filter((e) => e.length > 0);
};

import { execSync } from "child_process";

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
    const voices = execSync(
      `${
        process.platform === "win32"
          ? "bal4web"
          : "wine /home/john/Cli/bal4web.exe"
      } -s m -m`
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
  outputPath: string;
}) => void;

/**
 * Generate Audio from text
 */
export const generateAudioFile: AudioGenerator = ({
  textFilePath,
  outputPath,
}) => {
  const timeout = {
    timeout: 3 * 60000,
  };

  if (!audio.custom_audio) {
    const command = `balcon -iu -n ${audio.voice_name} -f "${textFilePath}" -w "${outputPath}"`;

    try {
      execSync(command, timeout);
    } catch (error) {
      console.log(error);
    }
  } else {
    const command = `${
      process.platform === "win32"
        ? "bal4web"
        : "wine /home/john/Cli/bal4web.exe"
    } -s m -l en-Us -iu -n ${
      audio.voice_name
    } -f "${textFilePath}" -w "${outputPath}"`;

    try {
      execSync(command, timeout);
    } catch (error) {
      console.log(error);
    }
  }

  // console.log("audio-generated");
};

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
    process.platform === "win32"
      ? "bal4web"
      : "WINEDEBUG=-all wine /home/john/Cli/bal4web.exe"
  } -s m -l en-Us -iu -n ${
    settings.voice !== "" ? settings.voice : voices[0]
  } -f "${textFilePath}" -w "${outputPath}"`;

  try {
    execSync(command, {
      timeout: 3 * 60000,
    });
  } catch (error) {
    // console.log(error);
  }
};

import { execFile } from "child_process";

import { getArgument } from "../utils/helper";

/**
 * Get Voices List
 * @returns List of voices
 */
export const getVoices = async (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const balconPath = getArgument("BALCON");

    execFile(balconPath, ["-l"], (error, stdout) => {
      if (error) {
        console.log(error);

        throw error;
      }

      const listOfVoice = stdout
        .trim()
        .split("\n")
        .map((v) => v.trim())
        .filter((v) => v !== "SAPI 5:");

      resolve(listOfVoice);
    });
  });
};

/**
 * Get Audio file duration
 * @param path Audio file path
 * @returns Duration in milliseconds
 */
const getAudioDuration = async (path: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const ffprobePath = getArgument("FFPROBE");

    // const ffmpegPath = getArgument("FFMPEG");

    // ffmpeg -i file.mp4 2>&1 | grep Duration | sed 's/Duration: \(.*\), start/\1/g'
    // return stdout.trim().split("Duration: ").join("").split(",")[0];

    // const test = ["-i", path, "2>&1", "|", "grep", "Duration"];

    const params = [
      "-v",
      "error",
      "-select_streams",
      "a:0",
      "-show_format",
      "-show_streams",
    ];

    execFile(
      ffprobePath,
      [...params, path],
      async (error: any, stdout: any) => {
        if (error) {
          console.log(error);
          throw error;
        }

        const matched = stdout.match(/duration="?(\d*\.\d*)"?/);

        if (matched && matched[1]) {
          resolve(parseFloat(matched[1]));
        } else {
          resolve(0.1);
        }
      }
    );
  });
};

/**
 * Generate Audio from text
 *
 * @param {string} textPath Text Path
 * @param {string} path Export path for the wav file
 */

const generateAudio = (textPath: string, path: string): Promise<number> => {
  return new Promise(async (resolve) => {
    const balconPath = getArgument("BALCON");

    let selectedVoice = getArgument("VOICE");

    if (!selectedVoice) {
      const voices = await getVoices();
      selectedVoice = voices[0];
    }

    execFile(
      balconPath,
      ["-f", textPath, "-w", path, "-n", selectedVoice],
      async (error: any, stdout: any) => {
        // if (error) {
        //   console.log(error);
        //   // throw error;
        // }

        const duration = await getAudioDuration(path);

        console.log("process-audio-done");

        resolve(duration);
      }
    );
  });
};

export default generateAudio;

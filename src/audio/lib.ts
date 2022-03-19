// import { execSync } from "child_process";
// import { existsSync } from "fs";
// import { join } from "path";

// import { getPost } from "../utils/helper";

// /**
//  * Get Voices List
//  * @returns List of voices
//  */
// export const getVoice = () => {
//   const {
//     cli: { balcon, bal4web },
//     voice,
//     customAudio,
//   } = getPost();

//   if (voice) return voice;

//   if (!customAudio) {
//     const voices = execSync(
//       `${balcon && existsSync(balcon) ? `"${balcon}"` : "balcon"} -l`
//     ).toString();

//     const listOfVoice = voices
//       .trim()
//       .split("\n")
//       .map((v) => v.trim())
//       .filter((v) => v !== "SAPI 5:");

//     return listOfVoice[0];
//   } else {
//     const voices = execSync(
//       `${bal4web && existsSync(bal4web) ? `"${bal4web}"` : "bal4web"} -s m -m`
//     ).toString();

//     const listOfVoice = voices
//       .trim()
//       .split("\n")
//       .map((v) => v.trim())
//       .filter((v) => v !== "* Microsoft Azure *" && v.includes("en-US"))[0]
//       .split(" en-US ")[1]
//       .slice(1, -1)
//       .split(", ");

//     return listOfVoice[0];
//   }
// };

// type AudioGenerator = (args: {
//   textFilePath: string;
//   exportPath: string;
//   voice: string;
//   balcon?: string | null;
//   bal4web?: string | null;
//   customAudio: boolean;
// }) => void;

// /**
//  * Generate Audio from text
//  */
// export const generateAudioFile: AudioGenerator = ({
//   textFilePath,
//   exportPath,
//   voice,
//   balcon,
//   bal4web,
//   customAudio,
// }) => {
//   const outputPath = join(exportPath, "audio.mp3");

//   if (!customAudio) {
//     const command = `${
//       balcon && existsSync(balcon) ? `"${balcon}"` : "balcon"
//     } -n ${voice} -f "${textFilePath}" -w "${outputPath}"`;

//     try {
//       execSync(command);
//     } catch (error) {
//       console.log(error);
//     }
//   } else {
//     const command = `${
//       bal4web && existsSync(bal4web) ? `"${bal4web}"` : "bal4web"
//     } -s Microsoft -l en-Us -n ${voice} -f "${textFilePath}" -w "${outputPath}"`;

//     try {
//       execSync(command);
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   console.log("audio-generated");
// };

export {};

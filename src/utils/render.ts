import { execSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";

export const getPost = () =>
  JSON.parse(
    readFileSync(join(__dirname, "..", "data", "exam.json")).toString()
  );

type MergeVideos = (args: {
  listPath: string;
  exportPath: string;
  title?: string;
}) => void;
/**
 * Merge Videos together
 */
export const mergeVideos: MergeVideos = ({ listPath, exportPath, title }) => {
  const command = `ffmpeg -y -safe 0 -f concat -i ${listPath} -c copy "${join(
    exportPath,
    `${title ?? "video"}.mp4`
  )}"`;

  try {
    execSync(command, { stdio: "pipe" });
  } catch (error) {
    console.log(error);
  }
};

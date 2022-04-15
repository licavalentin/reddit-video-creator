import { execSync } from "child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  lstatSync,
  unlinkSync,
  rmdirSync,
} from "fs";
import { join } from "path";
import { cpus } from "os";

import { WebpackOverrideFn, TCompMetadata } from "remotion";
import {
  getCompositions,
  renderFrames,
  stitchFramesToVideo,
} from "@remotion/renderer";
import { bundle } from "@remotion/bundler";

import { video as videoConfig } from "../config/video";
import { CompositionId, CompositionData } from "../interface/compositions";

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
    `${title ?? "video"}.${videoConfig.fileFormat}`
  )}"`;

  try {
    execSync(command, { stdio: "pipe" });
  } catch (error) {
    console.log(error);
  }
};

export const generateBundle: (
  path: string,
  bundleDir: string
) => Promise<string> = async (path, bundleDir) => {
  const webpackOverride: WebpackOverrideFn = (webpackConfig) => ({
    ...webpackConfig,
    module: {
      ...webpackConfig.module,
      rules: [
        ...(webpackConfig.module?.rules ? webpackConfig.module.rules : []),
        {
          test: /\.s[ac]ss$/i,
          use: [
            { loader: "style-loader" },
            { loader: "css-loader" },
            { loader: "sass-loader", options: { sourceMap: true } },
          ],
        },
      ],
    },
  });

  return await bundle(path, () => {}, {
    webpackOverride,
    outDir: bundleDir,
  });
};

type GenerateVideo = (args: {
  bundled: string;
  id: CompositionId;
  output: string;
  data: CompositionData;
}) => Promise<void>;

// Generate Video
export const generateVideo: GenerateVideo = async ({
  bundled,
  id,
  output,
  data,
}) => {
  if (!existsSync(output)) {
    mkdirSync(output);
  }

  const comps = await getCompositions(bundled, {
    inputProps: data,
  });
  const video = comps.find((c) => c.id === id) as TCompMetadata;

  if (!video) {
    throw new Error(`No video called ${id}`);
  }

  await renderFrames({
    config: video,
    webpackBundle: bundled,
    onStart: () => {},
    onFrameUpdate: () => {},
    parallelism: cpus().length,
    outputDir: output,
    inputProps: data,
    compositionId: id,
    imageFormat: "png",
    onError: (e) => console.log(e),
  });
};

/**
 * Delete Folder with its contents
 */
export const deleteFolder = (path: string) => {
  if (existsSync(path)) {
    readdirSync(path).forEach((file: string) => {
      const curPath = join(path, file);
      if (lstatSync(curPath).isDirectory()) {
        deleteFolder(curPath);
      } else {
        unlinkSync(curPath);
      }
    });
    rmdirSync(path);
  }
};

type GetDuration = (args: {
  filePath: string;
  audioTrimDuration?: number;
}) => number;

/**
 * Get File Duration
 */
export const getDuration: GetDuration = ({
  filePath,
  audioTrimDuration = 0.8,
}) => {
  const args = `ffprobe -i "${filePath}" -show_entries format=duration -v quiet -of csv="p=0"`;

  try {
    return (
      Number(execSync(args, { stdio: "pipe" }).toString().trim()) -
      audioTrimDuration
    );
  } catch (error) {
    return 0;
  }
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

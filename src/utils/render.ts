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

import { CompositionId, InputData } from "./compositions";

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

export const generateBundle: () => Promise<string> = async () => {
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

  return await bundle(join(__dirname, "../index.tsx"), () => {}, {
    webpackOverride,
  });
};

type GenerateVideo = (args: {
  bundled: string;
  id: CompositionId;
  output: string;
  data: InputData;
}) => Promise<string>;

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

  const { assetsInfo } = await renderFrames({
    config: video,
    webpackBundle: bundled,
    onStart: () => console.log("Rendering frames..."),
    onFrameUpdate: (f) => {
      if (f % 10 === 0) {
        console.log(`Rendered frame ${f}`);
      }
    },
    parallelism: cpus().length,
    outputDir: output,
    inputProps: data,
    compositionId: id,
    imageFormat: "png",
  });

  const finalOutput = join(output, "out.mp4");

  await stitchFramesToVideo({
    dir: output,
    force: true,
    fps: video.fps,
    height: video.height,
    width: video.width,
    outputLocation: finalOutput,
    assetsInfo,
    imageFormat: "png",
    parallelism: cpus().length,
  });

  return finalOutput;
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

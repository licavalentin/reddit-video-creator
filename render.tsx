import { mkdtempSync } from "fs";
import { tmpdir, cpus } from "os";
import { join } from "path";

import { bundle } from "@remotion/bundler";
import {
  getCompositions,
  renderFrames,
  stitchFramesToVideo,
} from "@remotion/renderer";
import { TCompMetadata, WebpackOverrideFn } from "remotion";

import { GenerateVideo } from "./src/interface/render";

const render = async () => {
  console.time("Render");

  try {
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

    const bundled = await bundle(join(__dirname, "./src/index.tsx"), () => {}, {
      webpackOverride,
    });

    const tmpDir = mkdtempSync(join(tmpdir(), "remotion-"));

    const videoList: string[] = [];

    const generateVideo: GenerateVideo = async ({ id, output, data }) => {
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

    console.log(tmpDir);
  } catch (err) {
    console.error(err);
  }

  console.timeEnd("Render");
};

render();

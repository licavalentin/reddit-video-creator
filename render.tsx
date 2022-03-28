import { mkdtempSync, writeFileSync, mkdirSync, existsSync } from "fs";
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
import { getPost, mergeVideos } from "./src/utils/render";
import { Comments, Intro, Outro } from "./src/interface/compositions";

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

    const generateVideo: GenerateVideo = async ({ id, output, data }) => {
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

    const {
      post: { title, author, all_awardings, score },
      comments,
      outro,
      exportPath,
    } = getPost();

    // Generate Intro
    const introPath = join(tmpDir, "intro");
    await generateVideo({
      id: "intro",
      output: introPath,
      data: {
        title,
        author,
        awards: all_awardings,
        score,
      } as Intro,
    });

    // Generate Comments
    for (let index = 0; index < comments.length; index++) {
      const comment = comments[index];

      await generateVideo({
        id: "comments",
        output: join(tmpDir, `comments-${index}`),
        data: { comments: comment } as Comments,
      });
    }

    // Generate Outro
    const outroPath = join(tmpDir, "outro");
    await generateVideo({
      id: "outro",
      output: introPath,
      data: {
        outro,
      } as Outro,
    });

    const videoList: string[] = [
      introPath,
      ...comments.map((_, i) => join(tmpDir, `comments-${i}`)),
      outroPath,
    ];

    const listPath = join(tmpDir, "list.txt");
    writeFileSync(listPath, videoList.join("\n"));

    mergeVideos({
      exportPath,
      listPath,
    });

    console.log(tmpDir);
  } catch (err) {
    console.error(err);
  }

  console.timeEnd("Render");
};

render();

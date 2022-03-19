import { mkdtempSync, writeFileSync, mkdirSync } from "fs";
import { tmpdir, cpus } from "os";
import { join } from "path";

import { bundle } from "@remotion/bundler";
import {
  getCompositions,
  renderFrames,
  renderStill,
  stitchFramesToVideo,
} from "@remotion/renderer";
import { TCompMetadata, WebpackOverrideFn } from "remotion";

import { getExam, mergeVideos } from "./src/utils/render";
import {
  CheckBoxQuestions,
  GenerateVideo,
  IntroData,
  Question,
} from "./src/interface/render";

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

    const generateVideo: GenerateVideo = async ({ type, output, data }) => {
      const comps = await getCompositions(bundled, {
        inputProps: data,
      });
      const video = comps.find((c) => c.id === type) as TCompMetadata;

      if (!video) {
        throw new Error(`No video called ${type}`);
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
        compositionId: type,
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

    const data = getExam();

    for (let index = 0; index < data.length; index++) {
      const { type } = data[index];

      switch (type) {
        case "intro":
          const introOutput = join(tmpDir, index + "");

          mkdirSync(introOutput);

          videoList.push(
            await generateVideo({
              type,
              output: introOutput,
              data: data[index] as Question,
            })
          );
          break;

        case "outro":
          const outroOutput = join(tmpDir, index + "");

          mkdirSync(outroOutput);

          videoList.push(
            await generateVideo({
              type,
              output: outroOutput,
              data: data[index] as Question,
            })
          );
          break;

        case "checkbox":
          const checkboxQuestions = data[index];

          for (
            let idx = 0;
            idx < (checkboxQuestions.data as CheckBoxQuestions[]).length;
            idx++
          ) {
            const question = (checkboxQuestions.data as CheckBoxQuestions[])[
              idx
            ];

            const checkboxOutput = join(tmpDir, `${index}-${idx}`);

            mkdirSync(checkboxOutput);

            videoList.push(
              await generateVideo({
                type,
                output: checkboxOutput,
                data: {
                  type: "checkbox",
                  title: checkboxQuestions.title,
                  data: question,
                },
              })
            );
          }

          break;

        case "circle":
          const circleQuestions = data[index];

          for (
            let idx = 0;
            idx < (circleQuestions.data as CheckBoxQuestions[]).length;
            idx++
          ) {
            const question = (circleQuestions.data as CheckBoxQuestions[])[idx];

            const checkboxOutput = join(tmpDir, `${index}-${idx}`);

            mkdirSync(checkboxOutput);

            videoList.push(
              await generateVideo({
                type,
                output: checkboxOutput,
                data: {
                  type: "checkbox",
                  title: circleQuestions.title,
                  data: question,
                },
              })
            );
          }

          break;
      }
    }

    const listPath = join(tmpDir, "list.txt");
    writeFileSync(listPath, videoList.map((e) => `file '${e}'`).join("\n"));

    mergeVideos({
      exportPath: "C:\\Users\\licav\\Desktop",
      listPath,
      title: "exam",
    });

    const thumbnailComps = await getCompositions(bundled);
    const thumbnailVideo = thumbnailComps.find(
      (c) => c.id === "thumbnail"
    ) as TCompMetadata;

    await renderStill({
      composition: thumbnailVideo,
      webpackBundle: bundled,
      output: "C:\\Users\\licav\\Desktop\\thumbnail.png",
      onError: (error) => {
        console.error(
          "The following error occured when rendering the still: ",
          error.message
        );
      },
      inputProps: {
        level: (data.filter((e) => e.type === "intro")[0].data as IntroData)
          .level,
        question: (
          data.filter((e) => e.type === "checkbox")[0]
            .data as CheckBoxQuestions[]
        )[1],
      },
    });

    console.log(tmpDir);
  } catch (err) {
    console.error(err);
  }

  console.timeEnd("Render");
};

render();

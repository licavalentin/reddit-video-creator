import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

import Spinnies from "spinnies";
import { getCompositions, renderStill } from "@remotion/renderer";
import { TCompMetadata } from "remotion";
import moment from "moment";

import {
  commentPath,
  introPath,
  midPath,
  outroPath,
  tmpDir,
} from "./src/config/paths";
import { Intro } from "./src/interface/compositions";
import { RenderPost } from "./src/interface/post";

import settings from "./src/data/settings.json";

import {
  generateVideo,
  generateBundle,
  deleteFolder,
  createPlaylist,
  checkBal4web,
  checkFFmpeg,
} from "./src/utils/render";
import { fetchPostData } from "./src/utils/reddit";
import { createRandomString } from "./src/utils/helper";
import { createAudio } from "./src/audio";
import mergeFrames from "./src/video";

const render = async () => {
  const spinner = {
    interval: 80,
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  };
  const loading = new Spinnies({
    spinner,
    failColor: "redBright",
    succeedColor: "greenBright",
    failPrefix: "❌",
    succeedPrefix: "✅",
  });

  try {
    const begin = Date.now();

    loading.add("start", { text: "🚀 Start" });

    loading.succeed("start");

    checkBal4web(loading);
    checkFFmpeg(loading);

    const postsData: RenderPost[] = JSON.parse(
      readFileSync(join(__dirname, "src", "data", "posts.json")).toString()
    );

    if (postsData.length === 0) {
      throw new Error("Please Add Posts");
    }

    for (const post of postsData) {
      try {
        if (existsSync(tmpDir)) {
          deleteFolder(tmpDir);
        }

        mkdirSync(tmpDir);

        if (post.status !== "queue") continue;

        const postId = post.url.split("/comments/")[1].split("/")[0];

        loading.add("id", { text: `📋 Post: ${postId} ` });
        loading.succeed("id");

        const exportPath = join(
          settings.exportPath !== ""
            ? settings.exportPath
            : join(homedir(), "Desktop"),
          createRandomString(4)
        );

        if (existsSync(exportPath)) {
          deleteFolder(exportPath);
        }

        mkdirSync(exportPath);

        loading.add("comments", { text: "✍️  Fetching Comments" });

        // Fetch Post
        const postData = await fetchPostData(post);

        // Store Post for dev
        writeFileSync(
          join(__dirname, "src", "data", "localPost.json"),
          JSON.stringify(postData)
        );

        loading.succeed("comments");

        loading.add("audio", {
          text: "🎤 Creating Audio ",
        });

        checkBal4web(loading);
        // Create Audio Files
        await createAudio(postData);

        loading.succeed("audio");

        const playlist = createPlaylist({ post, comments: postData.comments });

        // Store Post Playlist for dev
        writeFileSync(
          join(__dirname, "src", "data", "playlist.json"),
          JSON.stringify(playlist)
        );

        loading.add("render", {
          text: "🍿 Rendering Video",
        });

        checkFFmpeg(loading);
        // Bundle React Code
        const compositionPath = join(__dirname, "src", "compositions");
        const bundleDir = join(tmpDir, "bundle");

        // Generate Intro Video
        await generateVideo({
          bundled: await generateBundle(
            join(compositionPath, "Intro.tsx"),
            bundleDir
          ),
          id: "intro",
          output: introPath,
          data: {
            title: postData.post.title,
            author: postData.post.author,
            awards: postData.post.all_awardings,
            score: postData.post.score,
            background: post.image,
          } as Intro,
        });

        // Generate Mid
        await generateVideo({
          bundled: await generateBundle(
            join(compositionPath, "Mid.tsx"),
            bundleDir
          ),
          id: "mid",
          output: midPath,
          data: {
            background: post.image,
          },
        });

        // Generate Outro
        await generateVideo({
          bundled: await generateBundle(
            join(compositionPath, "Outro.tsx"),
            bundleDir
          ),
          id: "outro",
          output: outroPath,
          data: {
            background: post.image,
          },
        });

        // Generating Thumbnail
        const thumbnailPath = join(exportPath, `thumbnail.png`);
        const stillBundle = await generateBundle(
          join(compositionPath, "Thumbnail.tsx"),
          bundleDir
        );
        const thumbnailComps = await getCompositions(stillBundle);
        const thumbnailVideo = thumbnailComps.find(
          (c) => c.id === "thumbnail"
        ) as TCompMetadata;

        await renderStill({
          composition: thumbnailVideo,
          webpackBundle: stillBundle,
          output: thumbnailPath,
          inputProps: {
            title: postData.post.title,
            subreddit: postData.post.subreddit,
            awards: postData.post.all_awardings,
          },
        });

        for (const [k, videos] of playlist.entries()) {
          // Generate Comments
          for (const [j, { comments }] of videos.entries()) {
            await generateVideo({
              bundled: await generateBundle(
                join(compositionPath, "Comments.tsx"),
                bundleDir
              ),
              id: "comments",
              output: commentPath(`${k}-${j}`),
              data: {
                comments,
                background: post.image,
              },
            });
          }

          await mergeFrames({
            comments: videos,
            id: k,
            exportPath,
          });
        }

        loading.succeed("render");
      } catch (error) {
        loading.add("error", { text: "Failed" });
        loading.fail("error");
      }
    }

    const end = Date.now();

    loading.add("finish", {
      text: `🚩 Finished in: ${moment.utc(end - begin).format("HH:mm:ss")}`,
    });
    loading.succeed("finish");
    loading.stopAll();
  } catch (err) {}

  // load.stop();
};

render();

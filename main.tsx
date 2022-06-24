import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

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
} from "./src/utils/render";
import { fetchPostData } from "./src/utils/reddit";
import { createRandomString } from "./src/utils/helper";
import { createAudio } from "./src/audio";
import mergeFrames from "./src/video";

const render = async () => {
  const begin = Date.now();

  console.log("🚀 Start");

  try {
    const postsList: RenderPost[] = JSON.parse(
      readFileSync(join(__dirname, "src", "data", "posts.json")).toString()
    );

    // Check if we have selected posts
    if (postsList.length === 0) throw new Error("Please Add Posts");

    for (let i = 0; i < postsList.length; i++) {
      // Create Temp dir to store render files
      if (existsSync(tmpDir)) {
        deleteFolder(tmpDir);
      }

      mkdirSync(tmpDir);

      const post = postsList[i];

      if (post.status !== "queue") continue;

      const postId = post.url.split("/comments/")[1].split("/")[0];
      console.log(`ID: ${postId} - Loading: 0%`);

      const exportPath = join(
        settings.exportPath !== ""
          ? settings.exportPath
          : join(homedir(), "Desktop"),
        createRandomString(4)
      );

      if (!existsSync(exportPath)) {
        mkdirSync(exportPath);
      }

      // Fetch Post
      const postData = await fetchPostData(post);

      // Store Post for dev
      writeFileSync(
        join(__dirname, "src", "data", "localPost.json"),
        JSON.stringify(postData)
      );

      console.log(`Loading: 5%`);

      // Create Audio Files
      await createAudio(postData);

      const playlist = createPlaylist({ post, comments: postData.comments });

      // Store Post Playlist for dev
      writeFileSync(
        join(__dirname, "src", "data", "playlist.json"),
        JSON.stringify(playlist)
      );

      // Bundle React Code
      const compositionPath = join(__dirname, "src", "compositions");
      const bundleDir = join(tmpDir, "bundle");

      console.log(`Loading: 40%`);

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

      console.log(`Loading: 43%`);

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

      console.log(`Loading: 46%`);

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

      console.log(`Loading: 49%`);

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

      console.log(`Loading: 50%`);

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

      console.log(`Loading: 100%`);
    }
  } catch (err) {
    console.error(err);
  }

  const end = Date.now();

  console.log(`🚩 Finished in: ${moment.utc(end - begin).format("HH:mm:ss")}`);

  // load.stop();
};

render();

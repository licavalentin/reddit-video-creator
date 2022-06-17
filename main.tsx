import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { join } from "path";

import loading from "loading-cli";

import {
  commentPath,
  introPath,
  midPath,
  outroPath,
  tmpDir,
} from "./src/config/paths";
import { Intro, Outro, CommentsGroup } from "./src/interface/compositions";

import {
  generateVideo,
  generateBundle,
  deleteFolder,
  createPlaylist,
} from "./src/utils/render";
import { fetchPostData } from "./src/utils/reddit";
import { createAudio } from "./src/audio";
import mergeFrames from "./src/video";
import { getCompositions, renderStill } from "@remotion/renderer";
import { TCompMetadata } from "remotion";
import { homedir } from "os";
import { RenderPost } from "./src/interface/post";
import { createRandomString } from "./src/utils/helper";
import moment from "moment";

const render = async () => {
  const begin = Date.now();

  // const load = loading("🚀 Start").start();
  console.log("🚀 Start");

  try {
    // Create Temp dir to store render files
    if (existsSync(tmpDir)) {
      deleteFolder(tmpDir);
    }

    mkdirSync(tmpDir);

    const postsList: RenderPost[] = JSON.parse(
      readFileSync(join(__dirname, "src", "data", "posts.json")).toString()
    );

    // Check if we have selected posts
    if (postsList.length === 0) throw new Error("Please Add Posts");

    for (let i = 0; i < postsList.length; i++) {
      const post = postsList[i];

      if (post.status !== "queue") continue;

      const postId = post.url.split("/comments/")[1].split("/")[0];
      // load.text = `✉️ Fetching Post ID: ${postId} - Loading: 0%`;
      console.log(`✉️ Fetching Post ID: ${postId} - Loading: 0%`);

      // Fetch Post
      const postData = await fetchPostData(post);

      // writeFileSync(
      //   join(__dirname, "src", "data", "test.json"),
      //   JSON.stringify(postData)
      // );

      // load.text = `🎤 Creating Audio - Loading: 5%`;
      console.log(`🎤 Creating Audio - Loading: 5%`);

      // Create Audio Files
      await createAudio(postData);

      const playlist = createPlaylist({ post, comments: postData.comments });

      // writeFileSync(
      //   join(__dirname, "src", "data", "playlist.json"),
      //   JSON.stringify({ post: postData.post, playlist })
      // );

      // const postData = JSON.parse(
      //   readFileSync(join(__dirname, "src", "data", "playlist.json")).toString()
      // );

      // Bundle React Code
      const compositionPath = join(__dirname, "src", "compositions");
      const bundleDir = join(tmpDir, "bundle");

      // load.text = `🖼️ Rendering: Intro ✨, Mid ✨, Outro ✨, Thumbnail ✨ - Loading: 40%`;
      console.log(
        `🖼️ Rendering: Intro ✨, Mid ✨, Outro ✨, Thumbnail ✨ - Loading: 40%`
      );

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
        } as Intro,
      });

      // load.text = `🖼️ Rendering: Intro ✅, Mid ✨, Outro ✨, Thumbnail ✨, Comments ✨ - Loading: 43%`;
      console.log(
        `🖼️ Rendering: Intro ✅, Mid ✨, Outro ✨, Thumbnail ✨, Comments ✨ - Loading: 43%`
      );

      // Generate Mid
      await generateVideo({
        bundled: await generateBundle(
          join(compositionPath, "Mid.tsx"),
          bundleDir
        ),
        id: "mid",
        output: midPath,
        data: {},
      });

      // load.text = `🖼️ Rendering: Intro ✅, Mid ✅, Outro ✨, Thumbnail ✨, Comments ✨ - Loading: 46%`;
      console.log(
        `🖼️ Rendering: Intro ✅, Mid ✅, Outro ✨, Thumbnail ✨, Comments ✨ - Loading: 46%`
      );

      // Generate Outro
      await generateVideo({
        bundled: await generateBundle(
          join(compositionPath, "Outro.tsx"),
          bundleDir
        ),
        id: "outro",
        output: outroPath,
        data: {},
      });

      // load.text = `🖼️ Rendering: Intro ✅, Mid ✅, Outro ✅, Thumbnail ✨, Comments ✨ - Loading: 49%`;
      console.log(
        `🖼️ Rendering: Intro ✅, Mid ✅, Outro ✅, Thumbnail ✨, Comments ✨ - Loading: 49%`
      );

      // Generating Thumbnail
      const thumbnailPath = join(tmpDir, `${createRandomString(4)}.png`);
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

      // load.text = `🖼️ Rendering: Intro ✅, Mid ✅, Outro ✅, Thumbnail ✅, Comments ✨ - Loading: 50%`;
      console.log(
        `🖼️ Rendering: Intro ✅, Mid ✅, Outro ✅, Thumbnail ✅, Comments ✨ - Loading: 50%`
      );

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
            },
          });
        }

        await mergeFrames({
          comments: videos,
          id: k,
        });
      }

      // load.text = `🖼️ Rendering: Intro ✅, Mid ✅, Outro ✅, Thumbnail ✅, Comments ✅ - Loading: 100%`;
      console.log(
        `🖼️ Rendering: Intro ✅, Mid ✅, Outro ✅, Thumbnail ✅, Comments ✅ - Loading: 100%`
      );
    }
  } catch (err) {
    // console.error(err);
  }

  const end = Date.now();

  // load.text = `🚩 Finished in: ${moment.utc(end - begin).format("HH:mm:ss")}`;
  console.log(`🚩 Finished in: ${moment.utc(end - begin).format("HH:mm:ss")}`);

  // load.stop();
};

render();

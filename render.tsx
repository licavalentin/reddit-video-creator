import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { join } from "path";

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
import { mergeFrames } from "./src/video";
import { getCompositions, renderStill } from "@remotion/renderer";
import { TCompMetadata } from "remotion";

const render = async () => {
  console.time("Render");

  try {
    // // Create Temp dir to store render files
    // if (existsSync(tmpDir)) {
    //   deleteFolder(tmpDir);
    // }

    // mkdirSync(tmpDir);

    // const postsList: string[] = JSON.parse(
    //   readFileSync(join(__dirname, "src", "data", "posts.json")).toString()
    // );

    // // Check if we have selected posts
    // if (postsList.length === 0) throw new Error("Please Add Posts");

    // console.log(`📁 Project dir: ${tmpDir}`);

    // // // Fetch Post
    // const postData = await fetchPostData(postsList[0]);

    // // Create Audio Files
    // await createAudio(postData);

    const postData = JSON.parse(
      readFileSync(join(__dirname, "src", "data", "playlist.json")).toString()
    );

    const playlist = createPlaylist(postData.comments);

    // writeFileSync(
    //   join(__dirname, "src", "data", "playlist.json"),
    //   JSON.stringify({ post: postData.post, playlist })
    // );

    // Bundle React Code
    console.log("🎥 Generating Video");

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
      data: {},
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
        outro: postData.post.outro,
      } as Outro,
    });

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
      output: "C:\\Users\\licav\\Desktop\\thumbnail.png",
      onError: (error) => {
        console.error(
          "The following error occured when rendering the still: ",
          error.message
        );
      },
      inputProps: {
        title: postData.post.title,
        subreddit: postData.post.subreddit,
        awards: postData.post.all_awardings,
      },
    });

    for (const videos of playlist) {
      // Generate Comments
      for (const { comments } of videos) {
        for (let index = 0; index < comments.length; index++) {
          await generateVideo({
            bundled: await generateBundle(
              join(compositionPath, "Comments.tsx"),
              bundleDir
            ),
            id: "comments",
            output: commentPath(index),
            data: {
              comments,
            },
          });
          console.log(`💬 Comments ${index + 1} Finished`);
        }

        // await mergeFrames({
        //   comments,
        // });
      }
    }

    console.log("🎥 Video Generated Successfully");
  } catch (err) {
    console.error(err);
  }

  console.timeEnd("Render");
};

render();

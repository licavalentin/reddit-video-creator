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
} from "./src/utils/render";
import { fetchPostData } from "./src/utils/reddit";
import { createAudio } from "./src/audio";
import { mergeFrames } from "./src/video";

const render = async () => {
  console.time("Render");

  try {
    // // Create Temp dir to store render files
    // if (existsSync(tmpDir)) {
    //   deleteFolder(tmpDir);
    // }

    // mkdirSync(tmpDir);

    // // todo: []. Fetch selected posts and automatically chose comments
    // const postsList: string[] = JSON.parse(
    //   readFileSync(join(__dirname, "src", "data", "posts.json")).toString()
    // );

    // // Check if we have selected posts
    // if (postsList.length === 0) throw new Error("Please Add Posts");

    // console.log(`📁 Project dir: ${tmpDir}`);

    // // Fetch Post
    // const { comments, post } = await fetchPostData(postsList[0]);

    // // Create Audio Files
    // await createAudio({
    //   post,
    //   comments,
    // });

    // writeFileSync(
    //   join(__dirname, "src", "data", "post.json"),
    //   JSON.stringify({ post, comments })
    // );

    const { post, comments } = JSON.parse(
      readFileSync(join(__dirname, "src", "data", "post.json")).toString()
    );

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
        title: post.title,
        author: post.author,
        awards: post.all_awardings,
        score: post.score,
      } as Intro,
    });

    // Generate Comments
    for (let index = 0; index < comments.length; index++) {
      await generateVideo({
        bundled: await generateBundle(
          join(compositionPath, "Comments.tsx"),
          bundleDir
        ),
        id: "comments",
        output: commentPath(index),
        data: {
          comments: comments[index],
        } as CommentsGroup,
      });

      console.log(`💬 Comments ${index + 1} Finished`);
    }

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
        outro: post.outro,
      } as Outro,
    });

    await mergeFrames({
      comments,
    });

    console.log("🎥 Video Generated Successfully");
  } catch (err) {
    console.error(err);
  }

  console.timeEnd("Render");
};

render();

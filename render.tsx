import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { ffmpegFile } from "./src/config/paths";
import { video } from "./src/config/video";
import { Intro, Outro, CommentsGroup } from "./src/interface/compositions";

import {
  mergeVideos,
  generateVideo,
  generateBundle,
  deleteFolder,
} from "./src/utils/render";
import { fetchPostData } from "./src/utils/reddit";
import { createAudio } from "./src/audio";

const render = async () => {
  console.time("Render");

  try {
    // Create Temp dir to store render files
    const tmpDir = join(tmpdir(), "reddit-video-creator");

    if (existsSync(tmpDir)) {
      deleteFolder(tmpDir);
    }

    mkdirSync(tmpDir);

    // todo: []. Fetch selected posts and automatically chose comments
    const postsList: string[] = JSON.parse(
      readFileSync(join(__dirname, "src", "data", "posts.json")).toString()
    );

    // Check if we have selected posts
    if (postsList.length === 0) throw new Error("Please Add Posts");

    console.log(`📁 Project dir: ${tmpDir}`);

    // Fetch Post
    const { comments, post } = await fetchPostData(postsList[0]);

    // // Create Audio Files
    // await createAudio({
    //   post,
    //   comments,
    //   tmpDir,
    // });

    // const { post, comments } = JSON.parse(
    //   readFileSync(join(__dirname, "src", "data", "post.json")).toString()
    // );

    writeFileSync(
      join(__dirname, "src", "data", "post.json"),
      JSON.stringify({ post, comments })
    );

    // Bundle React Code
    // console.log("🎥 Generating Video");

    // const compositionPath = join(__dirname, "src", "compositions");

    // const bundleDir = join(tmpDir, "bundle");

    // // Generate Intro Video
    // const introPath = join(tmpDir, "intro");
    // await generateVideo({
    //   bundled: await generateBundle(
    //     join(compositionPath, "Intro.tsx"),
    //     bundleDir
    //   ),
    //   id: "intro",
    //   output: introPath,
    //   data: {
    //     title: post.title,
    //     author: post.author,
    //     awards: post.all_awardings,
    //     score: post.score,
    //   } as Intro,
    // });

    // // Generate Comments
    // for (let index = 0; index < comments.length; index++) {
    //   await generateVideo({
    //     bundled: await generateBundle(
    //       join(compositionPath, "Comments.tsx"),
    //       bundleDir
    //     ),
    //     id: "comments",
    //     output: join(tmpDir, `comments-${index}`),
    //     data: {
    //       comments: comments[index],
    //     } as CommentsGroup,
    //   });

    //   console.log(`Comments ${index} Finished`);
    // }

    // // Generate Mid
    // const midPath = join(tmpDir, "mid");
    // await generateVideo({
    //   bundled: await generateBundle(
    //     join(compositionPath, "Mid.tsx"),
    //     bundleDir
    //   ),
    //   id: "mid",
    //   output: midPath,
    //   data: {},
    // });

    // // Generate Outro
    // const outroPath = join(tmpDir, "outro");
    // await generateVideo({
    //   bundled: await generateBundle(
    //     join(compositionPath, "Outro.tsx"),
    //     bundleDir
    //   ),
    //   id: "outro",
    //   output: outroPath,
    //   data: {
    //     outro: post.outro,
    //   } as Outro,
    // });

    // const outVideo = `out.${video.fileFormat}`;
    // const videoList: string[] = [
    //   ffmpegFile(join(introPath, outVideo)),
    //   ...comments.map((_: any, i: number) =>
    //     ffmpegFile(join(tmpDir, `comments-${i}`, outVideo))
    //   ),
    //   ffmpegFile(join(outroPath, outVideo)),
    // ];

    // const listPath = join(tmpDir, "list.txt");
    // writeFileSync(
    //   listPath,
    //   videoList.join(`\n${ffmpegFile(join(midPath, outVideo))}\n`)
    // );

    // // Merge Rendered Videos
    // mergeVideos({
    //   exportPath: "C:\\Users\\licav\\Desktop",
    //   listPath,
    // });

    console.log("🎥 Video Generated Successfully");
  } catch (err) {
    console.error(err);
  }

  console.timeEnd("Render");
};

render();

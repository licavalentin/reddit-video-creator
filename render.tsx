import { mkdtempSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { Comments, Intro, Outro } from "./src/interface/compositions";

import {
  getPost,
  mergeVideos,
  generateVideo,
  generateBundle,
} from "./src/utils/render";

import generateAudio from "./src/audio/index";
import { fetchPostData } from "./src/utils/redditApi";

const render = async () => {
  console.time("Render");

  try {
    // Create Temp dir to store render files
    const tmpDir = mkdtempSync(join(tmpdir(), "remotion-"));

    // todo: []. Fetch selected posts and automatically chose comments
    const postsList: string[] = JSON.parse(
      readFileSync(join(__dirname, "src", "data", "posts.json")).toString()
    );

    if (postsList.length === 0) {
      throw new Error("Please Add Posts");
    }

    const { post, comments } = await fetchPostData(postsList[0]);

    writeFileSync(join(__dirname, "test2.json"), JSON.stringify(comments));

    // Fetch Local Post File
    // const {
    //   post: { title, author, all_awardings, score },
    //   comments,
    //   outro,
    //   exportPath,
    // } = getPost();

    // Generate Audio Files
    // await generateAudio();

    // Bundle React Code
    // const bundled = await generateBundle();

    // // Generate Intro Video
    // const introPath = join(tmpDir, "intro");
    // await generateVideo({
    //   bundled,
    //   id: "intro",
    //   output: introPath,
    //   data: {
    //     title,
    //     author,
    //     awards: all_awardings,
    //     score,
    //   } as Intro,
    // });

    // // Generate Comments
    // for (let index = 0; index < comments.length; index++) {
    //   const comment = comments[index];

    //   await generateVideo({
    //     bundled,
    //     id: "comments",
    //     output: join(tmpDir, `comments-${index}`),
    //     data: { comments: comment } as Comments,
    //   });
    // }

    // // Generate Outro
    // const outroPath = join(tmpDir, "outro");
    // await generateVideo({
    //   bundled,

    //   id: "outro",
    //   output: introPath,
    //   data: {
    //     outro,
    //   } as Outro,
    // });

    // const videoList: string[] = [
    //   introPath,
    //   ...comments.map((_, i) => join(tmpDir, `comments-${i}`)),
    //   outroPath,
    // ];

    // const listPath = join(tmpDir, "list.txt");
    // writeFileSync(listPath, videoList.join("\n"));

    // mergeVideos({
    //   exportPath,
    //   listPath,
    // });

    // console.log(tmpDir);
  } catch (err) {
    console.error(err);
  }

  console.timeEnd("Render");
};

render();

import { mkdtempSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { Intro, Outro } from "./src/utils/compositions";

import { mergeVideos, generateVideo, generateBundle } from "./src/utils/render";

// import generateAudio from "./src/audio/index";
import { fetchPostData } from "./src/utils/reddit";
// import { createAudio } from "./src/audio";

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

    const {
      post: { title, author, all_awardings, score },
      comments,
    } = await fetchPostData(postsList[0]);

    // createAudio({
    //   comments,
    //   tmpDir,
    // });

    // Bundle React Code
    const bundled = await generateBundle();

    // Generate Intro Video
    const introPath = join(tmpDir, "intro");
    await generateVideo({
      bundled,
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
      await generateVideo({
        bundled,
        id: "comments",
        output: join(tmpDir, `comments-${index}`),
        data: { comments: comments[index] },
      });
    }

    // Generate Outro
    const outroPath = join(tmpDir, "outro");
    await generateVideo({
      bundled,
      id: "outro",
      output: outroPath,
      data: {
        outro: "💖 Thank you for watching",
      } as Outro,
    });

    const videoList: string[] = [
      `file '${join(introPath, "out.mp4")}`,
      ...comments.map(
        (_, i) => `file '${join(tmpDir, `comments-${i}`, "out.mp4")}'`
      ),
      `file '${join(outroPath, "out.mp4")}`,
    ];

    const listPath = join(tmpDir, "list.txt");
    writeFileSync(listPath, videoList.join("\n"));

    mergeVideos({
      exportPath: "C:\\Users\\licav\\Desktop",
      listPath,
    });

    console.log(tmpDir);
  } catch (err) {
    console.error(err);
  }

  console.timeEnd("Render");
};

render();

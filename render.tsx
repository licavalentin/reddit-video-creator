import { mkdtempSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { ffmpegFile } from "./src/config/paths";
import { Intro, Outro, CommentsGroup } from "./src/interface/compositions";

import { mergeVideos, generateVideo, generateBundle } from "./src/utils/render";
import { fetchPostData } from "./src/utils/reddit";
import { createAudio } from "./src/audio";
import { TextComment } from "./src/interface/post";

const render = async () => {
  console.time("Render");

  try {
    // Create Temp dir to store render files
    const tmpDir = mkdtempSync(join(tmpdir(), "remotion-"));

    // todo: []. Fetch selected posts and automatically chose comments
    const postsList: string[] = JSON.parse(
      readFileSync(join(__dirname, "src", "data", "posts.json")).toString()
    );

    // Check if we have selected posts
    if (postsList.length === 0) throw new Error("Please Add Posts");

    console.log(`📁 Project dir: ${tmpDir}`);

    // Fetch Post
    // const { comments, post } = await fetchPostData(postsList[0]);

    // // Create Audio Files
    // const newData = await createAudio({
    //   post,
    //   comments,
    //   tmpDir,
    // });

    // writeFileSync(
    //   join(__dirname, "src", "data", "post.json"),
    //   JSON.stringify(newData)
    // );

    const newData = JSON.parse(
      readFileSync(join(__dirname, "src", "data", "post.json")).toString()
    );

    // Bundle React Code
    console.log("🎥 Generating Video");

    const compositionPath = join(__dirname, "src", "compositions");

    // Generate Intro Video
    const introPath = join(tmpDir, "intro");
    const introData = newData.post.title as TextComment;
    await generateVideo({
      bundled: await generateBundle(join(compositionPath, "Intro.tsx")),
      id: "intro",
      output: introPath,
      data: {
        title: introData.text,
        author: newData.post.author,
        awards: newData.post.all_awardings,
        score: newData.post.score,
        durationInFrames: introData.durationInFrames,
      } as Intro,
    });

    // Generate Comments
    for (let index = 0; index < newData.comments.length; index++) {
      const data = newData.comments[index];
      await generateVideo({
        bundled: await generateBundle(join(compositionPath, "Comments.tsx")),
        id: "comments",
        output: join(tmpDir, `comments-${index}`),
        data: {
          durationInFrames: data.durationInFrames,
          comments: data.commentsGroup,
        } as CommentsGroup,
      });

      console.log(`Comments ${index} Finished`);
    }

    // Generate Outro
    const outroPath = join(tmpDir, "outro");
    const outroData = newData.post.outro as TextComment;
    await generateVideo({
      bundled: await generateBundle(join(compositionPath, "Outro.tsx")),
      id: "outro",
      output: outroPath,
      data: {
        outro: outroData.text,
        durationInFrames: outroData.durationInFrames,
      } as Outro,
    });

    const videoList: string[] = [
      ffmpegFile(join(introPath, "out.mp4")),
      ...newData.comments.map((_: any, i: number) =>
        ffmpegFile(join(tmpDir, `comments-${i}`, "out.mp4"))
      ),
      ffmpegFile(join(outroPath, "out.mp4")),
    ];

    const listPath = join(tmpDir, "list.txt");
    writeFileSync(listPath, videoList.join("\n"));

    // Merge Rendered Videos
    mergeVideos({
      exportPath: "C:\\Users\\licav\\Desktop",
      listPath,
    });

    console.log("🎥 Video Generated Successfully");
  } catch (err) {
    console.error(err);
  }

  console.timeEnd("Render");
};

render();

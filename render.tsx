import { mkdtempSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { ffmpegFile } from "./src/config/paths";
import { Intro, Outro, CommentsGroup } from "./src/interface/compositions";

import { mergeVideos, generateVideo, generateBundle } from "./src/utils/render";
import { fetchPostData } from "./src/utils/reddit";
import { createAudio } from "./src/audio";

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

    // Fetch Post
    const {
      post: { title, author, all_awardings, score, subreddit },
      comments,
    } = await fetchPostData(postsList[0]);

    // Create Audio Files
    const newComments = await createAudio({
      comments,
      tmpDir,
    });

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
    for (let index = 0; index < newComments.length; index++) {
      await generateVideo({
        bundled,
        id: "comments",
        output: join(tmpDir, `comments-${index}`),
        data: { comments: newComments[index] } as CommentsGroup,
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
      ffmpegFile(join(introPath, "out.mp4")),
      ...comments.map((_, i) =>
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

    console.log(tmpDir);
  } catch (err) {
    console.error(err);
  }

  console.timeEnd("Render");
};

render();

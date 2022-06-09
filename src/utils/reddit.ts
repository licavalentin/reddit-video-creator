import { readdirSync } from "fs";
import { join } from "path";

import wink from "wink-nlp";
import model from "wink-eng-lite-web-model";
import axios from "axios";

import {
  Post,
  Comment,
  CommentWrapper,
  Replies,
  RedditData,
  Award,
  CommentText,
  CommentGroup,
  RenderPost,
} from "../interface/post";
import { commentPath, imagePath } from "../config/paths";

const redditUrl = "https://www.reddit.com";

/**
 * List all files and folders inside folder
 * @param path Folder path
 * @returns List of files and folders inside folder
 */
export const getFolders = (path: string): string[] => {
  const files: string[] = readdirSync(path) ?? [];

  const filesList: string[] = [];

  for (const file of files) {
    const index = parseInt(file.split("-")[0], 10);
    filesList[index] = file;
  }

  return filesList.filter((item) => !item.includes(".json"));
};

/**
 * Fetch Post Data
 */
export const fetchPostData = async (post: RenderPost) => {
  console.log("📰 Fetching Post");

  const nlp = wink(model);

  // Check if Url is valid
  const { origin, pathname } = (() => {
    try {
      const postData = new URL(post.url);

      if (postData.origin !== redditUrl) {
        throw new Error("Invalid Post Url");
      }

      return postData;
    } catch (error) {
      throw new Error("Invalid Post Url");
    }
  })();

  // Fetch Post data
  const { data } = (await axios.get(`${origin}${pathname}.json?sort=top`)) as {
    data: RedditData;
  };

  const {
    all_awardings,
    title,
    num_comments,
    subreddit,
    selftext,
    author,
    created_utc,
    over_18,
    score,
  } = data[0].data.children[0].data;

  const postAwards = (all_awardings: Award[]) =>
    all_awardings.map((awards) => {
      const { count, name } = awards;
      return { count, name };
    });

  const postDetails: Post = {
    all_awardings: postAwards(all_awardings),
    title,
    author,
    num_comments,
    subreddit,
    selftext,
    created_utc,
    over_18,
    score,
  };

  const publicFolder = join(__dirname, "..", "..", "public");
  const avatarFolder = join(publicFolder, "avatar");
  const faces = getFolders(join(avatarFolder, "face"));
  const heads = getFolders(join(avatarFolder, "head"));
  const bodies = getFolders(join(avatarFolder, "body"));

  const selectAvatar = (images: string[]): string =>
    images[Math.floor(Math.random() * images.length)];

  const commentList: Comment[][] = [];
  let comments: Comment[] = [];

  const cleanUpComment = (commentDetails: CommentWrapper) => {
    const {
      data: { author, body, replies, all_awardings, created_utc, depth, score },
    } = commentDetails;

    if (depth === 0) {
      if (comments.length > 0) {
        commentList.push(comments);
      }

      comments = [];
    }

    if (
      depth > 2 ||
      score < 1000 ||
      comments[depth] ||
      (body as string) === "[deleted]" ||
      (body as string) === "[removed]"
    ) {
      return;
    }

    comments.push({
      author,
      body,
      all_awardings: postAwards(all_awardings),
      created_utc,
      depth,
      score,
    });

    if (replies !== "") {
      for (let i = 0; i < (replies as Replies).data.children.length; i++) {
        const element = (replies as Replies).data.children[i] as CommentWrapper;

        if (element.kind !== "more") {
          cleanUpComment(element);
        }
      }
    }
  };

  for (const commentTree of data[1].data.children) {
    if (commentTree.kind === "more") {
      break;
    }

    cleanUpComment(commentTree);
  }

  const selectedComments: CommentGroup[] = [
    ...(() => {
      if (selftext.length > 80)
        return [
          [
            {
              author,
              body: selftext,
              all_awardings: postAwards(all_awardings),
              created_utc,
              depth: 0,
              score,
            },
          ],
        ];

      return [];
    })(),
    ...commentList,
  ].map((comments, i) => {
    let durationInFrames: number = 0;
    const commentsList = comments.map((comment, j) => {
      let cleanText = (comment.body as string)
        //replace the linebreaks with <br>
        .replace(/(?:\r\n|\r|\n)/g, "<br>");
      //check for links [text](url)
      let elements = cleanText.match(/\[.*?\)/g);
      if (elements !== null && elements.length > 0) {
        for (const text of elements) {
          cleanText = cleanText.replace(
            text,
            (text.match(/\[(.*?)\]/) as RegExpMatchArray)[1]
          );
        }
      }

      const splitText = nlp
        .readDoc(cleanText.replace(/(?:https?|ftp):\/\/[\n\S]+/g, ""))
        .sentences()
        .out();
      const body: string[] = [];

      for (const text of splitText) {
        if (text.length < 50 && body.length > 0) {
          body[body.length - 1] = `${body[body.length - 1]} ${text}`;
        } else {
          body.push(text);
        }
      }

      return {
        ...comment,
        body: body.map((text, k) => {
          durationInFrames++;

          return {
            text: text.trim(),
            frame: durationInFrames - 1,
          };
        }) as CommentText[],
        avatar: {
          face: selectAvatar(faces),
          head: selectAvatar(heads),
          body: selectAvatar(bodies),
        },
      };
    });

    return {
      durationInFrames: durationInFrames - 1,
      durationInSeconds: 0,
      comments: commentsList,
    };
  });

  console.log("📰 Post Fetched Successfully");

  return {
    post: postDetails,
    comments: selectedComments,
  };
};

import { existsSync, readdirSync } from "fs";
import { join } from "path";

import axios from "axios";

import {
  Post,
  Comment,
  CommentWrapper,
  Replies,
  RedditData,
  Award,
  CommentText,
} from "../interface/post";

const redditUrl = "https://www.reddit.com";

/**
 * Generate array of sentences from comment
 * @param {string} text Comment text
 */
const splitText = (text: string): string[] => {
  // Decode html code to text
  const words = text
    // Remove emoji
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ""
    )
    .replace(/(?:https?|ftp):\/\/[\n\S]+/g, "")
    .split(" ")
    .filter((text) => text.trim() !== "");

  if (words.length === 1) {
    return words;
  }

  const sentences: string[] = [];
  let sentence: string[] = [];

  for (const word of words) {
    sentence.push(word);

    const chars = [".", "!", "?"];

    const mergedText = sentence.join(" ");

    if (chars.some((char) => word.includes(char))) {
      sentences.push(mergedText);
      sentence = [];
    }
  }

  if (sentence.length !== 0) {
    sentences.push(sentence.join(" "));
  }

  return sentences;
};

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
export const fetchPostData = async (url: string) => {
  console.log("📰 Fetching Post");

  // Check if Url is valid
  const { origin, pathname } = (() => {
    try {
      const postData = new URL(url);

      if (postData.origin !== redditUrl) {
        throw new Error("Invalid Post Url");
      }

      return postData;
    } catch (error) {
      throw new Error("Invalid Post Url");
    }
  })();

  const urls = `${origin}${pathname}.json?sort=top`;

  // Fetch Post data
  const { data } = (await axios.get(urls)) as { data: RedditData };

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

  for (const commentTree of data[1].data.children) {
    if (commentTree.kind === "more") {
      break;
    }

    const cleanUpComment = (commentDetails: CommentWrapper) => {
      const {
        data: {
          author,
          body,
          replies,
          all_awardings,
          created_utc,
          depth,
          score,
        },
      } = commentDetails;

      if (depth === 0) {
        if (comments.length > 0) {
          commentList.push(comments);
        }

        comments = [];
      }

      if (depth > 2 || score < 1000 || comments[depth]) {
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
          const element = (replies as Replies).data.children[
            i
          ] as CommentWrapper;

          if (element.kind !== "more") {
            cleanUpComment(element);
          }
        }
      }
    };

    cleanUpComment(commentTree);
  }

  const selectedComments: Comment[][] = [
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
  ].map((comments) => {
    let totalFrames: number = 0;

    return comments.map((comment) => ({
      ...comment,
      body: splitText(comment.body as string).map((text) => {
        totalFrames++;

        return {
          text,
          frame: totalFrames - 1,
        };
      }),
      avatar: {
        face: selectAvatar(faces),
        head: selectAvatar(heads),
        body: selectAvatar(bodies),
      },
    }));
  });

  console.log("📰 Post Fetched Successfully");

  return {
    post: postDetails,
    comments: selectedComments,
  };
};

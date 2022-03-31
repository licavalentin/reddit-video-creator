import axios from "axios";

import {
  Post,
  Comment,
  CommentWrapper,
  Replies,
  RedditData,
  Award,
} from "../interface/post";

const redditUrl = "https://www.reddit.com";

/**
 * Fetch Post Data
 */
export const fetchPostData = async (url: string) => {
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

  // todo []. in the future cache fetcher posts

  const postAwards: Award[] = all_awardings.map((awards) => {
    const { count, name } = awards;

    return { count, name };
  });

  const postDetails: Post = {
    all_awardings: postAwards,
    title,
    author,
    num_comments,
    subreddit,
    selftext,
    created_utc,
    over_18,
    score,
  };

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
        all_awardings: all_awardings.map((awards) => {
          const { count, name } = awards;
          return { count, name };
        }),
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

  return {
    post: postDetails,
    comments: [
      ...(() => {
        if (selftext !== "")
          return [
            {
              author,
              body: selftext,
              all_awardings: postAwards,
              created_utc,
              depth: 0,
              score,
            },
          ];

        return [];
      })(),
      ...commentList,
      [comments],
    ],
  };
};

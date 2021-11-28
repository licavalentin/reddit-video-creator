import { readFileSync } from "fs";

import { Post } from "../interface/post";
import { Crop } from "../interface/image";
import { Comment } from "../interface/video";

import { getArgument } from "./helper";

// import { measureComments } from "../images/measureComments";
// import { transformComments } from "../images/transformComments";

export const getPost = () => {
  // Parse Post Data
  const {
    post,
    comments,
    exportPath,
  }: // backgroundPath,
  // cropDetails,
  {
    post: Post;
    comments: Comment[];
    exportPath: string;
    // backgroundPath: string;
    // cropDetails: Crop;
  } = JSON.parse(readFileSync(getArgument("POST")).toString());

  // const measuredComments = await measureComments(comments);

  // if (isMain) {
  //   let processCount: number = 0;

  //   for (const comment of measuredComments) {
  //     processCount += comment.text.length;
  //   }

  //   console.log(`total-processes=${processCount}`);
  //   return;
  // }

  // const transformedComments = await transformComments(measuredComments);

  return {
    post,
    comments,
    exportPath,
    // comments: transformedComments,
    // backgroundPath,
    // cropDetails,
  };
};

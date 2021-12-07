import { getPost, resetTemp } from "./utils/helper";
import generateAudio from "./audio/index";
import generateVideo from "./video/index";
import { measureContent } from "./images/measureComments";
import { transformComments } from "./images/transformComments";
import generateContent from "./images/content/index";
import { generateAvatar } from "./images/avatars";
import generateFrames from "./images/frames/index";

const renderVideo = async () => {
  console.time("Render");

  // Reset temp
  await resetTemp();

  // Get created post
  const post = getPost();

  // Generate random avatar for each comment
  await generateAvatar(post.comments);

  // Measure content and split into groups
  const measureText = await measureContent(post.comments);
  const transformedComments = await transformComments(measureText);

  // Generate Content images
  await generateContent(transformedComments);

  // Render Frames
  await generateFrames(transformedComments);

  // Generate audio file for each comment
  await generateAudio(measureText);

  // Generate video
  await generateVideo(measureText, post.exportPath);

  // Reset temp
  // await resetTemp();

  console.timeEnd("Render");
};

renderVideo();

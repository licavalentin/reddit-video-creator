import { resetTemp } from "./utils/helper";
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

  // Measure content and split into groups
  const measureText = await measureContent();

  const transformedComments = await transformComments(measureText);

  // Generate random avatar for each comment
  await generateAvatar();

  // Generate Content images
  await generateContent(transformedComments);

  // Render Frames
  await generateFrames(transformedComments);

  return;

  // Generate audio file for each comment
  await generateAudio(measureText);

  // Generate video
  await generateVideo(measureText);

  console.timeEnd("Render");
};

renderVideo();

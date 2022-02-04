import { join } from "path";
import { writeFileSync, mkdirSync } from "fs";

import Jimp from "jimp";

import { renderPath, imagePath } from "../config/paths";

import { generateAudioFile, getVoice } from "../audio/lib";
import { generateVideo } from "../video/lib";
import { getDuration, getPost } from "../utils/helper";

export const createOutro = async () => {
  const {
    cli: { ffmpeg, ffprobe, balcon, bal4web },
    customAudio,
    audioTrimDuration,
    outroImage,
    outro,
  } = getPost();

  try {
    const outroFolder = join(renderPath, "outro");

    mkdirSync(outroFolder);

    const outroImagePath = join(outroFolder, "outro-image.png");
    const outroTextPath = join(outroFolder, "text.txt");

    writeFileSync(
      outroTextPath,
      outro ??
        "Make sure to subscribe and turn on notification, See you on another video, Bye"
    );

    const image = await Jimp.read(
      outroImage ?? join(imagePath, "outro-image.png")
    );

    // Write image
    await image.writeAsync(outroImagePath);

    generateAudioFile({
      textFilePath: outroTextPath,
      exportPath: outroFolder,
      voice: getVoice(),
      balcon,
      bal4web,
      customAudio,
    });

    const audioPath = join(outroFolder, "audio.mp3");

    const duration = getDuration({
      ffprobe,
      audioTrimDuration: 0,
      filePath: audioPath,
    });

    generateVideo({
      duration,
      image: outroImagePath,
      exportPath: outroFolder,
      audio: audioPath,
      ffmpeg,
    });
  } catch (err) {
    // console.log(err);
  }
};

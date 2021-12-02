import { join } from "path";

import Jimp from "jimp";

import { renderPath, imagePath } from "../config/paths";
import { commentDetails } from "../config/image";

import { getFolders } from "../utils/helper";

type GenerateAvatar = (id: number) => Promise<void>;

export const generateAvatar: GenerateAvatar = async (id) => {
  const avatarAssets = join(imagePath, "reddit-avatar");
  const backgroundImagePath = join(avatarAssets, "circle-background.png");

  const heads = getFolders(join(avatarAssets, "head"));
  const faces = getFolders(join(avatarAssets, "face"));
  const bodies = getFolders(join(avatarAssets, "body"));

  const selectedHead = await Jimp.read(
    join(avatarAssets, "head", heads[Math.floor(Math.random() * heads.length)])
  );
  const selectedFace = await Jimp.read(
    join(avatarAssets, "face", faces[Math.floor(Math.random() * faces.length)])
  );
  const selectedBody = await Jimp.read(
    join(
      avatarAssets,
      "body",
      bodies[Math.floor(Math.random() * bodies.length)]
    )
  );
  const defaultHead = await Jimp.read(join(avatarAssets, "default-head.png"));
  const defaultBody = await Jimp.read(join(avatarAssets, "default-body.png"));

  const backgroundImage = await Jimp.read(backgroundImagePath);
  backgroundImage
    .composite(defaultBody, 0, 0)
    .composite(selectedBody, 0, 0)
    .composite(defaultHead, 0, 0)
    .composite(selectedFace, 0, 0)
    .composite(selectedHead, 0, 0);

  backgroundImage.resize(commentDetails.avatarSize - 5, Jimp.AUTO);

  await backgroundImage.writeAsync(join(renderPath, id + "", "avatar.png"));
};

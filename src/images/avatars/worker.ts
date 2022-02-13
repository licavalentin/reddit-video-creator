import { readFileSync } from "fs";
import { join } from "path";

import Jimp from "jimp";

import { avatarAssets, renderPath } from "../../config/paths";
import { commentDetails } from "../../config/image";

type CommentJob = {
  heads: string[];
  faces: string[];
  bodies: string[];
  comments: number[];
};

const init = async () => {
  const args = process.argv.slice(2);

  const { bodies, faces, heads, comments } = JSON.parse(
    readFileSync(args[0]).toString()
  ) as CommentJob;

  for (const comment of comments) {
    const backgroundImagePath = join(avatarAssets, "circle-background.png");
    const defaultHead = await Jimp.read(join(avatarAssets, "default-head.png"));
    const defaultBody = await Jimp.read(join(avatarAssets, "default-body.png"));

    const randomHead = heads[Math.floor(Math.random() * heads.length)];
    const randomFace = faces[Math.floor(Math.random() * faces.length)];
    const randomBody = bodies[Math.floor(Math.random() * bodies.length)];

    const selectedHead = await Jimp.read(
      join(avatarAssets, "head", randomHead)
    );

    const selectedFace = await Jimp.read(
      join(avatarAssets, "face", randomFace)
    );

    const selectedBody = await Jimp.read(
      join(avatarAssets, "body", randomBody)
    );

    const backgroundImage = await Jimp.read(backgroundImagePath);

    backgroundImage.color([
      { apply: "xor", params: [commentDetails.colors.main] },
    ]);

    backgroundImage
      .composite(defaultBody, 0, 0)
      .composite(selectedBody, 0, 0)
      .composite(defaultHead, 0, 0)
      .composite(selectedFace, 0, 0)
      .composite(selectedHead, 0, 0);

    backgroundImage.resize(commentDetails.avatarSize, Jimp.AUTO);

    await backgroundImage.writeAsync(
      join(renderPath, comment + "", "avatar.png")
    );

    console.log("avatar-generated");
  }

  // Kill Worker
  process.exit();
};

init();

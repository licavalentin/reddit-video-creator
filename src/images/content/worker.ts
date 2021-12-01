import { join } from "path";

import Jimp from "jimp";

import { fontPath } from "../../config/paths";
import { FontFace } from "../../interface/image";

const init = async () => {
  const args = process.argv.slice(2);
  const work = JSON.parse(args[0]) as {
    text: string;
    id: string;
  }[];

  const font = await Jimp.loadFont(
    join(fontPath, "comments", FontFace.Comment)
  );

  for (let index = 0; index < work.length; index++) {
    const job = work[index];
  }

  //   process.send();

  // Kill Worker
  process.exit();
};

init();

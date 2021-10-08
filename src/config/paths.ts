import { tmpdir } from "os";
import { join } from "path";

const tempPath = join(tmpdir(), "reddit-video-creator");
const renderPath = join(tempPath, "render");
const dataPath = join(__dirname, "..", "data");
const assetsPath = join(__dirname, "..", "assets");
const fontPath = join(assetsPath, "font");
const imagePath = join(assetsPath, "images");

export { tempPath, renderPath, dataPath, assetsPath, fontPath, imagePath };

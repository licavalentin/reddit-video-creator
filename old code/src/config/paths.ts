import { tmpdir } from "os";
import { join } from "path";

export const tempPath = join(tmpdir(), "reddit-video-creator");
export const renderPath = join(tempPath, "render");
export const tempData = join(tempPath, "data");
export const dataPath = join(__dirname, "..", "data");
export const assetsPath = join(__dirname, "..", "assets");
export const fontPath = join(assetsPath, "font");
export const imagePath = join(assetsPath, "images");
export const avatarAssets = join(imagePath, "reddit-avatar");

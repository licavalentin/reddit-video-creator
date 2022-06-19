import { tmpdir } from "os";
import { join } from "path";

export const tmpDir = join(tmpdir(), "reddit-video-creator");
export const tempAudio = join(tmpDir, "audio");
export const tempData = join(tmpDir, "data");
export const commentPath = (id: number | string) =>
  join(tmpDir, `comments-${id}`);
export const imagePath = (path: string, id: string | number) =>
  join(path, `element-${id}.png`);
export const introPath = join(tmpDir, "intro");
export const outroPath = join(tmpDir, "outro");
export const midPath = join(tmpDir, "mid");
export const ffmpegFile = (path: string) => `file '${path}`;

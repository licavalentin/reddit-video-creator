import { tmpdir } from "os";
import { join } from "path";

const tempPath = join(tmpdir(), "reddit-video-creator");

export { tempPath };

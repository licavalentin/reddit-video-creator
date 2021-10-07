import { tmpdir } from "os";
import { join } from "path";

const tempPath = join(tmpdir(), "reddit-video-creator");
const renderPath = join(tempPath, "render");

export { tempPath, renderPath };

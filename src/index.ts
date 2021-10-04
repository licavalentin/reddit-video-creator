const cluster = require("cluster");
const { cpus, tmpdir } = require("os");
const { join } = require("path");
const { execFile } = require("child_process");
const { readdirSync, statSync, existsSync, mkdir } = require("fs");

const tempPath = join(tmpdir(), "reddit-video-creator");

if (!existsSync(tempPath)) {
  mkdir(tempPath);
}

const cliPath = join(tempPath, "cli");
const renderPath = join(tempPath, "render");
const balconPath = join(cliPath, "balcon", "balcon.exe");
const ffmpegPath = join(cliPath, "ffmpeg", "ffmpeg.exe");
const ffprobePath = join(cliPath, "ffmpeg", "ffprobe.exe");

const argumentHandler = (name) => {
  for (const arg of process.argv) {
    if (arg.includes("=")) {
      const argCommand = arg.split("=");

      if (argCommand[0] === name) {
        return argCommand[1];
      }
    }
  }

  return null;
};

const getVoices = () => {
  return new Promise((resolve) => {
    execFile(balconPath, ["-l"], (error, stdout) => {
      if (error) {
        throw error;
      }

      const listOfVoice = stdout
        .trim()
        .split("\n")
        .map((v) => v.trim())
        .filter((v) => v !== "SAPI 5:");

      resolve(listOfVoice);
    });
  });
};

const getFolders = (path) => {
  const files = readdirSync(path) ?? [];

  files.sort(function (a, b) {
    return (
      statSync(join(path, a)).mtime.getTime() -
      statSync(join(path, b)).mtime.getTime()
    );
  });

  return files;
};

const getAudioDuration = async (path) => {
  return new Promise((resolve) => {
    const params = [
      "-v",
      "error",
      "-select_streams",
      "a:0",
      "-show_format",
      "-show_streams",
    ];

    execFile(ffprobePath, [...params, path], async (error, stdout) => {
      if (error) {
        throw error;
      }

      const matched = stdout.match(/duration="?(\d*\.\d*)"?/);

      if (matched && matched[1]) resolve(parseFloat(matched[1]));
    });
  });
};

const generateAudio = async (textPath, path) => {
  const voice = argumentHandler("VOICE") ?? (await getVoices()[0]);

  return new Promise((resolve) => {
    execFile(
      balconPath,
      ["-f", textPath, "-w", path, "-n", voice],
      async (error) => {
        if (error) {
          throw error;
        }

        const duration = await getAudioDuration(path);

        resolve(duration);
      }
    );
  });
};

const generateVideo = async (image, audio, path, duration) => {
  return new Promise((resolve) => {
    console.log("Creating Video");

    execFile(
      ffmpegPath,
      [
        "-loop",
        "1",
        "-i",
        image,
        "-i",
        audio,
        "-c:v",
        "libx264",
        "-tune",
        "stillimage",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-pix_fmt",
        "yuv420p",
        "-shortest",
        "-t",
        duration.toString(),
        join(path, `video.mp4`),
      ],
      (error) => {
        if (error) {
          console.log("Video couldn't create successfully");
          throw error;
        }

        console.log("Video created successfully");

        resolve(null);
      }
    );
  });
};

const renderVideo = async () => {
  const folders = getFolders(renderPath);
  const leftFolders = folders.length % cpus().length;
  const folderPerCpu = Math.floor(folders.length / cpus().length);
  if (cluster.isMaster) {
    for (const cpu of cpus()) {
      cluster.fork();
    }
  } else {
    const index = cluster.worker.id - 1;
    const numOfFolders =
      folderPerCpu + (index === cpus().length - 1 ? leftFolders : 0);
    const startIndex = index !== 0 ? index * folderPerCpu : 0;
    const endIndex = startIndex + numOfFolders;
    const listOfFolders = folders.slice(startIndex, endIndex);
    for (const folder of listOfFolders) {
      const folderPath = join(renderPath, folder);
      const imagePath = join(folderPath, "image.jpg");
      const textPath = join(folderPath, "text.txt");
      const audioPath = join(folderPath, "audio.wav");
      try {
        const duration = await generateAudio(textPath, audioPath);
        await generateVideo(imagePath, audioPath, folderPath, duration);
      } catch (error) {
        console.log(error);
      }
    }
    cluster.worker.kill();
  }
};

renderVideo();

# ✨📼 Create Reddit Videos with JavaScript 📼✨

https://user-images.githubusercontent.com/74852397/176777528-649ec815-441d-4e94-9cfb-09a7bdaf0c74.mp4

Welcome to the Reddit Video Creation project, powered by JavaScript! This tool allows you to effortlessly generate captivating videos from Reddit posts. Below, you'll find instructions on setting up and running the project.

## 🚀 Setup

If you encounter any issues during setup, please refer to the [References](#references) section for additional resources.

### 🪟 Windows

1. Begin by downloading and installing the following components:

   - [FFMPEG](https://ffmpeg.org/)
   - [BAL4WEB](http://www.cross-plus-a.com/bweb.htm)
   - [Node.js](https://nodejs.org/)

   Once installed, make sure to save their respective executable file paths (ffmpeg, ffprobe, bal4web) into the **_/src/data/settings.json_** file.

### 🐧 Linux

1. Follow these steps to set up on Linux:

   - Install the latest version of Node.js with the following commands:

     ```sh
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
     export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
     [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
     nvm install --lts
     ```

   - Download and save [FFMPEG](https://ffmpeg.org/) and [BAL4WEB](http://www.cross-plus-a.com/bweb.htm) in a dedicated folder. Be sure to store the paths for ffmpeg, ffprobe, and bal4web in the **_/src/data/settings.json_** file.

   - Install Wine using one of the following commands, depending on your Linux distribution:

     Debian:

     ```sh
     sudo apt update -y
     sudo apt install wine64 -y
     ```

     Arch:

     ```sh
     sudo pacman -Syu -y
     sudo pacman -S wine-staging -y
     ```

### 💀 macOS - **_#todo_**

<!--
1. Install [Brew](https://brew.sh/) with the following command:

   ```sh
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Download and save [FFMPEG](https://ffmpeg.org/) and [BAL4WEB](http://www.cross-plus-a.com/bweb.htm) in a dedicated folder. Store the paths for ffmpeg, ffprobe, and bal4web in the **_/src/data/settings.json_** file.

3. Install Wine using Brew:

   ```sh
   brew tap homebrew/cask-versions
   brew install --cask --no-quarantine wine-stable
   ``` -->

## 🏃 Run

To start creating Reddit videos, follow these steps:

1. Add Reddit video items to the **_src/data/posts.json_** file. Here's an example of how to structure your entries:

   ```json
   [
     {
       "status": "queue", // queue, draft, finish
       "url": "https://www.reddit.com/r/AskReddit/comments/xxx/xxx", // Post URL
       "maxDuration": 8, // Maximum video duration
       "videosCount": 1, // Number of videos per set maxDuration
       "image": "/backgrounds/mike-dubyna-gwLO-b1n5Yc-unsplash.jpg" // Video background image /public/<image path>
     }
   ]
   ```

2. Open your terminal and run the following commands:

   ```sh
   npm i
   npm start
   ```

## ⚙️ Config

Customize your video creation settings by editing the **_/src/data/settings.json_** file:

```json
{
  "exportPath": "/home/john/Desktop/reddit-videos/", // Video export path
  "backgroundMusic": "", // Video background music (default: /public/music.mp3)
  "voice": "AriaNeural", // Voice choice: AriaNeural, JennyNeural, GuyNeural, AmberNeural, AshleyNeural, CoraNeural, ElizabethNeural, MichelleNeural, MonicaNeural, AnaNeural, BrandonNeural, ChristopherNeural, JacobNeural, EricNeural
  "maxScore": 1000, // Minimum Reddit post comment score
  "bal4web": "/home/john/Desktop/bal4web/bal4web.exe", // Bal4web executable path
  "ffmpeg": "/home/john/Desktop/ffmpeg/ffmpeg", // FFmpeg executable path
  "ffprobe": "/home/john/Desktop/ffmpeg/ffprobe" // FFprobe executable path
}
```

## 🧰 Todo

Here's a list of tasks to enhance the project:

- [x] Implement loading indicator in the CLI
  - [x] Provide more detailed progress information
- [x] Change the background image
- [ ] Add video to the background
- [x] Include background audio
- [x] Implement settings configuration via .json files
- [ ] Transform into a CLI tool
- [x] Implement custom thumbnail resizing script
- [ ] Implement word censorship
- [x] Merge extra content into a single video
- [ ] Update setup instructions for macOS
- [ ] Refactor and improve codebase

<span id="references"></span>

## 📑 References

For further assistance, refer to these helpful resources:

- [Installing Node.js with nvm on Linux & macOS & WSL](https://gist.github.com/d2s/372b5943bce17b964a79)
- [How to Install and Use FFmpeg on Debian](https://linuxize.com/post/how-to-install-ffmpeg-on-debian-9/)
- [How to Install Wine on Linux](https://wiki.winehq.org/Ubuntu)
- [Git Official Website](https://git-scm.com/)
- [Brew Official Website](https://brew.sh/)

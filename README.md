# 🎥 Create Reddit videos with JavaScript

# ⚠️ Under Construction

## 💻 [Download 🍎 🐧 🪟](https://github.com/ValentinHLica/reddit-video-creator-app/releases) - 🍿 [Example](https://youtu.be/xTjnCoePU18)

## 🚀 Setup

For any problems please check [References](#references)

### 💀 Windows

1. Download [FFMPEG](https://ffmpeg.org/), [BAL4WEB](http://www.cross-plus-a.com/bweb.htm), [BALCON](http://www.cross-plus-a.com/bconsole.htm) and [NodeJs](https://nodejs.org/). Save them in a folder that you wont touch.
2. Store .exe path for ffmpeg, bal4web and balcon as environment variables [Tutorial](https://www.youtube.com/watch?v=hD9bQE4R6eA) **(same for bal4web and balcon)**

### 💀 Linux

Start by updating the packages list and installing FFmpeg:

```
sudo apt update
sudo apt install ffmpeg
```

Install Wine **(used for balcon and bal4web)**

```
sudo apt install wine64
```

### 💀 MaxOS

Install ffmpeg:

```
brew install FFmpeg
```

Install Wine **(used for balcon and bal4web)**:

```
brew tap homebrew/cask-versions
brew install --cask --no-quarantine wine-stable
```

## 🧰 Todo

- [x] Implement Loading in cli
  - [ ] Elaborate more on process loading
- [x] Change background image
- [ ] Add Video to background
- [ ] Add Background audio
- [x] Implement settings configuring from .json files
- [ ] Transform to cli
- [x] Implement Custom thumbnail resize script
- [ ] Refactor

<span id="references"></span>

## 📑 References

- [Installing Node.js with nvm to Linux & macOS & WSL](https://gist.github.com/d2s/372b5943bce17b964a79)
- [How to Install and Use FFmpeg on Debian](https://linuxize.com/post/how-to-install-ffmpeg-on-debian-9/)
- [How to Install Wine on Linux](https://www.maketecheasier.com/install-wine-on-linux/)

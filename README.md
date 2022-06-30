<div style="height:60px;width:60px;background-color:#FF4300;border-radius:50%;margin:0 auto 20px auto"></div>
<h1 align="center">Reddit Video Creator</h1>

## 🎥 Create Reddit videos with JavaScript

## 💻 [App](https://github.com/ValentinHLica/reddit-video-creator-app/releases) - 🍿 [Example](https://youtu.be/xTjnCoePU18)

## 🚀 Setup

For any problems please check [References](#references)

### 🪟 Windows

1. Download [FFMPEG](https://ffmpeg.org/), [BAL4WEB](http://www.cross-plus-a.com/bweb.htm) , and [NodeJs](https://nodejs.org/). Save them in a folder that you won't touch and store .exe path for ffmpeg, ffprobe, bal4web into **_/src/data/settings.json_**

### 🐧 Linux

1. Install latest version of NodeJs

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install --lts
```

2. Download [FFMPEG](https://ffmpeg.org/), [BAL4WEB](http://www.cross-plus-a.com/bweb.htm). Save them in a folder that you won't touch and store path for ffmpeg, ffprobe, bal4web into **_/src/data/settings.json_**

3. Install Wine

```
sudo apt install wine64
```

### 🍎 MaxOS

Install [Brew](https://brew.sh/)

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. Download [FFMPEG](https://ffmpeg.org/), [BAL4WEB](http://www.cross-plus-a.com/bweb.htm). Save them in a folder that you won't touch and store path for ffmpeg, ffprobe, bal4web into **_/src/data/settings.json_**

3. Install Wine

```
brew tap homebrew/cask-versions
brew install --cask --no-quarantine wine-stable
```

## 🧰 Todo

- [x] Implement Loading in cli
  - [ ] Elaborate more on process loading
- [x] Change background image
- [ ] Add Video to background
- [x] Add Background audio
- [x] Implement settings configuring from .json files
- [ ] Transform to cli
- [ ] Implement Custom thumbnail resize script
- [ ] Censure Words
- [ ] Extra content merge into one video
- [ ] Refactor

<span id="references"></span>

## 📑 References

- [Installing Node.js with nvm to Linux & macOS & WSL](https://gist.github.com/d2s/372b5943bce17b964a79)
- [How to Install and Use FFmpeg on Debian](https://linuxize.com/post/how-to-install-ffmpeg-on-debian-9/)
- [How to Install Wine on Linux](https://wiki.winehq.org/Ubuntu)
- [Git Official Website](https://git-scm.com/)
- [Brew Official Website](https://brew.sh/)

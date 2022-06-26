# 🎥 Create Reddit videos with JavaScript

# ⚠️ Under Construction

## 💻 [App](https://github.com/ValentinHLica/reddit-video-creator-app/releases) - 🍿 [Example](https://youtu.be/xTjnCoePU18)

## 🚀 Setup

For any problems please check [References](#references)

### 💀 Windows

1. Download [FFMPEG](https://ffmpeg.org/), [BAL4WEB](http://www.cross-plus-a.com/bweb.htm), [BALCON](http://www.cross-plus-a.com/bconsole.htm) and [NodeJs](https://nodejs.org/), [Git](https://git-scm.com/). Save them in a folder that you wont touch.
2. Store .exe path for ffmpeg, bal4web and balcon as environment variables [Tutorial](https://www.youtube.com/watch?v=hD9bQE4R6eA) **(same for bal4web and balcon)**

### 💀 Linux

1. **nvm**

To **install** nvm use the following cURL or Wget command:

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

```sh
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

Running either of the above commands downloads a script and runs it. The script clones the nvm repository to `~/.nvm`, and attempts to add the source lines from the snippet below to the correct profile file (`~/.bash_profile`, `~/.zshrc`, `~/.profile`, or `~/.bashrc`).

```sh
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

Install latest version of NodeJs

```sh
nvm install --lts
```

2. **ffmpeg**

Update packages list and installing FFmpeg:

```
sudo apt update
sudo apt install ffmpeg
```

3. **wine**

Install Wine **(used for balcon and bal4web)**

```
sudo apt install wine64
```

4. Download [BAL4WEB](http://www.cross-plus-a.com/bweb.htm) and extract files to a folder

```
bal4web="wine /home/john/Desktop/bal4web/bal4web.exe"
```

### 💀 MaxOS

Install [Brew](https://brew.sh/)

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Install ffmpeg:

```
brew install ffmpeg
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

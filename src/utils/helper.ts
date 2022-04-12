import { video } from "../config/video";
import { CalculateComments } from "../interface/helper";
import { TextComment } from "../interface/post";

/**
 * Roundup number to 1k, 1M ...
 * @param number Number to Roundup
 * @returns Rounded number
 */
export const roundUp = (number: number): string => {
  const newStr = ("" + number)
    .split("")
    .reverse()
    .join("")
    .match(/.{1,3}/g) as string[];

  return `${newStr[newStr.length - 1].split("").reverse().join("")}${
    " kmgtpe"[newStr.length - 1]
  }`;
};

/**
 * Calculate scroll effect on comments
 */
export const calculateComments: CalculateComments = ({
  commentsEl,
  comments,
}) => {
  if (commentsEl.current) {
    let frames: number[] = [];
    let count = 0;

    const marginTop = commentsEl.current.offsetTop;

    commentsEl.current.querySelectorAll("li.comment").forEach((item, index) => {
      const spanEl = item.querySelector(
        "span.calc__content"
      ) as HTMLSpanElement;

      const framesCheck = (comments[index].body as TextComment[])
        .map((_, idx) => {
          spanEl.textContent = (comments[index].body as TextComment[])
            .slice(0, idx)
            .map((e) => e.text)
            .join(" ");

          const isInFrame =
            window.innerHeight - (spanEl.offsetTop + spanEl.offsetHeight);
          const frameHeight = video.height - marginTop * 2;

          if (Math.floor(isInFrame / frameHeight) > count) {
            count++;
            return idx + index;
          }
        })
        .filter((e) => e);

      frames = [...frames, ...(framesCheck as number[])];
    });

    let frame: number[] = [];
    let transform: number[] = [];

    for (let index = 0; index < frames.length; index++) {
      const frameKey = frames[index];
      frame.push(frameKey - 1, frameKey, frameKey + 1);
      transform.push(index, index + 1, index + 1);
    }

    return [frame, transform, marginTop];
  }

  return null;
};

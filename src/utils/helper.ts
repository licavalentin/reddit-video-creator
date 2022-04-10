import { video } from "../config/video";
import { CalculateComments } from "../interface/helper";

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
export const calculateComments: CalculateComments = async ({
  commentsEl,
  comments,
}) => {
  if (commentsEl.current) {
    commentsEl.current.querySelectorAll("li.comment").forEach((item, index) => {
      const spanEl = item.querySelector(
        "span.calc__content"
      ) as HTMLSpanElement;

      let count = 0;

      const frames = (comments[index].body as string[])
        .map((_, idx) => {
          spanEl.textContent = (comments[index].body as string[])
            .slice(0, idx)
            .join(" ");

          const isInFrame =
            window.innerHeight - spanEl.offsetTop + spanEl.offsetHeight;

          if (Math.floor(isInFrame / video.height) > count) {
            count++;
            return idx;
          }
        })
        .filter((e) => e);

      console.log(frames);
    });

    // console.log(containerHeight, childrenHeight);
  }

  return 0;
};

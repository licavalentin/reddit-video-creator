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
    const marginTop = commentsEl.current.offsetTop;
    let count = 0;
    let frame: number[] = [];
    let transform: number[] = [];

    commentsEl.current.querySelectorAll("li.comment").forEach((item, idx) => {
      const spanEl = item.querySelector(
        "span.calc__content"
      ) as HTMLSpanElement;

      const body = comments[idx].body as TextComment[];

      for (let index = 0; index < body.length; index++) {
        spanEl.textContent = body
          .slice(0, index)
          .map((e) => e.text)
          .join(" ");

        const isInFrame =
          window.innerHeight - spanEl.offsetTop + spanEl.offsetHeight;
        const frameHeight = video.height - marginTop * 2;

        if (Math.floor(isInFrame / frameHeight) > count) {
          const frames = body[index].frames as [number, number];

          // [0, 20, 21, 40],
          // [0, 1, 1, 0]

          frame.push(frames[0], frames[0] + 1);
          transform.push(count * frameHeight, (count + 1) * frameHeight);

          count++;
        }
      }
    });

    return [frame, transform, marginTop];
  }

  return null;
};

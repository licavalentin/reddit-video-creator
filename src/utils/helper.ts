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
  durationInFrames,
}) => {
  if (commentsEl.current) {
    const marginTop = commentsEl.current.getBoundingClientRect().top;
    let count = 0;
    let frame: number[] = [];
    let transform: number[] = [];
    const layout = (
      document.querySelector(".layout__container") as HTMLDivElement
    ).getBoundingClientRect();

    const frameHeight = layout.height - marginTop;

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

        const { bottom } = spanEl.getBoundingClientRect();

        if (Math.floor(bottom / frameHeight) > count) {
          const frames = body[index].frames as [number, number];

          // [0, 20, 21, 40],
          // [0, 1, 1, 1]

          frame.push(frames[0], frames[0] + 1);

          switch (count) {
            case 0:
              transform.push(0, bottom - marginTop);
              break;

            default:
              transform.push(transform.at(-1) as number, bottom - marginTop);
              break;
          }

          count++;
        }
      }
    });

    // frame.push((frame.at(-1) as number) + 1, durationInFrames);
    // transform.push(transform.at(-1) as number, transform.at(-1) as number);

    return [frame, transform, marginTop];
  }

  return null;
};

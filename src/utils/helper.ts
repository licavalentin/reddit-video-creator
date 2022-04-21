import { video } from "../config/video";
import { ScrollAnimationHandler } from "../interface/helper";
import { CommentText } from "../interface/post";

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
export const scrollAnimationHandler: ScrollAnimationHandler = ({
  container,
  comments,
  durationInFrames,
}) => {
  if (container.current) {
    const layout = (
      document.querySelector(".layout__container") as HTMLDivElement
    ).getBoundingClientRect();
    const commentsList = container.current.querySelectorAll("li.comment");
    let topMargin: number = 0;
    let fontSize: number = 0;
    let frames: number[] = [];
    let positions: number[] = [];
    const textHeights: {
      bottom: number;
      frame: number;
    }[] = [];

    for (
      let commentIndex = 0;
      commentIndex < commentsList.length;
      commentIndex++
    ) {
      const comment = commentsList[commentIndex];

      const content = comment.querySelector(
        "span.calc__content"
      ) as HTMLSpanElement;

      const body = comments[commentIndex].body as CommentText[];

      if (commentIndex === 0) {
        content.innerHTML = body[0].text;
        topMargin = content.getBoundingClientRect().top;

        fontSize = Number(
          window.getComputedStyle(content, null).getPropertyValue("font-size")
        );

        content.innerHTML = "";
      }

      for (let textIndex = 0; textIndex < body.length; textIndex++) {
        content.innerHTML = body
          .slice(0, textIndex + 1)
          .map((e) => e.text)
          .join(" ");

        textHeights.push({
          bottom: content.getBoundingClientRect().bottom,
          frame: body[textIndex].frame,
        });
      }
    }

    const inFrameHeight = layout.height - layout.height / 4;
    let inFrame = inFrameHeight;
    let count = 0;

    for (const { bottom, frame } of textHeights) {
      if (bottom >= inFrame) {
        const scroll = bottom - (topMargin + fontSize);

        if (frame - 1 < 1) continue;

        frames.push(frame - 1, frame);

        positions.push(count === 0 ? 0 : (positions.at(-1) as number), scroll);

        inFrame = scroll + inFrameHeight;
        count++;
      }
    }

    if (frames.length > 1) {
      return [frames, positions, textHeights];
    }
  }
};

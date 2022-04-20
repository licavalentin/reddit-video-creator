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
    let count: number = 0;
    let frame: number[] = [];
    let animation: number[] = [];

    const commentsList = container.current.querySelectorAll("li.comment");

    const frameCounter = comments.map((e) => e.body.length);

    let fontSize: number = 0;
    let firstSpanTop: number = 0;

    const bottoms: {
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

        firstSpanTop = content.getBoundingClientRect().top;

        fontSize = parseFloat(
          window.getComputedStyle(content, null).getPropertyValue("font-size")
        );

        content.innerHTML = "";
      }

      for (let textIndex = 0; textIndex < body.length; textIndex++) {
        content.innerHTML = body
          .slice(0, textIndex)
          .map((e) => e.text)
          .join(" ");

        const { bottom } = content.getBoundingClientRect();

        bottoms.push({
          bottom,
          frame: body[textIndex].frame,
        });

        const inFrameHeight = layout.height - firstSpanTop;
        const inFrame = inFrameHeight * count + inFrameHeight;

        if (bottom > inFrame) {
          let prevFrames: number = textIndex;

          for (let idx = 0; idx < frameCounter.length; idx++) {
            if (commentIndex > idx) {
              prevFrames += frameCounter[idx];
            }
          }

          frame.push(prevFrames - 2, prevFrames - 1);

          animation.push(
            count === 0 ? 0 : (animation.at(-1) as number),
            inFrame
          );

          count++;
        }
      }
    }

    if (frame.length > 1 && count > 0) {
      frame.push((frame.at(-1) as number) + 1, durationInFrames);
      const lastAnimation = animation.at(-1) as number;
      animation.push(lastAnimation, lastAnimation);

      return [frame, animation, bottoms];
    }
  }

  return [[], [], []];
};

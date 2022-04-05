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
export const calculateComments: CalculateComments = async ({ commentsEl }) => {
  if (commentsEl.current) {
    const containerHeight = commentsEl.current.offsetHeight;

    const childrenHeight: number[] = [];

    commentsEl.current.querySelectorAll("li").forEach((item, index) => {
      const textContent = item.querySelector(
        "span.visible-text"
      ) as HTMLSpanElement;

      if (textContent) {
        childrenHeight.push(textContent.offsetHeight);
      }
    });

    console.log(containerHeight, childrenHeight);
  }

  return 0;
};

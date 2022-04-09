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
    const containerHeight = commentsEl.current.offsetHeight;

    const childrenHeight: number[] = [];

    commentsEl.current.querySelectorAll("li.comment").forEach((item, index) => {
      const parentHeight = (item as HTMLLIElement).offsetHeight;

      const spanEl = item.querySelector(
        "span.calc__content"
      ) as HTMLSpanElement;

      return (comments[index].body as string[]).map((text, idx) => {
        spanEl.textContent = (comments[index].body as string[])
          .slice(0, idx)
          .join(" ");

        return spanEl.offsetHeight;
      });
    });

    // console.log(containerHeight, childrenHeight);
  }

  return 0;
};

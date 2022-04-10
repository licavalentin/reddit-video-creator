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

    let startHeight = 0;

    commentsEl.current.querySelectorAll("li.comment").forEach((item, index) => {
      const parentHeight = (item as HTMLLIElement).offsetHeight;
      const fontSize = parseFloat(
        getComputedStyle(document.querySelector("body") as HTMLBodyElement)
          .fontSize
      );

      const allContentHeight = (
        item.querySelector("span.all__content") as HTMLSpanElement
      ).offsetHeight;

      const spanEl = item.querySelector(
        "span.calc__content"
      ) as HTMLSpanElement;

      const commentDetailsHeight = parentHeight - allContentHeight - fontSize;

      const heights = (comments[index].body as string[]).map((_, idx) => {
        spanEl.textContent = (comments[index].body as string[])
          .slice(0, idx)
          .join(" ");

        const commentHeight = spanEl.offsetHeight + commentDetailsHeight;

        const total = commentHeight + startHeight;

        startHeight += commentHeight;

        return total;
      });

      console.log(heights);
    });

    // console.log(containerHeight, childrenHeight);
  }

  return 0;
};

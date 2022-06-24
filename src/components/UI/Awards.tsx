import React from "react";
import { Img, staticFile } from "remotion";

import awardsList from "../../data/awards.json";

import { Award } from "../../interface/post";

import styles from "../../styles/components/UI/awards.module.scss";

type Props = {
  awards: Award[];
  limit?: number;
  counter?: boolean;
};

const Awards: React.FC<Props> = ({ awards, limit, counter = true }) => {
  if (awards && awards.length === 0) {
    return null;
  }

  return (
    <ul className={styles.awards}>
      {awards.map((award, index) => {
        if (limit && limit <= index) {
          return null;
        }

        try {
          const { name, count } = award;

          const { path } = (
            awardsList as { title: string; path: string }[]
          ).filter((award) => award.title === name)[0];

          const image = staticFile(`/awards/${path}`);

          return (
            <li key={index}>
              <Img src={image} />

              {counter && <p>{count}</p>}
            </li>
          );
        } catch (error) {
          return null;
        }
      })}
    </ul>
  );
};

export default Awards;

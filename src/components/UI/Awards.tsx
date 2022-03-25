import React from "react";
import { Img, staticFile } from "remotion";

import awardsList from "../../data/awards.json";

import { Award } from "../../interface/post";

import styles from "../../styles/components/UI/awards.module.scss";

type Props = {
  awards: Award[];
};

const Awards: React.FC<Props> = ({ awards }) => {
  return (
    <ul className={styles.awards}>
      {awards.map((award, index) => {
        const { name, count } = award;

        const { path } = (
          awardsList as { title: string; path: string }[]
        ).filter((award) => award.title === name)[0];

        const image = staticFile(`/awards/${path}`);

        return (
          <li key={index}>
            <Img src={image} />

            <p>{count}</p>
          </li>
        );
      })}
    </ul>
  );
};

export default Awards;

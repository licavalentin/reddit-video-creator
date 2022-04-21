import React from "react";

import styles from "../../styles/components/UI/popup.module.scss";

const PopUp: React.FC = ({ children }) => {
  return <div className={styles.popup}>{children}</div>;
};

export default PopUp;

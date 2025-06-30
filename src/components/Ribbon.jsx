import styles from "./ribbon.module.css";

const Ribbon = ({text}) => {
  return (
    <div className={styles.ribbon}>
      <span className={styles.ribbonInside}>{text}</span>
    </div>
  );
};

export default Ribbon;

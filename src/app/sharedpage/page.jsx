import styles from "./page.module.css";
import Ribbon from "@/components/Ribbon";

const SharedPage = () => {
  return (
    <div className={styles.pageContainer}>
      <Ribbon text="Matalija & Borivoje"></Ribbon>
      <div className={styles.quoteContainer}>
        <p className={styles.quote}>
          Hvala vam što ste deo naše priče i što sa nama delite radost ovog
          dana.
        </p>
      </div>
    </div>
  );
};
export default SharedPage;

import styles from "./page.module.css";
import Ribbon from "@/components/Ribbon";
import ImageGallery from "@/components/ImageGallery";

const SharedPage = () => {
  return (
    <div>
      <div className={styles.ribbonContainer}>
        <Ribbon text="Matalija & Borivoje"></Ribbon>
      </div>

      {/* 
      <div className={styles.quoteContainer}>
        <p className={styles.quote}>
          Hvala vam što ste deo naše priče i što sa nama delite radost ovog
          dana.
        </p>
      </div>
*/}
      <ImageGallery sharedOnly={true} />
    </div>
  );
};
export default SharedPage;

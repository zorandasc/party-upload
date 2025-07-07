import styles from "./page.module.css";
import Ribbon from "@/components/Ribbon";
import ImageGallery from "@/components/ImageGallery";

const SharedPage = () => {
  return (
    <div>
      <div className={styles.ribbonContainer}>
        <Ribbon text="Matalija & Borivoje"></Ribbon>
      </div>

      <ImageGallery sharedOnly={true} />
    </div>
  );
};
export default SharedPage;

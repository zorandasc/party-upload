import styles from "./imagesContainer.module.css";
import { FaSpinner } from "react-icons/fa";
import Image from "next/image";

const ImagesContainer = ({ images }) => {
  return (
    <>
      {images?.length === 0 ? (
        <div className={styles.spinnerContainer}>
          <FaSpinner></FaSpinner>
        </div>
      ) : (
        <section className={styles.uploadedImages}>
          {images?.map((item, i) => (
            <div key={i} className={styles.imageContainer}>
              <Image
                priority
                src={`https://utfs.io/f/${item.key}`}
                alt="Image"
                layout="fill"
                className={styles.image}
                sizes="100%"
                blurDataURL={`https://utfs.io/f/${item.key}`}
                placeholder="blur"
              />
            </div>
          ))}
        </section>
      )}
    </>
  );
};
export default ImagesContainer;

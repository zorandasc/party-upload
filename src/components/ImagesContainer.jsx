import { useState } from "react";
import styles from "./imagesContainer.module.css";
import Image from "next/image";
import ImageModal from "./ImageModal";

const ImagesContainer = ({ images }) => {
  //FOR MODAL IMAGE
  const [selectedImageInfo, setSelectedImageInfo] = useState(null);
  return (
    <>
      <section className={styles.uploadedImages}>
        {images?.map((item, i) => {
          return (
            <div
              key={i}
              className={styles.imageContainer}
              style={{ animationDelay: `${i * 0.1}s` }}
              onClick={() => setSelectedImageInfo(item)}
            >
              <Image
                priority
                src={item.url}
                alt="Image"
                layout="fill"
                className={styles.image}
                sizes="100%"
                blurDataURL={item.url}
                placeholder="blur"
              />
           
            </div>
          );
        })}
      </section>
      <ImageModal
        imageInfo={selectedImageInfo}
        onClose={() => setSelectedImageInfo(null)}
      ></ImageModal>
    </>
  );
};
export default ImagesContainer;

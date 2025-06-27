import { useState } from "react";
import styles from "./imagesContainer.module.css";
import Image from "next/image";
import ImageModal from "./ImageModal";

function extractFirstName(text) {
  if (text) {
    const parts = text.split("-");
    return parts[0];
  }
  return "";
}

const ImagesContainer = ({ images }) => {
  //FOR MODAL IMAGE
  const [selectedImageInfo, setSelectedImageInfo] = useState(null);
  return (
    <>
      <section className={styles.uploadedImages}>
        {images?.map((item, i) => {
          const imageUrl = `https://${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}.ufs.sh/f/${item.key}`;
          const user = extractFirstName(item?.customId);

          return (
            <div
              key={i}
              className={styles.imageContainer}
              style={{ animationDelay: `${i * 0.1}s` }}
              onClick={() => setSelectedImageInfo({ imageUrl, user })}
            >
              <span className={styles.ribbon}>{user}</span>
              <Image
                priority
                src={imageUrl}
                alt="Image"
                layout="fill"
                className={styles.image}
                sizes="100%"
                blurDataURL={imageUrl}
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

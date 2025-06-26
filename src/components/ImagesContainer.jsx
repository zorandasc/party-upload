import { useState } from "react";
import styles from "./imagesContainer.module.css";
import Image from "next/image";
import ImageModal from "./ImageModal";

const ImagesContainer = ({ images }) => {
  //FOR MODAL IMAGE
  const [selectedImage, setSelectedImage] = useState(null);
  return (
    <>
      <section className={styles.uploadedImages}>
        {images?.map((item, i) => {
          const imageUrl = `https://${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}.ufs.sh/f/${item.key}`;
          return (
            <div
              key={i}
              className={styles.imageContainer}
              style={{ animationDelay: `${i * 0.1}s` }}
              onClick={() => setSelectedImage(imageUrl)}
            >
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
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      ></ImageModal>
    </>
  );
};
export default ImagesContainer;

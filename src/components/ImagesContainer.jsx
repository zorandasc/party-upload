import styles from "./imagesContainer.module.css";
import Image from "next/image";

const ImagesContainer = ({ images }) => {
  return (
    <>
      <section className={styles.uploadedImages}>
        {images?.map((item, i) => (
          <div
            key={i}
            className={styles.imageContainer}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <Image
              priority
              src={`https://${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}.ufs.sh/f/${item.key}`}
              alt="Image"
              layout="fill"
              className={styles.image}
              sizes="100%"
              blurDataURL={`https://${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}.ufs.sh/f/${item.key}`}
              placeholder="blur"
            />
          </div>
        ))}
      </section>
    </>
  );
};
export default ImagesContainer;

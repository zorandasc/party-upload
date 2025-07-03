import { useState } from "react";
import styles from "./imagesContainer.module.css";
import Image from "next/image";
import toast from "react-hot-toast";

import ImageModal from "./ImageModal";

const ImagesContainer = ({ images, checkboxMode }) => {
  //FOR MODAL IMAGE
  const [selectedImageInfo, setSelectedImageInfo] = useState(null);

  const handleImageShare = async (e, item) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/share-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: item._id }),
      });

      const data = await res.json();
      if (data.success) {
        console.log("Image set to public");
        toast.success("Slika je Podijeljenja", { icon: "👏" });
      } else {
        console.error("Failed to share image:", data.error);
        toast.error(data.error);
      }
    } catch (err) {
      console.error("Request error:", err);
      toast.error("Request error:", err);
    }
  };

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
              {checkboxMode && (
                <div className={styles.checkboxs}>
                  {checkboxMode === "trash" && (
                    <input
                      type="checkbox"
                      id="trash"
                      name="trash"
                      onClick={(e) => e.stopPropagation()}
                    ></input>
                  )}
                  {!item.public && checkboxMode === "share" && (
                    <input
                      type="checkbox"
                      id="share"
                      name="share"
                      onClick={(e) => handleImageShare(e, item)}
                    ></input>
                  )}
                </div>
              )}
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

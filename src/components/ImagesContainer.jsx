import { useState } from "react";
import styles from "./imagesContainer.module.css";
import Image from "next/image";
import toast from "react-hot-toast";

import ImageModal from "./ImageModal";

const ImagesContainer = ({ images, checkboxMode }) => {
  //FOR MODAL IMAGE
  const [selectedImageInfo, setSelectedImageInfo] = useState(null);

  //FOR LOCAL VISULA CHANGE WHEN SHARE CHECKE/ONCHECK
  //POSTO JE CHECK SAD KONTROLISANA KOMPONENTA
  const [imageState, setImageStates] = useState(images);

  // Function to toggle share (public) state
  const handleToggleShare = async (e, item) => {
    e.stopPropagation();
    const newPublicState = !item.public;
    try {
      const res = await fetch("/api/share-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: item._id, public: newPublicState }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          newPublicState ? "Slika je podijeljena 👏" : "Slika je sakrivena 🙈"
        );

        // Update local state for visual feedback
        setImageStates((prev) =>
          prev.map((img) =>
            img._id === item._id ? { ...img, public: newPublicState } : img
          )
        );
      } else {
        toast.error(data.error || "Greška pri dijeljenju slike");
      }
    } catch (err) {
      console.error("Request error:", err);
      toast.error("Greška pri komunikaciji sa serverom");
    }
  };

  return (
    <>
      <section className={styles.uploadedImages}>
        {imageState?.map((item, i) => {
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
                      style={{ accentColor: "tomato" }}
                      type="checkbox"
                      id="trash"
                      name="trash"
                      onClick={(e) => e.stopPropagation()}
                    ></input>
                  )}
                  {checkboxMode === "share" && (
                    <input
                      style={{ accentColor: "#6c9cc6" }}
                      type="checkbox"
                      id="share"
                      name="share"
                      checked={item.public}
                      onChange={(e) => handleToggleShare(e, item)}
                      onClick={(e) => e.stopPropagation()}
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

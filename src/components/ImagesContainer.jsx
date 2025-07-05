import { useState } from "react";
import styles from "./imagesContainer.module.css";
import Image from "next/image";
import toast from "react-hot-toast";

import ImageModal from "./ImageModal";
import CustomDeleteToast from "./CustomDeleteToast";

import { useImageCount } from "@/context/ImageCountContext";

const ImagesContainer = ({ images, checkboxMode }) => {
  const { setCount } = useImageCount();
  //FOR MODAL IMAGE
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [imagesToDelete, setImagesToDelete] = useState([]);

  //FOR LOCAL VISULA CHANGE WHEN CLICKED SHARE CHECKE/ONCHECK OR DELETETATION
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

  // Function to toggle delete state
  const handleToggleDelete = (e, item) => {
    e.stopPropagation();

    const isChecked = e.target.checked;

    setImagesToDelete((prev) => {
      if (isChecked) {
        return [...prev, { id: item._id, key: item.key }];
      } else {
        return prev.filter((img) => img.id !== item._id);
      }
    });
  };

  //confirm button on delete inside toast
  const confirmDeletion = async () => {
    try {
      const res = await fetch("/api/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imagesToDelete),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`${imagesToDelete.length} slika uspiješno obrisano`);

        //INFORM CONTEXT
        setCount((prev) => prev - imagesToDelete.length);

        // Remove deleted images from UI
        setImageStates((prev) =>
          prev.filter(
            (img) => !imagesToDelete.some((del) => del.id === img._id)
          )
        );

        setImagesToDelete([]); // Reset selected images FOR DELETATION
      } else {
        toast.error(data.error || "Greška pri brisanju slika");
      }
    } catch (error) {
      console.error(error);
      toast.error("Greška na serveru");
    }
  };

  return (
    <>
      <section className={styles.uploadedImages}>
        {imagesToDelete.length > 0 && (
          <CustomDeleteToast
            numberOfImages={imagesToDelete.length}
            handleClick={confirmDeletion}
          ></CustomDeleteToast>
        )}
        {imageState?.map((item, i) => {
          return (
            <div
              key={i}
              className={styles.imageContainer}
              style={{ animationDelay: `${i * 0.1}s` }}
              onClick={() => setSelectedIndex(i)}
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
                      checked={imagesToDelete.some(
                        (img) => img.id === item._id
                      )}
                      onChange={(e) => handleToggleDelete(e, item)}
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
        images={imageState}
        currentIndex={selectedIndex}
        setCurrentIndex={setSelectedIndex}
        onClose={() => setSelectedIndex(null)}
      ></ImageModal>
    </>
  );
};
export default ImagesContainer;

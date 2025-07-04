import { useState, useEffect, useRef } from "react";
import styles from "./imagesContainer.module.css";
import Image from "next/image";
import toast from "react-hot-toast";

import ImageModal from "./ImageModal";

const ImagesContainer = ({ images, checkboxMode }) => {
  //FOR MODAL IMAGE
  const [selectedImageInfo, setSelectedImageInfo] = useState(null);

  const [imagesToDelete, setImagesToDelete] = useState([]);

  //FOR LOCAL VISULA CHANGE WHEN CLICKED SHARE CHECKE/ONCHECK
  //POSTO JE CHECK SADA KONTROLISANA KOMPONENTA
  const [imageState, setImageStates] = useState(images);

  const toastIdRef = useRef(null); // 👈 track the toast

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

  const handelToggleDelete = async (e, item) => {
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

  const deleteImagesAfterConfirm = async (id) => {
    try {
      const res = await fetch("/api/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imagesToDelete),
      });

      const data = await res.json();

      if (res.ok) {
        // Remove deleted images from UI
        setImageStates((prev) =>
          prev.filter(
            (img) => !imagesToDelete.some((del) => del.id === img._id)
          )
        );

        setImagesToDelete([]); // Reset selected images

        ////DISSMIS TOAST Dismiss custom toast manually
        if (toastIdRef.current) {
          toast.dismiss(toastIdRef.current);
          toastIdRef.current = null;
        }

        // Show success toast separately
        setTimeout(() => {
          toast.success("Slike su obrisane", {
            id: "delete-success",
            duration: 4000,
          });
        }, 1000); // slight delay to avoid conflict
      } else {
        toast.error(data.error || "Greška pri brisanju slika");
      }
    } catch (error) {
      console.error(err);
      toast.error("Greška na serveru");
    }
  };

  //USEEFFECT TO DISPLAY TOAST, WITH CONFIRM DELETE NOTIFICATION
  useEffect(() => {
    //PRIKAZI TOAST SAMO NA PRVI DELETE CHECKBOX
    if (imagesToDelete.length === 1 && toastIdRef.current === null) {
      const toastId = toast.custom(
        (t) => (
          <div
            style={{
              marginTop: "2rem",
              padding: "1rem",
              borderRadius: "30px 30px 0 0",
              background: "rgba(255, 255, 255, 0.34)",
              backdropFilter: "blur(7.1px)",

              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.91)",
            }}
          >
            <b>Slike označene za brisanje</b>
            <div style={{ marginTop: "0.5rem" }}>
              <button
                onClick={() => deleteImagesAfterConfirm(t.id)}
                style={{
                  backgroundColor: "tomato",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  marginTop: "0.5rem",
                }}
              >
                Potvrdi brisanje
              </button>
            </div>
          </div>
        ),
        { duration: 90000 }
      );
      //TRACK THE TOAST
      toastIdRef.current = toastId;
    }

    //DISSMIS TOAST KADA JE PRZAZAN imagesToDelete[]
    if (imagesToDelete.length === 0 && toastIdRef.current !== null) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
  }, [imagesToDelete]);

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
                      checked={imagesToDelete.some(
                        (img) => img.id === item._id
                      )}
                      onChange={(e) => handelToggleDelete(e, item)}
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

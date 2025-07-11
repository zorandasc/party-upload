"use client";

import styles from "./imageModal.module.css";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { FaTimes } from "react-icons/fa";

export default function ImageModal({
  images,
  currentIndex,
  setCurrentIndex,
  onClose,
}) {
  //RECORD WHERE TAOUCH START ACRROSS RENDER
  const touchStartX = useRef(null);

  //SAVE FIRST TOUCH
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  //RECORD WHER TOUCH ENDS
  //Positive deltaX → finger moved right → show previous image.
  //Negative deltaX → finger moved left → show next image.
  //Threshold (50): Prevents accidental swipes.
  //User must move their finger at least 50px for it to count as a swipe.
  const handleTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 50 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1); // Swipe right → previous
    } else if (deltaX < -50 && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1); // Swipe left → next
    }
  };

  //FOR KEYBORD ARROW LEFT/RIGHT
  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight" && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (e.key === "ArrowLeft" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  //ATTACH KEYBOARD LISTENER
  //register the listener when the modal is shown:
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex]);

  if (currentIndex === null || !images[currentIndex]) return null;

  const imageInfo = images[currentIndex];

  console.log("imageInfo", imageInfo);

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
        <div className={styles.imageInfo}>
          <span className={styles.user}>
            <i>Od:</i> {imageInfo.userId}
          </span>
          <span className={styles.user}>
            {" "}
            {new Date(imageInfo.uploadedAt).toLocaleString()}
          </span>
        </div>
        <Image
          priority
          src={imageInfo.url}
          alt="Image"
          fill
          sizes="80vw"
          className={styles.modalImage}
        />
      </div>
    </div>
  );
}

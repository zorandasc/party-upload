"use client";

import styles from "./imageModal.module.css";
import Image from "next/image";
import { FaTimes } from "react-icons/fa";

export default function ImageModal({ imageInfo, onClose }) {
  if (!imageInfo) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
        <span className={styles.user}><i>od:</i> {imageInfo.user}</span>
        <Image
          priority
          src={imageInfo.imageUrl}
          alt="Image"
          fill
          sizes="80vw"
          className={styles.modalImage}
          blurDataURL={imageInfo.imageUrl}
          placeholder="blur"
        />
      </div>
    </div>
  );
}

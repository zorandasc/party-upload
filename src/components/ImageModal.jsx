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
        <div className={styles.imageInfo}>
          <span className={styles.user}>
            <i>Od:</i> {imageInfo.userId}
          </span>
          <span className={styles.user}>{imageInfo.uploadedAt}</span>
        </div>
        <Image
          priority
          src={imageInfo.url}
          alt="Image"
          fill
          sizes="80vw"
          className={styles.modalImage}
          blurDataURL={imageInfo.url}
          placeholder="blur"
        />
      </div>
    </div>
  );
}
